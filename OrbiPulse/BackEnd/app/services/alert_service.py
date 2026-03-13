from sqlalchemy.orm import Session
from ..models.alert_model import AlertModel
from typing import List

class AlertService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_alerts(self, device_id: str = None, resolved: bool = None) -> List[AlertModel]:
        """Get alerts with optional filters"""
        query = self.db.query(AlertModel)
        
        if device_id:
            query = query.filter(AlertModel.device_id == device_id)
        
        if resolved is not None:
            query = query.filter(AlertModel.resolved == (1 if resolved else 0))
        
        return query.order_by(AlertModel.timestamp.desc()).all()
    
    def resolve_alert(self, alert_id: int) -> AlertModel:
        """Mark alert as resolved"""
        alert = self.db.query(AlertModel).filter(AlertModel.id == alert_id).first()
        if alert:
            alert.resolved = 1
            self.db.commit()
            self.db.refresh(alert)
        return alert
    
    def get_active_alerts_count(self, device_id: str = None) -> int:
        """Count active alerts"""
        query = self.db.query(AlertModel).filter(AlertModel.resolved == 0)
        if device_id:
            query = query.filter(AlertModel.device_id == device_id)
        return query.count()
