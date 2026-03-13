"""
anomaly_detector.py
-------------------
Step 2 of the AI pipeline.
Applies rule-based anomaly detection on a TelemetryContext
and produces a list of structured anomaly findings.
"""
from typing import List
from dataclasses import dataclass, field
from enum import Enum

from config.settings import get_settings
from ai_agent.telemetry_analyzer import TelemetryContext

settings = get_settings()


class AnomalyType(str, Enum):
    LOW_BATTERY = "low_battery"
    CRITICAL_BATTERY = "critical_battery"
    HIGH_TEMPERATURE = "high_temperature"
    ABNORMAL_MOTOR_CURRENT = "abnormal_motor_current"
    FLOW_RATE_MISMATCH = "flow_rate_mismatch"
    VALVE_BLOCKAGE = "valve_blockage"
    LOW_PRESSURE = "low_pressure"
    HIGH_PRESSURE = "high_pressure"
    WEAK_SIGNAL = "weak_signal"
    TEMPERATURE_RISING = "temperature_rising"
    BATTERY_DRAINING = "battery_draining"


class Severity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


@dataclass
class Anomaly:
    anomaly_type: AnomalyType
    severity: Severity
    title: str
    detail: str
    metric: str
    observed_value: float
    threshold: float


@dataclass
class AnomalyReport:
    valve_id: str
    anomalies: List[Anomaly] = field(default_factory=list)

    @property
    def has_anomalies(self) -> bool:
        return len(self.anomalies) > 0

    @property
    def highest_severity(self) -> str:
        if any(a.severity == Severity.CRITICAL for a in self.anomalies):
            return "critical"
        if any(a.severity == Severity.WARNING for a in self.anomalies):
            return "warning"
        if self.anomalies:
            return "info"
        return "none"


