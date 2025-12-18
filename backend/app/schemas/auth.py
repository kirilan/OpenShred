from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    google_id: str


class User(UserBase):
    id: str
    google_id: str
    is_admin: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AuthStatus(BaseModel):
    is_authenticated: bool
    user: Optional[User] = None
    message: str
    token: Optional[str] = None
