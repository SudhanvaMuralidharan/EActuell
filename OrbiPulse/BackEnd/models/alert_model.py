from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


AlertSeverity = Literal["info", "warning", "critical"]
AlertType = Literal[
    "low_battery",
    "critical_battery",
    "high_temperature",
    "abnormal_motor_current",
    "flow_rate_anomaly",
    "low_pressure",
    "high_pressure",
    "valve_blockage",
    "weak_signal",
    "flow_rate_mismatch",
]


class Alert(BaseModel):
    id: str
    valve_id: str
    plot_id: Optional[str] = None
    alert_type: AlertType
    severity: AlertSeverity
    message: str
    value: Optional[float] = None
    threshold: Optional[float] = None
    timestamp: datetime
    is_acknowledged: bool = False
    acknowledged_at: Optional[datetime] = None


class AlertAcknowledge(BaseModel):
    acknowledged: bool = True
