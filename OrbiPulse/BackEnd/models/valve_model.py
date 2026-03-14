from pydantic import BaseModel
from typing import Optional, Literal


ValveStatus = Literal["open", "closed", "partial", "fault", "offline", "unknown"]


class ValveCreate(BaseModel):
    device_id: str
    gateway_id: Optional[str] = None
    zone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: ValveStatus = "unknown"


class ValveUpdate(BaseModel):
    zone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[ValveStatus] = None
    valve_position: Optional[int] = None  # 0-100%


class ValveControl(BaseModel):
    action: Optional[Literal["open", "close"]] = None
    position: Optional[int] = None  # 0-100%


class ValveResponse(BaseModel):
    id: int
    device_id: str
    gateway_id: Optional[str] = None
    zone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    valve_position: Optional[int] = 0
    battery_voltage: Optional[float] = None
    motor_current: Optional[float] = None
    temperature: Optional[float] = None
    signal_strength: Optional[int] = None
    status: str = "unknown"

    class Config:
        from_attributes = True
