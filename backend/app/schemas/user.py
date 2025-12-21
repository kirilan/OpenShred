from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserSummary(BaseModel):
    id: str
    email: EmailStr
    google_id: str
    is_admin: bool
    last_scan_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserRoleUpdate(BaseModel):
    is_admin: bool


class TokenRevokeResponse(BaseModel):
    message: str
