from datetime import datetime

from pydantic import BaseModel, EmailStr


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
    user: User | None = None
    message: str
    token: str | None = None
