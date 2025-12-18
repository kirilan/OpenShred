from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.deletion_request import RequestStatus
from app.models.activity_log import ActivityType
from app.schemas.request import (
    DeletionRequestCreate,
    DeletionRequestUpdate,
    DeletionRequest,
    EmailPreview
)
from app.services.deletion_request_service import DeletionRequestService
from app.services.broker_service import BrokerService
from app.services.activity_log_service import ActivityLogService

router = APIRouter()


@router.post("/", response_model=DeletionRequest)
def create_deletion_request(
    user_id: str,
    request: DeletionRequestCreate,
    db: Session = Depends(get_db)
):
    """Create a new deletion request"""

    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get broker
    broker_service = BrokerService(db)
    broker = broker_service.get_broker_by_id(request.broker_id)
    if not broker:
        raise HTTPException(status_code=404, detail="Broker not found")

    # Create request
    service = DeletionRequestService(db)
    activity_service = ActivityLogService(db)

    try:
        deletion_request = service.create_request(user, broker, request.framework)

        # Log activity
        activity_service.log_activity(
            user_id=user_id,
            activity_type=ActivityType.REQUEST_CREATED,
            message=f"Created deletion request for {broker.name}",
            broker_id=request.broker_id,
            deletion_request_id=str(deletion_request.id)
        )

        return DeletionRequest(
            id=str(deletion_request.id),
            user_id=str(deletion_request.user_id),
            broker_id=str(deletion_request.broker_id),
            status=deletion_request.status.value,
            generated_email_subject=deletion_request.generated_email_subject,
            generated_email_body=deletion_request.generated_email_body,
            sent_at=deletion_request.sent_at,
            confirmed_at=deletion_request.confirmed_at,
            rejected_at=deletion_request.rejected_at,
            notes=deletion_request.notes,
            created_at=deletion_request.created_at,
            updated_at=deletion_request.updated_at
        )

    except Exception as e:
        # Log error
        activity_service.log_activity(
            user_id=user_id,
            activity_type=ActivityType.ERROR,
            message=f"Failed to create deletion request for {broker.name}",
            details=str(e),
            broker_id=request.broker_id
        )
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[DeletionRequest])
def list_deletion_requests(
    user_id: str,
    db: Session = Depends(get_db)
):
    """List all deletion requests for a user"""

    service = DeletionRequestService(db)
    requests = service.get_user_requests(user_id)

    return [
        DeletionRequest(
            id=str(req.id),
            user_id=str(req.user_id),
            broker_id=str(req.broker_id),
            status=req.status.value,
            generated_email_subject=req.generated_email_subject,
            generated_email_body=req.generated_email_body,
            sent_at=req.sent_at,
            confirmed_at=req.confirmed_at,
            rejected_at=req.rejected_at,
            notes=req.notes,
            created_at=req.created_at,
            updated_at=req.updated_at
        )
        for req in requests
    ]


@router.get("/{request_id}", response_model=DeletionRequest)
def get_deletion_request(
    request_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific deletion request"""

    service = DeletionRequestService(db)
    req = service.get_request_by_id(request_id)

    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    return DeletionRequest(
        id=str(req.id),
        user_id=str(req.user_id),
        broker_id=str(req.broker_id),
        status=req.status.value,
        generated_email_subject=req.generated_email_subject,
        generated_email_body=req.generated_email_body,
        sent_at=req.sent_at,
        confirmed_at=req.confirmed_at,
        rejected_at=req.rejected_at,
        notes=req.notes,
        created_at=req.created_at,
        updated_at=req.updated_at
    )


@router.put("/{request_id}/status", response_model=DeletionRequest)
def update_request_status(
    request_id: str,
    update: DeletionRequestUpdate,
    db: Session = Depends(get_db)
):
    """Update the status of a deletion request"""

    service = DeletionRequestService(db)

    try:
        status = RequestStatus(update.status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {update.status}")

    try:
        req = service.update_request_status(request_id, status, update.notes)

        return DeletionRequest(
            id=str(req.id),
            user_id=str(req.user_id),
            broker_id=str(req.broker_id),
            status=req.status.value,
            generated_email_subject=req.generated_email_subject,
            generated_email_body=req.generated_email_body,
            sent_at=req.sent_at,
            confirmed_at=req.confirmed_at,
            rejected_at=req.rejected_at,
            notes=req.notes,
            created_at=req.created_at,
            updated_at=req.updated_at
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{request_id}/email-preview", response_model=EmailPreview)
def preview_deletion_email(
    request_id: str,
    db: Session = Depends(get_db)
):
    """Get email preview for a deletion request"""

    service = DeletionRequestService(db)
    req = service.get_request_by_id(request_id)

    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    # Get broker for additional info
    broker_service = BrokerService(db)
    broker = broker_service.get_broker_by_id(str(req.broker_id))

    return EmailPreview(
        subject=req.generated_email_subject,
        body=req.generated_email_body,
        to_email=broker.privacy_email if broker else None,
        broker_name=broker.name if broker else "Unknown"
    )


@router.post("/{request_id}/send", response_model=DeletionRequest)
def send_deletion_request(
    request_id: str,
    db: Session = Depends(get_db)
):
    """Send a deletion request email via Gmail"""
    from app.services.gmail_service import GmailService

    service = DeletionRequestService(db)
    gmail_service = GmailService()
    activity_service = ActivityLogService(db)

    try:
        req = service.send_request_email(request_id, gmail_service)

        # Get broker for logging
        broker_service = BrokerService(db)
        broker = broker_service.get_broker_by_id(str(req.broker_id))

        # Log activity
        activity_service.log_activity(
            user_id=str(req.user_id),
            activity_type=ActivityType.REQUEST_SENT,
            message=f"Sent deletion request to {broker.name if broker else 'broker'}",
            broker_id=str(req.broker_id),
            deletion_request_id=request_id
        )

        return DeletionRequest(
            id=str(req.id),
            user_id=str(req.user_id),
            broker_id=str(req.broker_id),
            status=req.status.value,
            generated_email_subject=req.generated_email_subject,
            generated_email_body=req.generated_email_body,
            sent_at=req.sent_at,
            confirmed_at=req.confirmed_at,
            rejected_at=req.rejected_at,
            notes=req.notes,
            created_at=req.created_at,
            updated_at=req.updated_at
        )

    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        # Log error
        try:
            req = service.get_request_by_id(request_id)
            if req:
                broker_service = BrokerService(db)
                broker = broker_service.get_broker_by_id(str(req.broker_id))
                activity_service.log_activity(
                    user_id=str(req.user_id),
                    activity_type=ActivityType.ERROR,
                    message=f"Failed to send deletion request to {broker.name if broker else 'broker'}",
                    details=str(e),
                    broker_id=str(req.broker_id),
                    deletion_request_id=request_id
                )
        except Exception:
            pass  # Don't fail on logging errors
        raise HTTPException(status_code=400, detail=str(e))
