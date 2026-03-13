from typing import List, Optional

from fastapi import APIRouter, Depends, Query

from models.schedule_model import Schedule, ScheduleCreate, ScheduleUpdate
from models.user_model import UserPublic
from services import scheduler_service
from services.auth_service import get_current_user, oauth2_scheme

router = APIRouter(prefix="/schedules", tags=["Irrigation Scheduling"])


def _current_user(token: str = Depends(oauth2_scheme)) -> UserPublic:
    return get_current_user(token)


@router.get(
    "",
    response_model=List[Schedule],
    summary="List all irrigation schedules, optionally filtered by valve",
)
def list_schedules(
    valve_id: Optional[str] = Query(None),
    _: UserPublic = Depends(_current_user),
):
    return scheduler_service.list_schedules(valve_id=valve_id)


@router.post(
    "",
    response_model=Schedule,
    status_code=201,
    summary="Create a new irrigation schedule",
)
def create_schedule(data: ScheduleCreate, _: UserPublic = Depends(_current_user)):
    """
    Example body:
    ```json
    {
      "valve_id": "valve_001",
      "name": "Morning irrigation",
      "start_time": "06:00",
      "duration_minutes": 45,
      "days": ["mon", "wed", "fri"],
      "is_active": true
    }
    ```
    """
    return scheduler_service.create_schedule(data)


@router.get(
    "/{schedule_id}",
    response_model=Schedule,
    summary="Get a schedule by ID",
)
def get_schedule(schedule_id: str, _: UserPublic = Depends(_current_user)):
    return scheduler_service.get_schedule(schedule_id)


@router.patch(
    "/{schedule_id}",
    response_model=Schedule,
    summary="Update an existing schedule",
)
def update_schedule(schedule_id: str, data: ScheduleUpdate, _: UserPublic = Depends(_current_user)):
    return scheduler_service.update_schedule(schedule_id, data)


@router.delete(
    "/{schedule_id}",
    summary="Delete a schedule",
)
def delete_schedule(schedule_id: str, _: UserPublic = Depends(_current_user)):
    return scheduler_service.delete_schedule(schedule_id)
