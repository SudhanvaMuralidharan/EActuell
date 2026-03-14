from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete as sa_delete
from typing import List, Optional
from fastapi import HTTPException, status
from models.database_models import ValveDB
from models.valve_model import ValveCreate, ValveUpdate


async def list_valves_for_plot(db: AsyncSession, zone: Optional[str] = None) -> List[ValveDB]:
    query = select(ValveDB)
    if zone:
        query = query.where(ValveDB.zone == zone)
    result = await db.execute(query)
    return result.scalars().all()


async def get_valve(db: AsyncSession, valve_id: str) -> ValveDB:
    """Look up a valve by device_id (the string identifier used by the app)."""
    result = await db.execute(select(ValveDB).where(ValveDB.device_id == valve_id))
    valve = result.scalar_one_or_none()
    if not valve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Valve not found")
    return valve


async def create_valve(db: AsyncSession, data: ValveCreate) -> ValveDB:
    new_valve = ValveDB(
        device_id=data.device_id,
        gateway_id=data.gateway_id,
        zone=data.zone,
        latitude=data.latitude,
        longitude=data.longitude,
        status=data.status or "unknown",
    )
    db.add(new_valve)
    await db.commit()
    await db.refresh(new_valve)
    return new_valve


async def update_valve(db: AsyncSession, valve_id: str, data: ValveUpdate) -> ValveDB:
    valve = await get_valve(db, valve_id)
    update_data = data.dict(exclude_none=True)
    for field, value in update_data.items():
        setattr(valve, field, value)
    await db.commit()
    await db.refresh(valve)
    return valve


async def control_valve(db: AsyncSession, valve_id: str, action: Optional[str] = None, position: Optional[int] = None) -> ValveDB:
    valve = await get_valve(db, valve_id)

    if position is not None:
        if not (0 <= position <= 100):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Position must be 0-100")
        valve.valve_position = position
        if position == 0:
            valve.status = "closed"
        elif position == 100:
            valve.status = "open"
        else:
            valve.status = "partial"

    if action:
        if action not in ("open", "close"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Action must be 'open' or 'close'")
        valve.status = "open" if action == "open" else "closed"
        valve.valve_position = 100 if action == "open" else 0

    await db.commit()
    await db.refresh(valve)
    return valve


async def delete_valve(db: AsyncSession, valve_id: str) -> dict:
    result = await db.execute(sa_delete(ValveDB).where(ValveDB.device_id == valve_id))
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Valve not found")
    await db.commit()
    return {"detail": "Valve deleted"}
