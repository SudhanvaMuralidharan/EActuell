from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserInDB(UserBase):
    id: str
    hashed_password: str
    is_active: bool = True


class UserPublic(UserBase):
    id: str
    is_active: bool

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class SendOtpRequest(BaseModel):
    phone: str


class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str


class FarmerProfileRequest(BaseModel):
    phone: str
    name: str
    profile_image: Optional[str] = None


class AuthResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    user: Optional[UserPublic] = None
    message: Optional[str] = None