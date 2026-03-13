from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class TelemetryModel(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), index=True)
    device_id = Column(String, ForeignKey("valves.device_id"))
    valve_position = Column(Float)
    battery_voltage = Column(Float)
    motor_current = Column(Float)
    temperature = Column(Float)
    signal_strength = Column(Float)
    status = Column(String)

    valve = relationship("ValveModel", back_populates="telemetry")
