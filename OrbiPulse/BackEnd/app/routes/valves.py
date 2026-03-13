from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.valve_service import ValveService
from ..services.telemetry_service import TelemetryService
from ..schemas import ValveCreate, Valve, ValveWithTelemetry, SetFlowRequest, MapData
from typing import List

router = APIRouter()

@router.post("/valves/register", response_model=Valve)
def register_valve(valve: ValveCreate, db: Session = Depends(get_db)):
    valve_service = ValveService(db)
    return valve_service.create_valve(valve)

@router.get("/valves", response_model=List[Valve])
def get_valves(db: Session = Depends(get_db)):
    valve_service = ValveService(db)
    return valve_service.get_valves()

@router.get("/valves/{device_id}", response_model=ValveWithTelemetry)
def get_valve(device_id: str, db: Session = Depends(get_db)):
    valve_service = ValveService(db)
    valve = valve_service.get_valve_with_telemetry(device_id)
    if not valve:
        raise HTTPException(status_code=404, detail="Valve not found")
    return valve

@router.get("/valves/{device_id}/telemetry/latest")
def get_latest_telemetry(device_id: str, db: Session = Depends(get_db)):
    telemetry_service = TelemetryService(db)
    telemetry = telemetry_service.get_latest_telemetry(device_id)
    if not telemetry:
        raise HTTPException(status_code=404, detail="No telemetry found for this valve")
    return telemetry

@router.post("/valves/{device_id}/set-flow")
def set_valve_flow(device_id: str, request: SetFlowRequest, db: Session = Depends(get_db)):
    valve_service = ValveService(db)
    valve = valve_service.set_valve_flow(device_id, request.flow_percentage)
    if not valve:
        raise HTTPException(status_code=404, detail="Valve not found")
    return {"message": f"Flow set to {request.flow_percentage}% for valve {device_id}"}

@router.get("/valves/map")
def get_map_data(db: Session = Depends(get_db)):
    valve_service = ValveService(db)
    return valve_service.get_map_data()