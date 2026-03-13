from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class GeoLocation(BaseModel):
    latitude: float
    longitude: float


class PlotBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: GeoLocation
    area_hectares: Optional[float] = None
    crop_type: Optional[str] = None


class PlotCreate(PlotBase):
    pass


class PlotUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[GeoLocation] = None
    area_hectares: Optional[float] = None
    crop_type: Optional[str] = None


class Plot(PlotBase):
    id: str
    owner_id: str
    created_at: datetime
    valve_count: int = 0

    class Config:
        from_attributes = True


class PlotWithValves(Plot):
    valve_ids: List[str] = []
