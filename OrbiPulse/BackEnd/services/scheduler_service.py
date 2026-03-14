from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete as sa_delete
from typing import List, Optional
from fastapi import HTTPException, status
from models.database_models import ScheduleDB
from models.schedule_model import Schedule, ScheduleCreate, ScheduleUpdate, PRESET_DAYS
import uuid
from datetime import datetime, timedelta

_DAY_MAP = {"mon": 0, "tue": 1, "wed": 2, "thu": 3, "fri": 4, "sat": 5, "sun": 6}
_DAY_LABEL = {"mon": "Mon", "tue": "Tue", "wed": "Wed", "thu": "Thu",
              "fri": "Fri", "sat": "Sat", "sun": "Sun"}

def _resolve_days(data_days: list, preset: Optional[str]) -> list:
    if preset and preset in PRESET_DAYS:
        return PRESET_DAYS[preset]
    return data_days

def _next_run(raw: ScheduleDB) -> Optional[datetime]:
    now = datetime.utcnow()
    h, m = map(int, raw.start_time.split(":"))
    days = [_DAY_MAP[d] for d in raw.days]
    if not days:
        return None
    for offset in range(8):
        candidate = (now + timedelta(days=offset)).replace(
            hour=h, minute=m, second=0, microsecond=0
        )
        if candidate.weekday() in days and candidate > now:
            return candidate
    return None

def _build_preview(raw: ScheduleDB) -> str:
    day_labels = ", ".join(_DAY_LABEL[d] for d in raw.days)
    return (
        f"{raw.name} will open at {raw.start_time} "
        f"for {raw.duration_minutes} min on {day_labels}"
    )

def _to_model(raw: ScheduleDB) -> Schedule:
    return Schedule(
        id=raw.id,
        valve_id=raw.valve_id,
        name=raw.name,
        start_time=raw.start_time,
        duration_minutes=raw.duration_minutes,
        days=raw.days,
        preset=raw.preset,
        is_active=raw.is_active,
        created_at=raw.created_at,
        last_run=raw.last_run,
        next_run=_next_run(raw) if raw.is_active else None,
        schedule_preview=_build_preview(raw),
    )

async def list_schedules(db: AsyncSession, valve_id: Optional[str] = None) -> List[Schedule]:
    query = select(ScheduleDB)
    if valve_id:
        query = query.where(ScheduleDB.valve_id == valve_id)
    result = await db.execute(query)
    schedules = result.scalars().all()
    return [_to_model(s) for s in schedules]

async def get_schedule(db: AsyncSession, schedule_id: str) -> Schedule:
    result = await db.execute(select(ScheduleDB).where(ScheduleDB.id == schedule_id))
    raw = result.scalar_one_or_none()
    if not raw:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
    return _to_model(raw)

async def create_schedule(db: AsyncSession, data: ScheduleCreate) -> Schedule:
    sid = f"sched_{uuid.uuid4().hex[:8]}"
    resolved_days = _resolve_days(data.days, data.preset)

    new_sched = ScheduleDB(
        id=sid,
        valve_id=data.valve_id,
        name=data.name,
        start_time=data.start_time,
        duration_minutes=data.duration_minutes,
        days=resolved_days,
        preset=data.preset,
        is_active=data.is_active,
        created_at=datetime.utcnow(),
    )
    db.add(new_sched)
    await db.commit()
    await db.refresh(new_sched)
    return _to_model(new_sched)

async def update_schedule(db: AsyncSession, schedule_id: str, data: ScheduleUpdate) -> Schedule:
    result = await db.execute(select(ScheduleDB).where(ScheduleDB.id == schedule_id))
    raw = result.scalar_one_or_none()
    if not raw:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")

    updates = data.dict(exclude_none=True)
    new_preset = updates.get("preset")
    if new_preset and new_preset in PRESET_DAYS:
        updates["days"] = PRESET_DAYS[new_preset]

    for field, value in updates.items():
        setattr(raw, field, value)

    await db.commit()
    await db.refresh(raw)
    return _to_model(raw)

async def delete_schedule(db: AsyncSession, schedule_id: str) -> dict:
    result = await db.execute(sa_delete(ScheduleDB).where(ScheduleDB.id == schedule_id))
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
    await db.commit()
    return {"detail": "Schedule deleted"}


def delete_schedule(schedule_id: str) -> dict:
    if schedule_id not in _SCHEDULES:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
    del _SCHEDULES[schedule_id]
    return {"detail": "Schedule deleted"}