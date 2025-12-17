from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.auth import AuthStatus
from app.services.gmail_service import GmailService

router = APIRouter()
gmail_service = GmailService()


@router.get("/login")
def login():
    """Initiate OAuth login flow"""
    authorization_url, state = gmail_service.get_authorization_url()

    return {
        "authorization_url": authorization_url,
        "state": state
    }


@router.get("/callback")
def oauth_callback(
    code: str,
    state: str = None,
    db: Session = Depends(get_db)
):
    """Handle OAuth callback from Google"""
    try:
        # Exchange code for tokens
        token_data = gmail_service.exchange_code_for_tokens(code, state)

        # Create temporary credentials to get user info
        from google.oauth2.credentials import Credentials
        temp_credentials = Credentials(
            token=token_data['access_token'],
            refresh_token=token_data['refresh_token'],
            token_uri=token_data['token_uri'],
            client_id=token_data['client_id'],
            client_secret=token_data['client_secret'],
            scopes=token_data['scopes']
        )

        # Get user info
        user_info = gmail_service.get_user_info(temp_credentials)

        # Check if user exists
        user = db.query(User).filter(User.google_id == user_info['id']).first()

        if not user:
            # Create new user
            user = User(
                email=user_info['email'],
                google_id=user_info['id']
            )
            db.add(user)

        # Update tokens
        user.set_access_token(token_data['access_token'])
        user.set_refresh_token(token_data['refresh_token'])

        db.commit()
        db.refresh(user)

        # Redirect to frontend callback with user data
        callback_url = f"{settings.frontend_url}/oauth-callback?user_id={str(user.id)}&email={user.email}"
        return RedirectResponse(url=callback_url)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")


@router.get("/status", response_model=AuthStatus)
def auth_status(user_id: str = None, db: Session = Depends(get_db)):
    """Check authentication status for a user"""
    if not user_id:
        return AuthStatus(
            is_authenticated=False,
            user=None,
            message="No user ID provided"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return AuthStatus(
            is_authenticated=False,
            user=None,
            message="User not found"
        )

    if not user.encrypted_access_token or not user.encrypted_refresh_token:
        return AuthStatus(
            is_authenticated=False,
            user=None,
            message="User not authenticated"
        )

    from app.schemas.auth import User as UserSchema
    return AuthStatus(
        is_authenticated=True,
        user=UserSchema(
            id=str(user.id),
            email=user.email,
            google_id=user.google_id,
            created_at=user.created_at,
            updated_at=user.updated_at
        ),
        message="User is authenticated"
    )
