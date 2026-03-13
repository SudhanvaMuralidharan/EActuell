from sqlalchemy.orm import Session
from ..models.user_model import User
from ..schemas import UserCreate
from typing import Optional

class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_user(self, user: UserCreate) -> User:
        """Create new user"""
        db_user = User(
            email=user.email,
            farmer_name=user.farmer_name,
            phone=user.phone
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by Supabase ID"""
        return self.db.query(User).filter(User.id == user_id).first()
