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


# ---------------------------------------------------------------------------
# OTP & Profile Flow
# ---------------------------------------------------------------------------

# In-memory store for OTPs
_OTP_DB: dict[str, str] = {}


def send_otp(phone: str) -> dict:
    """
    Simulate sending an OTP. In production, connect to Twilio or similar.
    Hardcodes to '123456' for easy testing.
    """
    _OTP_DB[phone] = "123456"
    return {
        "success": True,
        "message": f"OTP sent to {phone}. Use '123456' for testing."
    }


def verify_otp(phone: str, otp: str) -> dict:
    if phone not in _OTP_DB or _OTP_DB[phone] != otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    # In a real app, delete or expire the OTP here
    # del _OTP_DB[phone]

    # Check if a user exists with this phone number
    user = None
    for u in _USERS_DB.values():
        if u.phone_number == phone:
            user = u
            break

    if user:
        # Existing user, log them in
        token = _create_access_token({"sub": user.username, "uid": user.id})
        return {
            "success": True,
            "token": token,
            "user": UserPublic(
                id=user.id,
                username=user.username,
                email=user.email,
                full_name=user.full_name,
                phone_number=user.phone_number,
                is_active=user.is_active,
            )
        }

    # New user need to complete profile
    return {
        "success": True,
        "message": "OTP verified successfully. Please complete your profile."
    }


def create_farmer_profile(phone: str, name: str, profile_image: Optional[str] = None) -> dict:
    # Use phone as username if not provided
    username = phone
    
    # Check if a user exists with this phone number
    for u in _USERS_DB.values():
        if u.phone_number == phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this phone number already exists",
            )
            
    uid = str(uuid.uuid4())
    user = UserInDB(
        id=uid,
        username=username,
        email=None,
        full_name=name,
        phone_number=phone,
        hashed_password=pwd_context.hash("default_password"), # Not used since login is via OTP
    )
    
    _USERS_DB[username] = user
    
    token = _create_access_token({"sub": user.username, "uid": user.id})
    return {
        "success": True,
        "token": token,
        "user": UserPublic(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            phone_number=user.phone_number,
            is_active=user.is_active,
        )
    }