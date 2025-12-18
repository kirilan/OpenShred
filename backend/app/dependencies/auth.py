from datetime import datetime, timezone, timedelta
from typing import Optional

import jwt
from fastapi import Depends, Header, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User

ALGORITHM = "HS256"


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )
    return payload


def get_current_user(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
        )

    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication payload",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # Optional token revocation: ensure tokens still stored
    if not user.encrypted_access_token or not user.encrypted_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User must re-authenticate",
        )

    return user


def ensure_user_matches(
    user_id: str = Query(..., alias="user_id"),
    current_user: User = Depends(get_current_user),
) -> User:
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this resource",
        )
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


def create_access_token(
    *,
    subject: str,
    email: str,
    is_admin: bool,
    expires_delta_seconds: int = 60 * 60 * 12,
) -> str:
    expire = datetime.now(tz=timezone.utc) + timedelta(seconds=expires_delta_seconds)
    payload = {
        "sub": subject,
        "email": email,
        "is_admin": is_admin,
        "exp": expire,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)
