from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from config.database import Base

class ValveDB(Base):
    __tablename__ = "valves"
    __table_args__ = {"schema": "network"}

    id = Column(String, primary_key=True, index=True)
    plot_id = Column(String, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    model_number = Column(String)
    status = Column(String, default="unknown")
    installed_at = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)

class TelemetryDB(Base):
    __tablename__ = "device_telemetry"
    __table_args__ = {"schema": "telemetry"}

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True, nullable=False)
    position = Column(Integer)
    motor_current = Column(Float)
    temperature = Column(Float)
    battery_voltage = Column(Float)
    flow_rate = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class ScheduleDB(Base):
    __tablename__ = "schedules"
    __table_args__ = {"schema": "network"}

    id = Column(String, primary_key=True, index=True)
    valve_id = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    days = Column(JSON, nullable=False)
    preset = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_run = Column(DateTime(timezone=True))
    next_run = Column(DateTime(timezone=True))
