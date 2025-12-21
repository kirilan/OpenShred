from datetime import datetime

from pydantic import BaseModel


class EmailScanBase(BaseModel):
    gmail_message_id: str
    sender_email: str
    sender_domain: str
    subject: str | None = None
    is_broker_email: bool = False
    confidence_score: float | None = None


class EmailScan(EmailScanBase):
    id: str
    user_id: str
    broker_id: str | None = None
    recipient_email: str | None = None
    received_date: datetime | None = None
    classification_notes: str | None = None
    body_preview: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ScanRequest(BaseModel):
    days_back: int = 1
    max_emails: int = 100


class ScanResult(BaseModel):
    message: str
    total_scanned: int
    broker_emails_found: int
    scans: list[EmailScan]


class EmailScanPage(BaseModel):
    items: list[EmailScan]
    total: int
    limit: int
    offset: int


class ScanHistoryEntry(BaseModel):
    id: str
    performed_at: datetime
    scan_type: str
    source: str
    days_back: Optional[int] = None
    max_emails: Optional[int] = None
    total_scanned: Optional[int] = None
    broker_emails_found: Optional[int] = None
    sent_requests_scanned: Optional[int] = None
    responses_found: Optional[int] = None
    responses_updated: Optional[int] = None
    requests_updated: Optional[int] = None
    message: str


class ScanHistoryPage(BaseModel):
    items: list[ScanHistoryEntry]
    total: int
    limit: int
    offset: int
