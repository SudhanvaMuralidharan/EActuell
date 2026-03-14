from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models.schedule_model import Schedule, ScheduleCreate, ScheduleUpdate
from models.user_model import UserPublic
from services import scheduler_service
from services.auth_service import get_current_user, oauth2_scheme

router = APIRouter(prefix="/schedules", tags=["Irrigation Scheduling"])

async def _current_user(token: str = Depends(oauth2_scheme)) -> UserPublic:
    return get_current_user(token)

@router.get(
    "",
    response_model=List[Schedule],
    summary="List all irrigation schedules, optionally filtered by valve",
)
async def list_schedules(
    valve_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: UserPublic = Depends(_current_user),
):
    return await scheduler_service.list_schedules(db, valve_id=valve_id)

@router.post(
    "",
    response_model=Schedule,
    status_code=201,
    summary="Create a new irrigation schedule",
)
async def create_schedule(
    data: ScheduleCreate, 
    db: AsyncSession = Depends(get_db),
    _: UserPublic = Depends(_current_user)
):
    return await scheduler_service.create_schedule(db, data)

@router.get(
    "/{schedule_id}",
    response_model=Schedule,
    summary="Get a schedule by ID",
)
async def get_schedule(
    schedule_id: str, 
    db: AsyncSession = Depends(get_db),
    _: UserPublic = Depends(_current_user)
):
    return await scheduler_service.get_schedule(db, schedule_id)

@router.patch(
    "/{schedule_id}",
    response_model=Schedule,
    summary="Update an existing schedule",
)
async def update_schedule(
    schedule_id: str, 
    data: ScheduleUpdate, 
    db: AsyncSession = Depends(get_db),
    _: UserPublic = Depends(_current_user)
):
    return await scheduler_service.update_schedule(db, schedule_id, data)

@router.delete(
    "/{schedule_id}",
    summary="Delete a schedule",
)
async def delete_schedule(
    schedule_id: str, 
    db: AsyncSession = Depends(get_db),
    _: UserPublic = Depends(_current_user)
):
    return await scheduler_service.delete_schedule(db, schedule_id)
