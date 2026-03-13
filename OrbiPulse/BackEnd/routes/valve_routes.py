from typing import List

from fastapi import APIRouter, Depends

from models.valve_model import Valve, ValveCreate, ValveUpdate, ValveControl
from models.user_model import UserPublic
from services import valve_service
from services.auth_service import get_current_user, oauth2_scheme

router = APIRouter(prefix="/valves", tags=["Valve Management"])


def _current_user(token: str = Depends(oauth2_scheme)) -> UserPublic:
    return get_current_user(token)


@router.get(
    "",
    response_model=List[Valve],
    summary="List valves, optionally filtered by plot_id",
)
def list_valves(plot_id: str = None, _: UserPublic = Depends(_current_user)):
    return valve_service.list_valves_for_plot(plot_id) if plot_id else valve_service.list_valves_for_plot("")


@router.post(
    "",
    response_model=Valve,
    status_code=201,
    summary="Register a new valve",
)
def create_valve(data: ValveCreate, _: UserPublic = Depends(_current_user)):
    return valve_service.create_valve(data)


@router.get(
    "/{valve_id}",
    response_model=Valve,
    summary="Get a single valve by ID",
)
def get_valve(valve_id: str, _: UserPublic = Depends(_current_user)):
    return valve_service.get_valve(valve_id)


@router.patch(
    "/{valve_id}",
    response_model=Valve,
    summary="Update valve metadata",
)
def update_valve(valve_id: str, data: ValveUpdate, _: UserPublic = Depends(_current_user)):
    return valve_service.update_valve(valve_id, data)


@router.post(
    "/{valve_id}/control",
    response_model=Valve,
    summary="Open or close a valve (simulated actuation)",
)
def control_valve(valve_id: str, body: ValveControl, _: UserPublic = Depends(_current_user)):
    """
    Send an actuation command to the valve.
    - `action: "open"` — opens the valve
    - `action: "close"` — closes the valve
    """
    return valve_service.control_valve(valve_id, body.action)


@router.delete(
    "/{valve_id}",
    summary="Delete / deregister a valve",
)
def delete_valve(valve_id: str, _: UserPublic = Depends(_current_user)):
    return valve_service.delete_valve(valve_id)
