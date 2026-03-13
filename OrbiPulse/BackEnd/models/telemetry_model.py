from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class TelemetryRecord(BaseModel):
    id: str
    valve_id: str
    timestamp: datetime
    flow_rate: float          # L/min
    pressure: float           # bar
    temperature: float        # Celsius
    battery_level: int        # 0–100 %
    motor_current: float      # Amperes
    valve_status: Literal["open", "closed", "fault", "unknown"]
    signal_strength: int      # dBm


class TelemetryQuery(BaseModel):
    valve_id: Optional[str] = None
    limit: int = 50
    offset: int = 0


class TelemetrySummary(BaseModel):
    valve_id: str
    latest_timestamp: Optional[datetime]
    avg_flow_rate: float
    avg_pressure: float
    avg_temperature: float
    min_battery: int
    avg_motor_current: float
    record_count: int
