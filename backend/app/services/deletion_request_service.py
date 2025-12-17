from datetime import datetime
from typing import List
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.data_broker import DataBroker
from app.models.deletion_request import DeletionRequest, RequestStatus
from app.utils.email_templates import EmailTemplates


class DeletionRequestService:
    def __init__(self, db: Session):
        self.db = db
        self.templates = EmailTemplates()

    def create_request(
        self,
        user: User,
        broker: DataBroker,
        framework: str = "GDPR/CCPA"
    ) -> DeletionRequest:
        """Create a deletion request for a specific broker"""

        # Check if request already exists
        existing = self.db.query(DeletionRequest).filter(
            DeletionRequest.user_id == user.id,
            DeletionRequest.broker_id == broker.id
        ).first()

        if existing:
            raise Exception(f"Deletion request already exists for {broker.name}")

        # Generate email
        subject, body = self.templates.generate_deletion_request_email(
            user.email,
            broker.name,
            framework
        )

        # Create request
        request = DeletionRequest(
            user_id=user.id,
            broker_id=broker.id,
            status=RequestStatus.PENDING,
            generated_email_subject=subject,
            generated_email_body=body
        )

        self.db.add(request)
        self.db.commit()
        self.db.refresh(request)

        return request

    def get_user_requests(self, user_id: str) -> List[DeletionRequest]:
        """Get all deletion requests for a user"""
        return self.db.query(DeletionRequest).filter(
            DeletionRequest.user_id == user_id
        ).order_by(DeletionRequest.created_at.desc()).all()

    def get_request_by_id(self, request_id: str) -> DeletionRequest:
        """Get a specific deletion request"""
        return self.db.query(DeletionRequest).filter(
            DeletionRequest.id == request_id
        ).first()

    def update_request_status(
        self,
        request_id: str,
        status: RequestStatus,
        notes: str = None
    ) -> DeletionRequest:
        """Update the status of a deletion request"""
        request = self.get_request_by_id(request_id)

        if not request:
            raise Exception("Request not found")

        request.status = status

        if notes:
            request.notes = notes

        # Update timestamps based on status
        if status == RequestStatus.SENT:
            request.sent_at = datetime.utcnow()
        elif status == RequestStatus.CONFIRMED:
            request.confirmed_at = datetime.utcnow()
        elif status == RequestStatus.REJECTED:
            request.rejected_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(request)

        return request

    def send_request_email(
        self,
        request_id: str,
        gmail_service
    ) -> DeletionRequest:
        """
        Send deletion request email via Gmail

        Args:
            request_id: ID of the deletion request to send
            gmail_service: GmailService instance

        Returns:
            Updated DeletionRequest with sent_at timestamp and gmail_message_id

        Raises:
            Exception: If request not found, already sent, or send fails
            PermissionError: If user lacks gmail.send permission
        """
        request = self.get_request_by_id(request_id)
        if not request:
            raise Exception("Request not found")

        if request.status != RequestStatus.PENDING:
            raise Exception(f"Cannot send request with status: {request.status}")

        # Get user and broker
        user = self.db.query(User).filter(User.id == request.user_id).first()
        broker = self.db.query(DataBroker).filter(DataBroker.id == request.broker_id).first()

        if not broker.privacy_email:
            raise Exception(f"Broker {broker.name} has no privacy email configured")

        # Increment send attempts
        request.send_attempts += 1

        # Send email
        try:
            result = gmail_service.send_email(
                user=user,
                to_email=broker.privacy_email,
                subject=request.generated_email_subject,
                body=request.generated_email_body
            )

            # Update request
            request.status = RequestStatus.SENT
            request.sent_at = datetime.utcnow()
            request.gmail_sent_message_id = result['message_id']
            request.gmail_thread_id = result.get('thread_id')
            request.last_send_error = None  # Clear any previous errors

            self.db.commit()
            self.db.refresh(request)

            return request

        except PermissionError as e:
            # User needs to re-authorize
            request.last_send_error = str(e)
            self.db.commit()
            raise PermissionError("Insufficient permissions. Please re-authorize with gmail.send scope")
        except Exception as e:
            # Log the error but don't change status
            request.last_send_error = str(e)
            self.db.commit()
            raise Exception(f"Failed to send email: {str(e)}")
