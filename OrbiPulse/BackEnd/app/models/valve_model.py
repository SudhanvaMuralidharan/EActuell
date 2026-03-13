from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class ValveModel(Base):
    __tablename__ = "valves"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True)
    model_number = Column(String)
    plot_id = Column(Integer, ForeignKey("plots.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    installed_at = Column(DateTime(timezone=True), server_default=func.now())
    valve_flow = Column(Float, default=0.0)

    plot = relationship("Plot", back_populates="valves")
    telemetry = relationship("TelemetryModel", back_populates="valve")
    alerts = relationship("AlertModel", back_populates="valve")
    schedules = relationship("Schedule", back_populates="valve")
