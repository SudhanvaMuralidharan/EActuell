from typing import List, Optional

from fastapi import APIRouter, Depends, Query

from models.alert_model import Alert, AlertAcknowledge
from models.user_model import UserPublic
from services import alert_service
from services.auth_service import get_current_user, oauth2_scheme

router = APIRouter(prefix="/alerts", tags=["Alert System"])


def _current_user(token: str = Depends(oauth2_scheme)) -> UserPublic:
    return get_current_user(token)


@router.get(
    "",
    response_model=List[Alert],
    summary="List all alerts, optionally filtered by valve or plot",
)
def list_alerts(
    valve_id: Optional[str] = Query(None),
    plot_id: Optional[str] = Query(None),
    unacknowledged_only: bool = Query(False, description="Return only unacknowledged alerts"),
    _: UserPublic = Depends(_current_user),
):
    return alert_service.get_alerts(
        valve_id=valve_id,
        plot_id=plot_id,
        unacknowledged_only=unacknowledged_only,
    )


@router.post(
    "/evaluate",
    response_model=List[Alert],
    summary="Re-run threshold evaluation on all telemetry and generate alerts",
)
def run_evaluation(_: UserPublic = Depends(_current_user)):
    """
    Triggers a full evaluation pass over the loaded telemetry dataset.
    New alerts are stored in memory and returned.
    """
    return alert_service.run_full_evaluation()


@router.patch(
    "/{alert_id}/acknowledge",
    response_model=Alert,
    summary="Acknowledge a specific alert",
)
def acknowledge_alert(alert_id: str, _: UserPublic = Depends(_current_user)):
    return alert_service.acknowledge_alert(alert_id)
