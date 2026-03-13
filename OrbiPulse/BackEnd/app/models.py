from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Plot(Base):
    __tablename__ = "plots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    farmer_id = Column(String, index=True)  # Placeholder for authentication
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    valves = relationship("Valve", back_populates="plot")

class Valve(Base):
    __tablename__ = "valves"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True)
    model_number = Column(String)
    plot_id = Column(Integer, ForeignKey("plots.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    installed_at = Column(DateTime(timezone=True), server_default=func.now())
    valve_flow = Column(Float, default=0.0)  # For manual flow control

    plot = relationship("Plot", back_populates="valves")
    telemetry = relationship("Telemetry", back_populates="valve")
    alerts = relationship("Alert", back_populates="valve")

class Telemetry(Base):
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

    valve = relationship("Valve", back_populates="telemetry")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, ForeignKey("valves.device_id"))
    alert_type = Column(String)
    message = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    resolved = Column(Integer, default=0)  # 0: active, 1: resolved

    valve = relationship("Valve", back_populates="alerts")