import json
from typing import List, Optional
from datetime import datetime

from config.settings import get_settings
from models.telemetry_model import TelemetryRecord, TelemetrySummary

settings = get_settings()

# ---------------------------------------------------------------------------
# Load dataset once at startup
# ---------------------------------------------------------------------------

def _load_dataset() -> List[dict]:
    try:
        with open(settings.DATASET_PATH, "r") as f:
            data = json.load(f)
        return data.get("telemetry", [])
    except FileNotFoundError:
        return []


_TELEMETRY_RAW: List[dict] = _load_dataset()


def _to_model(raw: dict) -> TelemetryRecord:
    return TelemetryRecord(
        id=raw["id"],
        valve_id=raw["valve_id"],
        timestamp=datetime.fromisoformat(raw["timestamp"].replace("Z", "+00:00")),
        flow_rate=raw["flow_rate"],
        pressure=raw["pressure"],
        temperature=raw["temperature"],
        battery_level=raw["battery_level"],
        motor_current=raw["motor_current"],
        valve_status=raw["valve_status"],
        signal_strength=raw["signal_strength"],
    )


# ---------------------------------------------------------------------------
# Service functions
# ---------------------------------------------------------------------------

def get_telemetry(
    valve_id: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> List[TelemetryRecord]:
    records = _TELEMETRY_RAW
    if valve_id:
        records = [r for r in records if r["valve_id"] == valve_id]
    records = sorted(records, key=lambda r: r["timestamp"], reverse=True)
    page = records[offset: offset + limit]
    return [_to_model(r) for r in page]


def get_latest_telemetry(valve_id: str) -> Optional[TelemetryRecord]:
    records = [r for r in _TELEMETRY_RAW if r["valve_id"] == valve_id]
    if not records:
        return None
    latest = max(records, key=lambda r: r["timestamp"])
    return _to_model(latest)


def get_telemetry_summary(valve_id: str) -> TelemetrySummary:
    records = [r for r in _TELEMETRY_RAW if r["valve_id"] == valve_id]
    if not records:
        return TelemetrySummary(
            valve_id=valve_id,
            latest_timestamp=None,
            avg_flow_rate=0.0,
            avg_pressure=0.0,
            avg_temperature=0.0,
            min_battery=0,
            avg_motor_current=0.0,
            record_count=0,
        )
    n = len(records)
    latest_ts = max(datetime.fromisoformat(r["timestamp"].replace("Z", "+00:00")) for r in records)
    return TelemetrySummary(
        valve_id=valve_id,
        latest_timestamp=latest_ts,
        avg_flow_rate=round(sum(r["flow_rate"] for r in records) / n, 2),
        avg_pressure=round(sum(r["pressure"] for r in records) / n, 2),
        avg_temperature=round(sum(r["temperature"] for r in records) / n, 2),
        min_battery=min(r["battery_level"] for r in records),
        avg_motor_current=round(sum(r["motor_current"] for r in records) / n, 2),
        record_count=n,
    )


def get_all_valve_summaries() -> List[TelemetrySummary]:
    valve_ids = {r["valve_id"] for r in _TELEMETRY_RAW}
    return [get_telemetry_summary(vid) for vid in valve_ids]
