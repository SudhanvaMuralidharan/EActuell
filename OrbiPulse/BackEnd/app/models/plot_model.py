from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Plot(Base):
    __tablename__ = "plots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    farmer_id = Column(String, index=True)  # Links to User.id
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    valves = relationship("ValveModel", back_populates="plot", cascade="all, delete-orphan")
