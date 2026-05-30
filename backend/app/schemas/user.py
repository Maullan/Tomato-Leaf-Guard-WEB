# app/schemas/user.py
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    """Schema untuk request REGISTER"""
    email: EmailStr
    full_name: str
    password: str

    @field_validator("password")
    @classmethod
    def password_must_be_strong(cls, v):
        if len(v) < 8:
            raise ValueError("Password minimal 8 karakter")
        return v

    @field_validator("full_name")
    @classmethod
    def full_name_must_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Nama tidak boleh kosong")
        return v.strip()


class UserLogin(BaseModel):
    """Schema untuk request LOGIN"""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema untuk UPDATE profile"""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None

    @field_validator("full_name")
    @classmethod
    def full_name_not_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Nama tidak boleh kosong")
        return v.strip() if v else v


class UserResponse(BaseModel):
    """Schema untuk RESPONSE data user (tidak include password!)"""
    id: uuid.UUID
    email: str
    full_name: str
    phone: Optional[str] = None
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema untuk response JWT token"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Schema untuk data di dalam JWT payload"""
    user_id: str | None = None


class ForgotPasswordRequest(BaseModel):
    """Schema untuk request forgot password"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Schema untuk request reset password"""
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_must_be_strong(cls, v):
        if len(v) < 8:
            raise ValueError("Password minimal 8 karakter")
        return v


class UserStatsResponse(BaseModel):
    """Schema untuk statistik user di profile"""
    total_scan: int
    total_diseases: int
    success_rate: float