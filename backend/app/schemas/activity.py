from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.activity_log import ActivityType


class ActivityLogResponse(BaseModel):
    id: str
    user_id: str
    activity_type: ActivityType
    message: str
    details: Optional[str] = None
    broker_id: Optional[str] = None
    deletion_request_id: Optional[str] = None
    response_id: Optional[str] = None
    email_scan_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
