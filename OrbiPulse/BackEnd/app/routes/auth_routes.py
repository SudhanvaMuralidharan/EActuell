from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.auth_service import AuthService
from ..schemas import UserCreate, LoginRequest, TokenResponse
import os

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=dict)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register new user"""
    auth_service = AuthService(db)
    
    # Check if user exists
    existing = auth_service.get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user (in production, integrate with Supabase Auth)
    db_user = auth_service.create_user(user)
    
    return {"message": "User created successfully", "user_id": db_user.id}

@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Login user"""
    # This should integrate with Supabase Auth
    # For now, placeholder
    raise HTTPException(status_code=501, detail="Use Supabase Auth for login")

@router.get("/me")
def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Get current authenticated user"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    # Validate token with Supabase
    # Placeholder - implement Supabase client
    raise HTTPException(status_code=501, detail="Supabase auth not configured")
