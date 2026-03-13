import uuid
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from config.settings import get_settings
from models.user_model import UserInDB, UserPublic, TokenResponse

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login/form")

# ---------------------------------------------------------------------------
# In-memory user store (replace with DB in production)
# ---------------------------------------------------------------------------
_USERS_DB: dict[str, UserInDB] = {}


def _seed_demo_users():
    """Seed demo users so the app works out of the box."""
    demo = [
        {
            "username": "farmer1",
            "email": "farmer1@orbipulse.io",
            "full_name": "Ahmed Al-Rashid",
            "phone_number": "+971501234567",
            "password": "pass123",
        },
        {
            "username": "farmer2",
            "email": "farmer2@orbipulse.io",
            "full_name": "Sara Hassan",
            "phone_number": "+971509876543",
            "password": "pass123",
        },
    ]

    for d in demo:
        uid = str(uuid.uuid4())
        _USERS_DB[d["username"]] = UserInDB(
            id=uid,
            username=d["username"],
            email=d["email"],
            full_name=d["full_name"],
            phone_number=d["phone_number"],
            hashed_password=pwd_context.hash(d["password"]),
        )


_seed_demo_users()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def _create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def login(username: str, password: str) -> TokenResponse:
    user = _USERS_DB.get(username)

    if not user or not _verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    token = _create_access_token({"sub": user.username, "uid": user.id})

    return TokenResponse(
        access_token=token,
        user=UserPublic(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            phone_number=user.phone_number,
            is_active=user.is_active,
        ),
    )


def get_current_user(token: str) -> UserPublic:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        username: str = payload.get("sub")

        if username is None:
            raise credentials_exc

    except JWTError:
        raise credentials_exc

    user = _USERS_DB.get(username)

    if user is None:
        raise credentials_exc

    return UserPublic(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        phone_number=user.phone_number,
        is_active=user.is_active,
    )