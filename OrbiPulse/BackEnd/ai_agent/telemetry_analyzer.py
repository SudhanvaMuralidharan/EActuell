"""
telemetry_analyzer.py
---------------------
Step 1 of the AI pipeline.
Aggregates and pre-processes raw telemetry records into a structured
analysis context that is consumed by the anomaly detector.
"""
from typing import List, Optional
from datetime import datetime
from dataclasses import dataclass, field

from models.telemetry_model import TelemetryRecord


@dataclass
class TelemetryContext:
    valve_id: str
    record_count: int
    latest_record: Optional[TelemetryRecord]

    # Statistical aggregates
    avg_flow_rate: float = 0.0
    avg_pressure: float = 0.0
    avg_temperature: float = 0.0
    avg_motor_current: float = 0.0
    min_battery: int = 100
    avg_signal: float = 0.0

    # Trend flags (derived from ordered records)
    flow_rate_trend: str = "stable"      # rising | falling | stable
    temperature_trend: str = "stable"
    pressure_trend: str = "stable"
    battery_trend: str = "stable"

    # Raw records for detailed inspection
    records: List[TelemetryRecord] = field(default_factory=list)


def _trend(values: List[float]) -> str:
    """Simple linear trend detection over a list of values."""
    if len(values) < 2:
        return "stable"
    delta = values[-1] - values[0]
    pct = delta / max(abs(values[0]), 0.001)
    if pct > 0.1:
        return "rising"
    if pct < -0.1:
        return "falling"
    return "stable"


def analyze(records: List[TelemetryRecord]) -> TelemetryContext:
    """
    Accepts a list of TelemetryRecord objects for a single valve
    (sorted oldest-first) and returns a TelemetryContext.
    """
    if not records:
        raise ValueError("No telemetry records provided for analysis")

    # Sort oldest → newest
    ordered = sorted(records, key=lambda r: r.timestamp)
    latest = ordered[-1]
    n = len(ordered)

    ctx = TelemetryContext(
        valve_id=latest.valve_id,
        record_count=n,
        latest_record=latest,
        records=ordered,

        avg_flow_rate=round(sum(r.flow_rate for r in ordered) / n, 2),
        avg_pressure=round(sum(r.pressure for r in ordered) / n, 2),
        avg_temperature=round(sum(r.temperature for r in ordered) / n, 2),
        avg_motor_current=round(sum(r.motor_current for r in ordered) / n, 2),
        min_battery=min(r.battery_level for r in ordered),
        avg_signal=round(sum(r.signal_strength for r in ordered) / n, 1),

        flow_rate_trend=_trend([r.flow_rate for r in ordered]),
        temperature_trend=_trend([r.temperature for r in ordered]),
        pressure_trend=_trend([r.pressure for r in ordered]),
        battery_trend=_trend([r.battery_level for r in ordered]),
    )

    return ctx
