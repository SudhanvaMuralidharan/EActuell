from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.valve_service import ValveService
from ..schemas import ValveCreate, Valve, ValveWithTelemetry, SetFlowRequest, MapData
from typing import List

router = APIRouter(prefix="/valves", tags=["Valves"])

@router.post("/register", response_model=Valve)
def register_valve(valve: ValveCreate, db: Session = Depends(get_db)):
    """Register new valve"""
    service = ValveService(db)
    return service.create_valve(valve)

@router.get("", response_model=List[Valve])
def get_valves(plot_id: int = None, db: Session = Depends(get_db)):
    """Get all valves"""
    service = ValveService(db)
    return service.get_valves(plot_id=plot_id)

@router.get("/{device_id}", response_model=ValveWithTelemetry)
def get_valve(device_id: str, db: Session = Depends(get_db)):
    """Get single valve with latest telemetry"""
    service = ValveService(db)
    valve = service.get_valve_with_telemetry(device_id)
    if not valve:
        raise HTTPException(status_code=404, detail="Valve not found")
    return valve

@router.get("/{device_id}/telemetry/latest")
def get_latest_telemetry(device_id: str, db: Session = Depends(get_db)):
    """Get latest telemetry for valve"""
    service = ValveService(db)
    telemetry = service.get_valve(device_id)
    if not telemetry:
        raise HTTPException(status_code=404, detail="No telemetry found for this valve")
    return telemetry

@router.post("/{device_id}/set-flow")
def set_valve_flow(device_id: str, request: SetFlowRequest, db: Session = Depends(get_db)):
    """Set valve flow percentage"""
    service = ValveService(db)
    valve = service.set_valve_flow(device_id, request.flow_percentage)
    if not valve:
        raise HTTPException(status_code=404, detail="Valve not found")
    return {"message": f"Flow set to {request.flow_percentage}% for valve {device_id}"}

@router.get("/map", response_model=List[MapData])
def get_map_data(db: Session = Depends(get_db)):
    """Get map data with valve locations"""
    service = ValveService(db)
    return service.get_map_data()
