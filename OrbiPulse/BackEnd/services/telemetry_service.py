from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from models.database_models import TelemetryDB
from models.telemetry_model import TelemetryRecord, TelemetrySummary
from datetime import datetime

async def get_telemetry(
    db: AsyncSession,
    valve_id: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> List[TelemetryRecord]:
    query = select(TelemetryDB)
    if valve_id:
        query = query.where(TelemetryDB.device_id == valve_id)
    query = query.order_by(TelemetryDB.timestamp.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    records = result.scalars().all()
    
    return [
        TelemetryRecord(
            id=str(r.id),
            valve_id=r.device_id,
            timestamp=r.timestamp,
            flow_rate=r.flow_rate or 0.0,
            pressure=0.0, # Not in schema
            temperature=r.temperature or 0.0,
            battery_level=int(r.battery_voltage) if r.battery_voltage else 0,
            motor_current=r.motor_current or 0.0,
            valve_status="open" if (r.position or 0) > 0 else "closed",
            signal_strength=0 # Not in schema
        ) for r in records
    ]

async def get_latest_telemetry(db: AsyncSession, valve_id: str) -> Optional[TelemetryRecord]:
    records = await get_telemetry(db, valve_id, limit=1)
    return records[0] if records else None

async def get_telemetry_summary(db: AsyncSession, valve_id: str) -> TelemetrySummary:
    query = select(
        func.count(TelemetryDB.id).label("count"),
        func.avg(TelemetryDB.flow_rate).label("avg_flow"),
        func.avg(TelemetryDB.temperature).label("avg_temp"),
        func.min(TelemetryDB.battery_voltage).label("min_batt"),
        func.avg(TelemetryDB.motor_current).label("avg_motor"),
        func.max(TelemetryDB.timestamp).label("latest_ts")
    ).where(TelemetryDB.device_id == valve_id)
    
    result = await db.execute(query)
    row = result.one()
    
    if not row.count:
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
        
    return TelemetrySummary(
        valve_id=valve_id,
        latest_timestamp=row.latest_ts,
        avg_flow_rate=round(row.avg_flow or 0.0, 2),
        avg_pressure=0.0,
        avg_temperature=round(row.avg_temp or 0.0, 2),
        min_battery=int(row.min_batt or 0),
        avg_motor_current=round(row.avg_motor or 0.0, 2),
        record_count=row.count,
    )
