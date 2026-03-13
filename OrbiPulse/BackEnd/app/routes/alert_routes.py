from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.alert_service import AlertService
from ..schemas import Alert
from typing import List

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[Alert])
def get_alerts(device_id: str = None, resolved: bool = None, db: Session = Depends(get_db)):
    """Get alerts with optional filters"""
    service = AlertService(db)
    return service.get_alerts(device_id=device_id, resolved=resolved)

@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    """Mark alert as resolved"""
    service = AlertService(db)
    alert = service.resolve_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert resolved successfully"}

@router.get("/count")
def get_active_alerts_count(device_id: str = None, db: Session = Depends(get_db)):
    """Count active alerts"""
    service = AlertService(db)
    count = service.get_active_alerts_count(device_id=device_id)
    return {"active_alerts": count}
