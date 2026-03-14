from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models.telemetry_model import TelemetryRecord, TelemetrySummary
from models.user_model import UserPublic
from services import telemetry_service
from services.auth_service import get_current_user, oauth2_scheme

router = APIRouter(prefix="/telemetry", tags=["Telemetry Monitoring"])

async def _current_user(token: str = Depends(oauth2_scheme)) -> UserPublic:
    return get_current_user(token)

@router.get(
    "",
    response_model=List[TelemetryRecord],
    summary="Retrieve telemetry records (optionally filtered by valve)",
)
async def get_telemetry(
    valve_id: Optional[str] = Query(None, description="Filter by valve ID"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    _: UserPublic = Depends(_current_user),
):
    return await telemetry_service.get_telemetry(db, valve_id=valve_id, limit=limit, offset=offset)

@router.get(
    "/latest/{valve_id}",
    response_model=Optional[TelemetryRecord],
    summary="Get the most recent telemetry reading for a valve",
)
async def get_latest(
    valve_id: str, 
    db: AsyncSession = Depends(get_db),
    _: UserPublic = Depends(_current_user)
):
    return await telemetry_service.get_latest_telemetry(db, valve_id)

@router.get(
    "/summary/{valve_id}",
    response_model=TelemetrySummary,
    summary="Get aggregated telemetry statistics for a valve",
)
async def get_summary(
    valve_id: str, 
    db: AsyncSession = Depends(get_db),
    _: UserPublic = Depends(_current_user)
):
    return await telemetry_service.get_telemetry_summary(db, valve_id)
