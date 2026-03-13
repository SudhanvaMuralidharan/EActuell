"""
decision_engine.py
------------------
Step 3 of the AI pipeline.
Converts an AnomalyReport into actionable recommendations
and a plain-language health summary.
"""
from typing import List
from dataclasses import dataclass, field

from ai_agent.anomaly_detector import AnomalyReport, AnomalyType, Severity


@dataclass
class Recommendation:
    priority: int          # 1 = highest
    action: str
    reason: str
    anomaly_type: str


@dataclass
class ValveDecision:
    valve_id: str
    health_score: int              # 0–100
    health_label: str              # Healthy | Degraded | Critical
    summary: str
    recommendations: List[Recommendation] = field(default_factory=list)
    should_alert: bool = False
    suggested_valve_action: str = "none"   # none | close | inspect


_RECOMMENDATION_MAP = {
    AnomalyType.CRITICAL_BATTERY: Recommendation(
        priority=1,
        action="Replace battery immediately",
        reason="Device will lose connectivity and fail to execute scheduled irrigation.",
        anomaly_type=AnomalyType.CRITICAL_BATTERY,
    ),
    AnomalyType.LOW_BATTERY: Recommendation(
        priority=2,
        action="Schedule battery replacement within 48 hours",
        reason="Battery approaching end of operational life.",
        anomaly_type=AnomalyType.LOW_BATTERY,
    ),
    AnomalyType.BATTERY_DRAINING: Recommendation(
        priority=3,
        action="Investigate power drain cause",
        reason="Accelerated battery drain may indicate a hardware fault or parasitic current.",
        anomaly_type=AnomalyType.BATTERY_DRAINING,
    ),
    AnomalyType.VALVE_BLOCKAGE: Recommendation(
        priority=1,
        action="Close valve and perform physical inspection",
        reason="High motor current combined with low flow rate strongly indicates a blockage.",
        anomaly_type=AnomalyType.VALVE_BLOCKAGE,
    ),
    AnomalyType.ABNORMAL_MOTOR_CURRENT: Recommendation(
        priority=2,
        action="Inspect valve mechanism for debris or obstruction",
        reason="Elevated motor current indicates mechanical resistance.",
        anomaly_type=AnomalyType.ABNORMAL_MOTOR_CURRENT,
    ),
    AnomalyType.HIGH_TEMPERATURE: Recommendation(
        priority=2,
        action="Check electronics housing and ensure adequate ventilation",
        reason="Prolonged high temperature can damage PCB components and seals.",
        anomaly_type=AnomalyType.HIGH_TEMPERATURE,
    ),
    AnomalyType.TEMPERATURE_RISING: Recommendation(
        priority=3,
        action="Monitor temperature closely; inspect shading",
        reason="Upward temperature trend may lead to overheating.",
        anomaly_type=AnomalyType.TEMPERATURE_RISING,
    ),
    AnomalyType.FLOW_RATE_MISMATCH: Recommendation(
        priority=2,
        action="Check supply line and inspect valve seat",
        reason="Flow rate outside normal operating range.",
        anomaly_type=AnomalyType.FLOW_RATE_MISMATCH,
    ),
    AnomalyType.LOW_PRESSURE: Recommendation(
        priority=3,
        action="Verify supply pressure at pump and check for leaks upstream",
        reason="Low inlet pressure reduces irrigation effectiveness.",
        anomaly_type=AnomalyType.LOW_PRESSURE,
    ),
    AnomalyType.HIGH_PRESSURE: Recommendation(
        priority=2,
        action="Install or check pressure regulator; inspect fittings",
        reason="Excess pressure may damage valve seals and downstream fittings.",
        anomaly_type=AnomalyType.HIGH_PRESSURE,
    ),
    AnomalyType.WEAK_SIGNAL: Recommendation(
        priority=3,
        action="Reposition antenna or install signal repeater",
        reason="Weak signal can cause missed commands and data gaps.",
        anomaly_type=AnomalyType.WEAK_SIGNAL,
    ),
}


def _compute_health_score(report: AnomalyReport) -> int:
    """Deduct points per anomaly based on severity."""
    score = 100
    deductions = {Severity.INFO: 5, Severity.WARNING: 20, Severity.CRITICAL: 40}
    for anomaly in report.anomalies:
        score -= deductions.get(anomaly.severity, 5)
    return max(0, score)


def decide(report: AnomalyReport) -> ValveDecision:
    """Produce a ValveDecision from an AnomalyReport."""
    health_score = _compute_health_score(report)

    if health_score >= 80:
        health_label = "Healthy"
    elif health_score >= 50:
        health_label = "Degraded"
    else:
        health_label = "Critical"

    recommendations = []
    for anomaly in report.anomalies:
        template = _RECOMMENDATION_MAP.get(anomaly.anomaly_type)
        if template:
            recommendations.append(Recommendation(
                priority=template.priority,
                action=template.action,
                reason=template.reason,
                anomaly_type=anomaly.anomaly_type,
            ))

    recommendations.sort(key=lambda r: r.priority)

    # Suggested valve action
    blockage = any(a.anomaly_type == AnomalyType.VALVE_BLOCKAGE for a in report.anomalies)
    critical_battery = any(a.anomaly_type == AnomalyType.CRITICAL_BATTERY for a in report.anomalies)
    suggested_action = "close" if blockage else ("inspect" if critical_battery else "none")

    # Human-readable summary
    if not report.anomalies:
        summary = "All systems nominal. Valve is operating within expected parameters."
    else:
        anom_titles = [a.title for a in report.anomalies[:3]]
        summary = (
            f"Valve health is {health_label.lower()} (score {health_score}/100). "
            f"Detected issue(s): {', '.join(anom_titles)}. "
            f"{len(recommendations)} recommendation(s) available."
        )

    return ValveDecision(
        valve_id=report.valve_id,
        health_score=health_score,
        health_label=health_label,
        summary=summary,
        recommendations=recommendations,
        should_alert=report.highest_severity in ("warning", "critical"),
        suggested_valve_action=suggested_action,
    )
