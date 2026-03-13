from sqlalchemy.orm import Session
from ..models import Telemetry, Alert, Valve
from ..schemas import TelemetryCreate
from typing import List

class TelemetryService:
    def __init__(self, db: Session):
        self.db = db

    def create_telemetry(self, telemetry: TelemetryCreate) -> Telemetry:
        db_telemetry = Telemetry(**telemetry.dict())
        self.db.add(db_telemetry)
        self.db.commit()
        self.db.refresh(db_telemetry)
        self._check_alerts(telemetry)
        return db_telemetry

    def create_telemetry_batch(self, telemetry_list: List[TelemetryCreate]) -> List[Telemetry]:
        db_telemetry_list = []
        for telemetry in telemetry_list:
            db_telemetry = Telemetry(**telemetry.dict())
            self.db.add(db_telemetry)
            db_telemetry_list.append(db_telemetry)
            self._check_alerts(telemetry)
        self.db.commit()
        for t in db_telemetry_list:
            self.db.refresh(t)
        return db_telemetry_list

    def get_latest_telemetry(self, device_id: str) -> Telemetry:
        return self.db.query(Telemetry).filter(Telemetry.device_id == device_id).order_by(Telemetry.timestamp.desc()).first()

    def _check_alerts(self, telemetry: TelemetryCreate):
        alerts = []

        if telemetry.temperature > 45:
            alerts.append(("overheating", f"Temperature {telemetry.temperature}°C exceeds threshold"))

        if telemetry.motor_current > 3:
            alerts.append(("motor_overload", f"Motor current {telemetry.motor_current}A exceeds threshold"))

        if telemetry.battery_voltage < 11.5:
            alerts.append(("low_battery", f"Battery voltage {telemetry.battery_voltage}V is low"))

        if telemetry.signal_strength < -90:
            alerts.append(("weak_signal", f"Signal strength {telemetry.signal_strength}dB is weak"))

        for alert_type, message in alerts:
            existing_alert = self.db.query(Alert).filter(
                Alert.device_id == telemetry.device_id,
                Alert.alert_type == alert_type,
                Alert.resolved == 0
            ).first()

            if not existing_alert:
                alert = Alert(
                    device_id=telemetry.device_id,
                    alert_type=alert_type,
                    message=message
                )
                self.db.add(alert)