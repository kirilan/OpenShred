from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class EmailScanBase(BaseModel):
    gmail_message_id: str
    sender_email: str
    sender_domain: str
    subject: Optional[str] = None
    is_broker_email: bool = False
    confidence_score: Optional[float] = None


class EmailScan(EmailScanBase):
    id: str
    user_id: str
    broker_id: Optional[str] = None
    recipient_email: Optional[str] = None
    received_date: Optional[datetime] = None
    classification_notes: Optional[str] = None
    body_preview: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ScanRequest(BaseModel):
    days_back: int = 90
    max_emails: int = 100


class ScanResult(BaseModel):
    message: str
    total_scanned: int
    broker_emails_found: int
    scans: list[EmailScan]
