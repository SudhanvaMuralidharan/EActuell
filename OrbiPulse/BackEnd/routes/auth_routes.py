from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from models.user_model import LoginRequest, TokenResponse, UserPublic
from services.auth_service import login, get_current_user, oauth2_scheme

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
