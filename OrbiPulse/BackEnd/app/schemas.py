from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Plot schemas
class PlotBase(BaseModel):
    name: str
    farmer_id: str

class PlotCreate(PlotBase):
    pass

class Plot(PlotBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Valve schemas
class ValveBase(BaseModel):
    device_id: str
    model_number: str
    plot_id: int
    latitude: float
    longitude: float

class ValveCreate(ValveBase):
    pass

class Valve(ValveBase):
    id: int
    installed_at: datetime
    valve_flow: float

    class Config:
        from_attributes = True

class ValveWithTelemetry(Valve):
    latest_telemetry: Optional[dict] = None

# Telemetry schemas
class TelemetryBase(BaseModel):
    timestamp: datetime
    device_id: str
    valve_position: float
    battery_voltage: float
    motor_current: float
    temperature: float
    signal_strength: float
    status: str

class TelemetryCreate(TelemetryBase):
    pass

class Telemetry(TelemetryBase):
    id: int

    class Config:
        from_attributes = True

# Alert schemas
class AlertBase(BaseModel):
    device_id: str
    alert_type: str
    message: str

class Alert(AlertBase):
    id: int
    timestamp: datetime
    resolved: int

    class Config:
        from_attributes = True

# Request schemas
class SetFlowRequest(BaseModel):
    flow_percentage: float

# Response schemas
class MapData(BaseModel):
    device_id: str
    latitude: float
    longitude: float
    status: str
    latest_telemetry: Optional[dict] = None