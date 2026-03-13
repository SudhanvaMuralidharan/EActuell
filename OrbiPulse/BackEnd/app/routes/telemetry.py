from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.telemetry_service import TelemetryService
from ..schemas import TelemetryCreate
from typing import List, Union

router = APIRouter()

@router.post("/telemetry")
def ingest_telemetry(telemetry: Union[TelemetryCreate, List[TelemetryCreate]], db: Session = Depends(get_db)):
    telemetry_service = TelemetryService(db)
    if isinstance(telemetry, list):
        return telemetry_service.create_telemetry_batch(telemetry)
    else:
        return telemetry_service.create_telemetry(telemetry)