from datetime import datetime

from pydantic import BaseModel


class BrokerResponseBase(BaseModel):
    gmail_message_id: str
    gmail_thread_id: str | None = None
    sender_email: str
    subject: str | None = None
    body_text: str | None = None
    received_date: datetime | None = None
    response_type: str  # 'confirmation', 'rejection', 'acknowledgment', 'action_required', 'request_info', 'unknown'
    confidence_score: float | None = None
    matched_by: str | None = None


class BrokerResponse(BrokerResponseBase):
    id: str
    user_id: str
    deletion_request_id: str | None = None
    is_processed: bool
    processed_at: datetime | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ScanResponsesRequest(BaseModel):
    days_back: int = 7
