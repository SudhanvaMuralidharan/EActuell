from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.telemetry_service import TelemetryService
from ..schemas import TelemetryCreate, Telemetry
from typing import List

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

@router.post("", response_model=Telemetry)
def create_telemetry(telemetry: TelemetryCreate, db: Session = Depends(get_db)):
    """Create single telemetry record"""
    service = TelemetryService(db)
    return service.create_telemetry(telemetry)

@router.post("/batch", response_model=List[Telemetry])
def create_telemetry_batch(telemetry_list: List[TelemetryCreate], db: Session = Depends(get_db)):
    """Bulk insert telemetry data"""
    service = TelemetryService(db)
    return service.create_telemetry_batch(telemetry_list)

@router.get("/{device_id}/latest")
def get_latest_telemetry(device_id: str, db: Session = Depends(get_db)):
    """Get latest telemetry for device"""
    service = TelemetryService(db)
    telemetry = service.get_latest_telemetry(device_id)
    if not telemetry:
        raise HTTPException(status_code=404, detail="No telemetry found")
    return telemetry

@router.get("/{device_id}/history")
def get_telemetry_history(device_id: str, hours: int = 24, db: Session = Depends(get_db)):
    """Get telemetry history for time period"""
    service = TelemetryService(db)
    return service.get_telemetry_history(device_id, hours)
