from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from config.database import Base


class ValveDB(Base):
    """Maps to network.valves — matches the ACTUAL Supabase schema."""
    __tablename__ = "valves"
    __table_args__ = {"schema": "network"}

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True, nullable=False)
    gateway_id = Column(String)
    zone = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    valve_position = Column(Integer, default=0)       # 0-100
    battery_voltage = Column(Float)
    motor_current = Column(Float)
    temperature = Column(Float)
    signal_strength = Column(Integer)
    status = Column(String, default="unknown")


class TelemetryDB(Base):
    """Maps to telemetry.device_telemetry — matches the ACTUAL Supabase schema."""
    __tablename__ = "device_telemetry"
    __table_args__ = {"schema": "telemetry"}

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True, nullable=False)
    position = Column(Integer)
    motor_current = Column(Float)
    temperature = Column(Float)
    battery_voltage = Column(Float)
    flow_rate = Column(Float)
    pressure = Column(Float)
    timestamp = Column(DateTime, server_default=func.now())


class ScheduleDB(Base):
    """Schedules — stored locally or in a network.schedules table."""
    __tablename__ = "schedules"
    __table_args__ = {"schema": "network", "extend_existing": True}

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
