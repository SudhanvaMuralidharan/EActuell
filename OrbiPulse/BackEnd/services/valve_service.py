from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete as sa_delete
from typing import List, Optional
from fastapi import HTTPException, status
from models.database_models import ValveDB
from models.valve_model import ValveCreate, ValveUpdate
import uuid
from datetime import datetime

async def list_valves_for_plot(db: AsyncSession, plot_id: Optional[str] = None) -> List[ValveDB]:
    query = select(ValveDB)
    if plot_id:
        query = query.where(ValveDB.plot_id == plot_id)
    result = await db.execute(query)
    return result.scalars().all()

async def get_valve(db: AsyncSession, valve_id: str) -> ValveDB:
    result = await db.execute(select(ValveDB).where(ValveDB.id == valve_id))
    valve = result.scalar_one_or_none()
    if not valve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Valve not found")
    return valve

async def create_valve(db: AsyncSession, data: ValveCreate) -> ValveDB:
    vid = f"valve_{uuid.uuid4().hex[:8]}"
    new_valve = ValveDB(
        id=vid,
        plot_id=data.plot_id,
        name=data.name,
        description=data.description,
        latitude=data.latitude,
        longitude=data.longitude,
        model_number=data.model_number,
        status="unknown",
        installed_at=datetime.utcnow(),
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

async def control_valve(db: AsyncSession, valve_id: str, action: str) -> ValveDB:
    valve = await get_valve(db, valve_id)
    if action not in ("open", "close"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Action must be 'open' or 'close'")
    valve.status = "open" if action == "open" else "closed"
    valve.last_seen = datetime.utcnow()
    await db.commit()
    await db.refresh(valve)
    return valve

async def delete_valve(db: AsyncSession, valve_id: str) -> dict:
    result = await db.execute(sa_delete(ValveDB).where(ValveDB.id == valve_id))
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Valve not found")
    await db.commit()
    return {"detail": "Valve deleted"}
