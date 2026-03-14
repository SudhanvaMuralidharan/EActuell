"""
ai_service.py
-------------
Step 4 (entry point) of the AI pipeline.
Orchestrates telemetry_analyzer → anomaly_detector → decision_engine
and assembles the final API response shape.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime

from ai_agent.telemetry_analyzer import analyze, TelemetryContext
from ai_agent.anomaly_detector import detect, AnomalyReport
from ai_agent.decision_engine import decide, ValveDecision
from services.telemetry_service import get_telemetry
from models.telemetry_model import TelemetryRecord


# ---------------------------------------------------------------------------
# Response schema helpers (plain dicts — serialised to JSON by FastAPI)
# ---------------------------------------------------------------------------

def _serialise_anomaly(a) -> Dict[str, Any]:
    return {
        "type": a.anomaly_type,
        "severity": a.severity,
        "title": a.title,
        "detail": a.detail,
        "metric": a.metric,
        "observed_value": a.observed_value,
        "threshold": a.threshold,
    }


def _serialise_recommendation(r) -> Dict[str, Any]:
    return {
        "priority": r.priority,
        "action": r.action,
        "reason": r.reason,
        "anomaly_type": r.anomaly_type,
    }


def _serialise_decision(decision: ValveDecision, report: AnomalyReport, ctx: TelemetryContext) -> Dict[str, Any]:
    return {
        "valve_id": decision.valve_id,
        "analysed_at": datetime.utcnow().isoformat() + "Z",
        "record_count": ctx.record_count,
        "health": {
            "score": decision.health_score,
            "label": decision.health_label,
            "summary": decision.summary,
        },
        "anomalies": [_serialise_anomaly(a) for a in report.anomalies],
        "recommendations": [_serialise_recommendation(r) for r in decision.recommendations],
        "suggested_valve_action": decision.suggested_valve_action,
        "should_alert": decision.should_alert,
        "stats": {
            "avg_flow_rate": ctx.avg_flow_rate,
            "avg_pressure": ctx.avg_pressure,
            "avg_temperature": ctx.avg_temperature,
            "avg_motor_current": ctx.avg_motor_current,
            "min_battery": ctx.min_battery,
            "avg_signal": ctx.avg_signal,
            "flow_rate_trend": ctx.flow_rate_trend,
            "temperature_trend": ctx.temperature_trend,
            "pressure_trend": ctx.pressure_trend,
            "battery_trend": ctx.battery_trend,
        },
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def get_insights_for_valve(db: AsyncSession, valve_id: str, limit: int = 50) -> Dict[str, Any]:
    """Run the full AI pipeline for a single valve."""
    records: List[TelemetryRecord] = await get_telemetry(db, valve_id=valve_id, limit=limit)
    if not records:
        return {
            "valve_id": valve_id,
            "analysed_at": datetime.utcnow().isoformat() + "Z",
            "record_count": 0,
            "health": {"score": 0, "label": "No Data", "summary": "No telemetry data available for this valve."},
            "anomalies": [],
            "recommendations": [],
            "suggested_valve_action": "none",
            "should_alert": False,
            "stats": {},
        }

    ctx = analyze(records)
    report = detect(ctx)
    decision = decide(report)
    return _serialise_decision(decision, report, ctx)


async def get_insights_all_valves(db: AsyncSession) -> List[Dict[str, Any]]:
    """Run the full AI pipeline for every valve that has telemetry data."""
    # Note: Using get_all_valve_summaries which might also need to be async or refactored
    # For now, let's assume we can list valves from valve_service
    from services.valve_service import list_valves_for_plot
    valves = await list_valves_for_plot(db)
    
    results = []
    for valve in valves:
        try:
            insight = await get_insights_for_valve(db, valve.id)
            results.append(insight)
        except Exception as exc:
            results.append({
                "valve_id": valve.id,
                "error": str(exc),
            })
    # Sort: most critical first
    def _sort_key(r):
        label = r.get("health", {}).get("label", "No Data")
        order = {"Critical": 0, "Degraded": 1, "Healthy": 2, "No Data": 3}
        return order.get(label, 99)

    return sorted(results, key=_sort_key)
