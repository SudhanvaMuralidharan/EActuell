from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime

DayOfWeek = Literal["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
Preset = Literal["every_day", "weekdays", "weekends", "alt_days"]

# Preset → days mapping
PRESET_DAYS: dict[str, List[DayOfWeek]] = {
    "every_day": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    "weekdays":  ["mon", "tue", "wed", "thu", "fri"],
    "weekends":  ["sat", "sun"],
    "alt_days":  ["mon", "wed", "fri"],
}


class ScheduleBase(BaseModel):
    valve_id: str
    name: str
    start_time: str                        # HH:MM 24h
    duration_minutes: int
    days: List[DayOfWeek]
    preset: Optional[Preset] = None        # ← NEW: quick preset label
    is_active: bool = True


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleUpdate(BaseModel):
    name: Optional[str] = None
    start_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    days: Optional[List[DayOfWeek]] = None
    preset: Optional[Preset] = None        # ← NEW
    is_active: Optional[bool] = None


class Schedule(ScheduleBase):
    id: str
    created_at: datetime
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    schedule_preview: Optional[str] = None  # ← NEW: human-readable summary

    class Config:
        from_attributes = True