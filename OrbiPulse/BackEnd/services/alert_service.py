import uuid
from datetime import datetime
from typing import List, Optional

from config.settings import get_settings
from models.alert_model import Alert, AlertSeverity, AlertType
from models.telemetry_model import TelemetryRecord

settings = get_settings()

# ---------------------------------------------------------------------------
# In-memory alert store (alerts are generated + cached here)
# ---------------------------------------------------------------------------
_ALERTS: dict[str, Alert] = {}


# ---------------------------------------------------------------------------
# Alert generation from a telemetry record
# ---------------------------------------------------------------------------

def _make_alert(
    valve_id: str,
    plot_id: Optional[str],
    alert_type: AlertType,
    severity: AlertSeverity,
    message: str,
    value: Optional[float] = None,
    threshold: Optional[float] = None,
) -> Alert:
    return Alert(
        id=f"alert_{uuid.uuid4().hex[:8]}",
        valve_id=valve_id,
        plot_id=plot_id,
        alert_type=alert_type,
        severity=severity,
        message=message,
        value=value,
        threshold=threshold,
        timestamp=datetime.utcnow(),
    )


def evaluate_telemetry(record: TelemetryRecord, plot_id: Optional[str] = None) -> List[Alert]:
    """Evaluate a single telemetry record against thresholds and return new alerts."""
    th = settings.THRESHOLDS
    new_alerts: List[Alert] = []

    # Battery
    if record.battery_level <= th["battery_critical"]:
        new_alerts.append(_make_alert(
            record.valve_id, plot_id, "critical_battery", "critical",
            f"Battery critically low at {record.battery_level}%. Immediate attention required.",
            value=record.battery_level, threshold=th["battery_critical"],
        ))
    elif record.battery_level <= th["battery_low"]:
        new_alerts.append(_make_alert(
            record.valve_id, plot_id, "low_battery", "warning",
            f"Battery low at {record.battery_level}%. Plan replacement soon.",
            value=record.battery_level, threshold=th["battery_low"],
        ))

    # Temperature
    if record.temperature > th["temperature_max"]:
        new_alerts.append(_make_alert(
            record.valve_id, plot_id, "high_temperature", "warning",
            f"Temperature {record.temperature}°C exceeds limit of {th['temperature_max']}°C.",
            value=record.temperature, threshold=th["temperature_max"],
        ))

    # Motor current
    if record.motor_current > th["motor_current_max"]:
        new_alerts.append(_make_alert(
            record.valve_id, plot_id, "abnormal_motor_current", "warning",
            f"Motor current {record.motor_current}A exceeds {th['motor_current_max']}A. Possible obstruction.",
            value=record.motor_current, threshold=th["motor_current_max"],
        ))

    # Flow rate (only when valve is open)
    if record.valve_status == "open":
        if record.flow_rate < th["flow_rate_min"]:
            new_alerts.append(_make_alert(
                record.valve_id, plot_id, "flow_rate_anomaly", "warning",
                f"Flow rate {record.flow_rate} L/min below minimum {th['flow_rate_min']} L/min. Possible blockage.",
                value=record.flow_rate, threshold=th["flow_rate_min"],
            ))
        elif record.flow_rate > th["flow_rate_max"]:
            new_alerts.append(_make_alert(
                record.valve_id, plot_id, "flow_rate_anomaly", "warning",
                f"Flow rate {record.flow_rate} L/min exceeds maximum {th['flow_rate_max']} L/min.",
                value=record.flow_rate, threshold=th["flow_rate_max"],
            ))

    # Pressure
    if record.pressure < th["pressure_min"]:
        new_alerts.append(_make_alert(
            record.valve_id, plot_id, "low_pressure", "info",
            f"Pressure {record.pressure} bar is below minimum {th['pressure_min']} bar.",
            value=record.pressure, threshold=th["pressure_min"],
        ))
    elif record.pressure > th["pressure_max"]:
        new_alerts.append(_make_alert(
            record.valve_id, plot_id, "high_pressure", "warning",
            f"Pressure {record.pressure} bar exceeds maximum {th['pressure_max']} bar.",
            value=record.pressure, threshold=th["pressure_max"],
        ))

    # Signal strength
    if record.signal_strength < th["signal_strength_min"]:
        new_alerts.append(_make_alert(
            record.valve_id, plot_id, "weak_signal", "info",
            f"Signal strength {record.signal_strength} dBm is below threshold {th['signal_strength_min']} dBm.",
            value=record.signal_strength, threshold=th["signal_strength_min"],
        ))

    # Store alerts
    for alert in new_alerts:
        _ALERTS[alert.id] = alert

    return new_alerts


def run_full_evaluation() -> List[Alert]:
    """Evaluate all telemetry records and seed alerts."""
    from services.telemetry_service import get_telemetry
    from services.valve_service import get_valve

    all_alerts: List[Alert] = []
    records = get_telemetry(limit=200)
    for record in records:
        try:
            valve = get_valve(record.valve_id)
            plot_id = valve.plot_id
        except Exception:
            plot_id = None
        alerts = evaluate_telemetry(record, plot_id=plot_id)
        all_alerts.extend(alerts)
    return all_alerts


def get_alerts(
    valve_id: Optional[str] = None,
    plot_id: Optional[str] = None,
    unacknowledged_only: bool = False,
) -> List[Alert]:
    alerts = list(_ALERTS.values())
    if valve_id:
        alerts = [a for a in alerts if a.valve_id == valve_id]
    if plot_id:
        alerts = [a for a in alerts if a.plot_id == plot_id]
    if unacknowledged_only:
        alerts = [a for a in alerts if not a.is_acknowledged]
    return sorted(alerts, key=lambda a: a.timestamp, reverse=True)


def acknowledge_alert(alert_id: str) -> Alert:
    from fastapi import HTTPException, status
    alert = _ALERTS.get(alert_id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    alert.is_acknowledged = True
    alert.acknowledged_at = datetime.utcnow()
    return alert
