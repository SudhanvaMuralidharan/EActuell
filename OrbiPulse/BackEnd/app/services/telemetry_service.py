from sqlalchemy.orm import Session
from ..models.telemetry_model import TelemetryModel
from ..models.alert_model import AlertModel
from ..schemas import TelemetryCreate
from typing import List
from datetime import datetime, timedelta

class TelemetryService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_telemetry(self, telemetry: TelemetryCreate) -> TelemetryModel:
        """Insert single telemetry record"""
        db_telemetry = TelemetryModel(**telemetry.dict())
        self.db.add(db_telemetry)
        self.db.commit()
        self.db.refresh(db_telemetry)
        self._check_alerts(telemetry)
        return db_telemetry
    
    def create_telemetry_batch(self, telemetry_list: List[TelemetryCreate]) -> List[TelemetryModel]:
        """Bulk insert telemetry data"""
        db_telemetry_list = []
        for telemetry in telemetry_list:
            db_telemetry = TelemetryModel(**telemetry.dict())
            self.db.add(db_telemetry)
            db_telemetry_list.append(db_telemetry)
            self._check_alerts(telemetry)
        
        self.db.commit()
        for t in db_telemetry_list:
            self.db.refresh(t)
        return db_telemetry_list
    
    def get_latest_telemetry(self, device_id: str) -> TelemetryModel:
        """Get latest telemetry for device"""
        return self.db.query(TelemetryModel).filter(
            TelemetryModel.device_id == device_id
        ).order_by(TelemetryModel.timestamp.desc()).first()
    
    def get_telemetry_history(self, device_id: str, hours: int = 24) -> List[TelemetryModel]:
        """Get telemetry history for time period"""
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        return self.db.query(TelemetryModel).filter(
            TelemetryModel.device_id == device_id,
            TelemetryModel.timestamp >= cutoff
        ).order_by(TelemetryModel.timestamp.desc()).all()
    
    def _check_alerts(self, telemetry: TelemetryCreate):
        """Auto-generate alerts based on thresholds"""
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
            existing_alert = self.db.query(AlertModel).filter(
                AlertModel.device_id == telemetry.device_id,
                AlertModel.alert_type == alert_type,
                AlertModel.resolved == 0
            ).first()
            
            if not existing_alert:
                alert = AlertModel(
                    device_id=telemetry.device_id,
                    alert_type=alert_type,
                    message=message
                )
                self.db.add(alert)
