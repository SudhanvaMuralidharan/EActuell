from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models.valve_model import Valve, ValveCreate, ValveUpdate, ValveControl
from models.user_model import UserPublic
from services import valve_service
from services.auth_service import get_current_user, oauth2_scheme

router = APIRouter(prefix="/valves", tags=["Valve Management"])

async def _current_user(token: str = Depends(oauth2_scheme)) -> UserPublic:
    return get_current_user(token)

@router.get(
    "",
    response_model=List[Valve],
    summary="List valves, optionally filtered by plot_id",
)
async def list_valves(
    plot_id: str = None, 
    db: AsyncSession = Depends(get_db),
    _: UserPublic = Depends(_current_user)
):
    return await valve_service.list_valves_for_plot(db, plot_id)

@router.post(
    "",
    response_model=Valve,
    status_code=201,
    summary="Register a new valve",
)
async def create_valve(
    data: ValveCreate, 
    db: AsyncSession = Depends(get_db),
    _: UserPublic = Depends(_current_user)
):
    return await valve_service.create_valve(db, data)

@router.get(
    "/{valve_id}",
    response_model=Valve,
    summary="Get a single valve by ID",
)
async def get_valve(
    valve_id: str, 
    db: AsyncSession = Depends(get_db),
    _: UserPublic = Depends(_current_user)
):
    return await valve_service.get_valve(db, valve_id)

@router.patch(
    "/{valve_id}",
    response_model=Valve,
    summary="Update valve metadata",
)
async def update_valve(
    valve_id: str, 
    data: ValveUpdate, 
    db: AsyncSession = Depends(get_db),
    _: UserPublic = Depends(_current_user)
):
    return await valve_service.update_valve(db, valve_id, data)

@router.post(
    "/{valve_id}/control",
    response_model=Valve,
    summary="Open or close a valve (simulated actuation)",
)
async def control_valve(
    valve_id: str, 
    body: ValveControl, 
    db: AsyncSession = Depends(get_db),
    _: UserPublic = Depends(_current_user)
):
    return await valve_service.control_valve(db, valve_id, body.action)

@router.delete(
    "/{valve_id}",
    summary="Delete / deregister a valve",
)
async def delete_valve(
    valve_id: str, 
    db: AsyncSession = Depends(get_db),
    _: UserPublic = Depends(_current_user)
):
    return await valve_service.delete_valve(db, valve_id)
