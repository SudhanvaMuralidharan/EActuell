from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from models.user_model import (
    LoginRequest, TokenResponse, UserPublic,
    SendOtpRequest, VerifyOtpRequest, FarmerProfileRequest, AuthResponse
)
from services.auth_service import (
    login, get_current_user, oauth2_scheme,
    send_otp, verify_otp, create_farmer_profile
)

router = APIRouter(tags=["Authentication"])


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and receive JWT token",
)
def login_endpoint(data: LoginRequest):
    """
    Authenticate with **username** + **password**.

    Demo credentials:
    - `farmer1` / `pass123`
    - `farmer2` / `pass123`
    """
    return login(data.username, data.password)


@router.post(
    "/login/form",
    response_model=TokenResponse,
    summary="Login via OAuth2 form (for Swagger UI)",
    include_in_schema=True,
)
def login_form(form: OAuth2PasswordRequestForm = Depends()):
    """OAuth2-compatible form login for use with the Swagger 'Authorize' button."""
    return login(form.username, form.password)


@router.get(
    "/me",
    response_model=UserPublic,
    summary="Get current authenticated user",
)
def get_me(token: str = Depends(oauth2_scheme)):
    return get_current_user(token)


# ---------------------------------------------------------------------------
# OTP & Field-App Features
# ---------------------------------------------------------------------------

@router.post(
    "/auth/send-otp",
    response_model=AuthResponse,
    summary="Send OTP to phone number"
)
def api_send_otp(data: SendOtpRequest):
    return send_otp(data.phone)


@router.post(
    "/auth/verify-otp",
    response_model=AuthResponse,
    summary="Verify OTP and login"
)
def api_verify_otp(data: VerifyOtpRequest):
    return verify_otp(data.phone, data.otp)


@router.post(
    "/farmers/profile",
    response_model=AuthResponse,
    summary="Create farmer profile after OTP verification"
)
def api_create_farmer_profile(data: FarmerProfileRequest):
    return create_farmer_profile(data.phone, data.name, data.profile_image)