def detect(ctx: TelemetryContext) -> AnomalyReport:
    """
    Run all anomaly detection rules against a TelemetryContext.
    Returns an AnomalyReport with all detected anomalies.
    """
    th = settings.THRESHOLDS
    report = AnomalyReport(valve_id=ctx.valve_id)
    latest = ctx.latest_record

    # ── Battery ──────────────────────────────────────────────────────────────
    if ctx.min_battery <= th["battery_critical"]:
        report.anomalies.append(Anomaly(
            anomaly_type=AnomalyType.CRITICAL_BATTERY,
            severity=Severity.CRITICAL,
            title="Critical Battery Level",
            detail=f"Battery at {ctx.min_battery}%. Device may stop transmitting soon.",
            metric="battery_level",
            observed_value=ctx.min_battery,
            threshold=th["battery_critical"],
        ))
    elif ctx.min_battery <= th["battery_low"]:
        report.anomalies.append(Anomaly(
            anomaly_type=AnomalyType.LOW_BATTERY,
            severity=Severity.WARNING,
            title="Low Battery",
            detail=f"Battery at {ctx.min_battery}%. Schedule replacement within 48 hours.",
            metric="battery_level",
            observed_value=ctx.min_battery,
            threshold=th["battery_low"],
        ))

    if ctx.battery_trend == "falling" and ctx.min_battery < 50:
        report.anomalies.append(Anomaly(
            anomaly_type=AnomalyType.BATTERY_DRAINING,
            severity=Severity.WARNING,
            title="Battery Draining Rapidly",
            detail="Battery level shows a consistent decline across readings.",
            metric="battery_level",
            observed_value=ctx.min_battery,
            threshold=50,
        ))

    # ── Temperature ───────────────────────────────────────────────────────────
    if ctx.avg_temperature > th["temperature_max"]:
        report.anomalies.append(Anomaly(
            anomaly_type=AnomalyType.HIGH_TEMPERATURE,
            severity=Severity.WARNING,
            title="Abnormal Temperature",
            detail=f"Average temperature {ctx.avg_temperature}°C exceeds safe limit of {th['temperature_max']}°C.",
            metric="temperature",
            observed_value=ctx.avg_temperature,
            threshold=th["temperature_max"],
        ))

    if ctx.temperature_trend == "rising" and ctx.avg_temperature > 35:
        report.anomalies.append(Anomaly(
            anomaly_type=AnomalyType.TEMPERATURE_RISING,
            severity=Severity.INFO,
            title="Temperature Rising",
            detail="Temperature is trending upward. Monitor for overheating.",
            metric="temperature",
            observed_value=ctx.avg_temperature,
            threshold=th["temperature_max"],
        ))

    # ── Motor Current ─────────────────────────────────────────────────────────
    if ctx.avg_motor_current > th["motor_current_max"]:
        report.anomalies.append(Anomaly(
            anomaly_type=AnomalyType.ABNORMAL_MOTOR_CURRENT,
            severity=Severity.WARNING,
            title="Abnormal Motor Current",
            detail=f"Motor drawing {ctx.avg_motor_current}A (max {th['motor_current_max']}A). Possible mechanical obstruction.",
            metric="motor_current",
            observed_value=ctx.avg_motor_current,
            threshold=th["motor_current_max"],
        ))

    # ── Flow Rate ─────────────────────────────────────────────────────────────
    if latest and latest.valve_status == "open":
        if ctx.avg_flow_rate < th["flow_rate_min"]:
            # High current + low flow = blockage
            if ctx.avg_motor_current > th["motor_current_max"] * 0.8:
                report.anomalies.append(Anomaly(
                    anomaly_type=AnomalyType.VALVE_BLOCKAGE,
                    severity=Severity.CRITICAL,
                    title="Valve Blockage Detected",
                    detail=(
                        f"Flow rate dropped to {ctx.avg_flow_rate} L/min while motor current is high "
                        f"({ctx.avg_motor_current}A). Probable physical blockage."
                    ),
                    metric="flow_rate",
                    observed_value=ctx.avg_flow_rate,
                    threshold=th["flow_rate_min"],
                ))
            else:
                report.anomalies.append(Anomaly(
                    anomaly_type=AnomalyType.FLOW_RATE_MISMATCH,
                    severity=Severity.WARNING,
                    title="Low Flow Rate",
                    detail=f"Flow rate {ctx.avg_flow_rate} L/min is below minimum {th['flow_rate_min']} L/min.",
                    metric="flow_rate",
                    observed_value=ctx.avg_flow_rate,
                    threshold=th["flow_rate_min"],
                ))

        elif ctx.avg_flow_rate > th["flow_rate_max"]:
            report.anomalies.append(Anomaly(
                anomaly_type=AnomalyType.FLOW_RATE_MISMATCH,
                severity=Severity.WARNING,
                title="Excessive Flow Rate",
                detail=f"Flow rate {ctx.avg_flow_rate} L/min exceeds maximum {th['flow_rate_max']} L/min.",
                metric="flow_rate",
                observed_value=ctx.avg_flow_rate,
                threshold=th["flow_rate_max"],
            ))

    # ── Pressure ──────────────────────────────────────────────────────────────
    if ctx.avg_pressure < th["pressure_min"]:
        report.anomalies.append(Anomaly(
            anomaly_type=AnomalyType.LOW_PRESSURE,
            severity=Severity.INFO,
            title="Low Pressure",
            detail=f"Average pressure {ctx.avg_pressure} bar below minimum {th['pressure_min']} bar.",
            metric="pressure",
            observed_value=ctx.avg_pressure,
            threshold=th["pressure_min"],
        ))
    elif ctx.avg_pressure > th["pressure_max"]:
        report.anomalies.append(Anomaly(
            anomaly_type=AnomalyType.HIGH_PRESSURE,
            severity=Severity.WARNING,
            title="High Pressure",
            detail=f"Average pressure {ctx.avg_pressure} bar exceeds safe maximum {th['pressure_max']} bar.",
            metric="pressure",
            observed_value=ctx.avg_pressure,
            threshold=th["pressure_max"],
        ))

    # ── Signal ────────────────────────────────────────────────────────────────
    if ctx.avg_signal < th["signal_strength_min"]:
        report.anomalies.append(Anomaly(
            anomaly_type=AnomalyType.WEAK_SIGNAL,
            severity=Severity.INFO,
            title="Weak Signal",
            detail=f"Average signal {ctx.avg_signal} dBm below threshold {th['signal_strength_min']} dBm.",
            metric="signal_strength",
            observed_value=ctx.avg_signal,
            threshold=th["signal_strength_min"],
        ))

    return report
