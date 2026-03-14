from typing import List, Any, Dict

from fastapi import APIRouter, Depends, Query

from models.user_model import UserPublic
from ai_agent import ai_service
from services.auth_service import get_current_user, oauth2_scheme

router = APIRouter(prefix="/ai", tags=["AI Monitoring Agent"])


def _current_user(token: str = Depends(oauth2_scheme)) -> UserPublic:
    return get_current_user(token)


from config.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

@router.get(
    "/insights",
    summary="Get AI insights for all valves",
    response_model=List[Dict[str, Any]],
)
async def get_all_insights(
    db: AsyncSession = Depends(get_db),
    _: UserPublic = Depends(_current_user)
):
    """
    Runs the full AI pipeline (analyze → detect → decide) across
    **all valves** that have telemetry data.

    Results are sorted by health score (most critical first).
    """
    return await ai_service.get_insights_all_valves(db)


@router.get(
    "/insights/{valve_id}",
    summary="Get AI insights for a specific valve",
    response_model=Dict[str, Any],
)
async def get_valve_insights(
    valve_id: str,
    limit: int = Query(50, ge=1, le=200, description="Number of telemetry records to analyse"),
    db: AsyncSession = Depends(get_db),
    _: UserPublic = Depends(_current_user),
):
    """
    Runs the full AI pipeline for a single valve:

    1. **telemetry_analyzer** — aggregates raw records into statistical context
    2. **anomaly_detector** — applies rule-based anomaly detection
    3. **decision_engine** — produces health score, recommendations & valve action
    """
    return await ai_service.get_insights_for_valve(db, valve_id, limit=limit)
