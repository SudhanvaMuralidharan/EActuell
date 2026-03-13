import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import HTTPException, status

from models.schedule_model import Schedule, ScheduleCreate, ScheduleUpdate, PRESET_DAYS

_SCHEDULES: dict[str, dict] = {}

_DAY_MAP = {"mon": 0, "tue": 1, "wed": 2, "thu": 3, "fri": 4, "sat": 5, "sun": 6}
_DAY_LABEL = {"mon": "Mon", "tue": "Tue", "wed": "Wed", "thu": "Thu",
              "fri": "Fri", "sat": "Sat", "sun": "Sun"}


# ── Helpers ──────────────────────────────────────────────────────────────────

def _resolve_days(data_days: list, preset: Optional[str]) -> list:
    """If a preset is provided, override days with preset expansion."""
    if preset and preset in PRESET_DAYS:
        return PRESET_DAYS[preset]
    return data_days


def _next_run(raw: dict) -> Optional[datetime]:
    now = datetime.utcnow()
    h, m = map(int, raw["start_time"].split(":"))
    days = [_DAY_MAP[d] for d in raw["days"]]
    if not days:
        return None
    for offset in range(8):
        candidate = (now + timedelta(days=offset)).replace(
            hour=h, minute=m, second=0, microsecond=0
        )
        if candidate.weekday() in days and candidate > now:
            return candidate
    return None


def _build_preview(raw: dict) -> str:
    """
    Builds the schedule preview string shown in the frontend.
    e.g. "Field A — Inlet will open at 06:00 for 30 min on Mon, Wed, Fri"
    """
    day_labels = ", ".join(_DAY_LABEL[d] for d in raw["days"])
    return (
        f"{raw['name']} will open at {raw['start_time']} "
        f"for {raw['duration_minutes']} min on {day_labels}"
    )


def _to_model(raw: dict) -> Schedule:
    return Schedule(
        id=raw["id"],
        valve_id=raw["valve_id"],
        name=raw["name"],
        start_time=raw["start_time"],
        duration_minutes=raw["duration_minutes"],
        days=raw["days"],
        preset=raw.get("preset"),
        is_active=raw["is_active"],
        created_at=raw["created_at"],
        last_run=raw.get("last_run"),
        next_run=_next_run(raw) if raw["is_active"] else None,
        schedule_preview=_build_preview(raw),   # ← always generated
    )


# ── Service functions ─────────────────────────────────────────────────────────

def list_schedules(valve_id: Optional[str] = None) -> List[Schedule]:
    schedules = list(_SCHEDULES.values())
    if valve_id:
        schedules = [s for s in schedules if s["valve_id"] == valve_id]
    return [_to_model(s) for s in schedules]


def get_schedule(schedule_id: str) -> Schedule:
    raw = _SCHEDULES.get(schedule_id)
    if not raw:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
    return _to_model(raw)


def create_schedule(data: ScheduleCreate) -> Schedule:
    sid = f"sched_{uuid.uuid4().hex[:8]}"

    # Expand preset → days if preset was provided
    resolved_days = _resolve_days(data.days, data.preset)

    raw = {
        "id": sid,
        "valve_id": data.valve_id,
        "name": data.name,
        "start_time": data.start_time,
        "duration_minutes": data.duration_minutes,
        "days": resolved_days,              # ← expanded from preset if applicable
        "preset": data.preset,
        "is_active": data.is_active,
        "created_at": datetime.utcnow(),
        "last_run": None,
    }
    _SCHEDULES[sid] = raw
    return _to_model(raw)


def update_schedule(schedule_id: str, data: ScheduleUpdate) -> Schedule:
    raw = _SCHEDULES.get(schedule_id)
    if not raw:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")

    updates = data.dict(exclude_none=True)

    # If preset changed, re-expand days automatically
    new_preset = updates.get("preset")
    if new_preset and new_preset in PRESET_DAYS:
        updates["days"] = PRESET_DAYS[new_preset]

    for field, value in updates.items():
        raw[field] = value

    return _to_model(raw)


def delete_schedule(schedule_id: str) -> dict:
    if schedule_id not in _SCHEDULES:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
    del _SCHEDULES[schedule_id]
    return {"detail": "Schedule deleted"}