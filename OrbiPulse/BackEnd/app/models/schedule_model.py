from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, ForeignKey("valves.device_id"))
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer)
    flow_percentage = Column(Float, default=100.0)
    enabled = Column(Boolean, default=True)
    days_of_week = Column(String)  # JSON string: [0,1,2,3,4,5,6]
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    valve = relationship("ValveModel", back_populates="schedules")
