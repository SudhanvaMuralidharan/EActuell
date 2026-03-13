from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from ..database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)  # Supabase user ID (UUID)
    email = Column(String, unique=True, index=True)
    farmer_name = Column(String)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
