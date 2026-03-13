from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


ValveStatus = Literal["open", "closed", "fault", "unknown"]


class ValveBase(BaseModel):
    name: str
    plot_id: str
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    model_number: Optional[str] = None


class ValveCreate(ValveBase):
    pass


class ValveUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[ValveStatus] = None


class ValveControl(BaseModel):
    action: Literal["open", "close"]


class Valve(ValveBase):
    id: str
    status: ValveStatus = "unknown"
    installed_at: datetime
    last_seen: Optional[datetime] = None
    is_active: bool = True

    class Config:
        from_attributes = True
