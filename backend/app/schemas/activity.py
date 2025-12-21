from datetime import datetime

from pydantic import BaseModel

from app.models.activity_log import ActivityType


class ActivityLogResponse(BaseModel):
    id: str
    user_id: str
    activity_type: ActivityType
    message: str
    details: str | None = None
    broker_id: str | None = None
    deletion_request_id: str | None = None
    response_id: str | None = None
    email_scan_id: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
