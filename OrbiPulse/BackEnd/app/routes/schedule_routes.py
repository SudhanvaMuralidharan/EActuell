from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.scheduler_service import SchedulerService
from ..schemas import ScheduleCreate, Schedule
from typing import List

router = APIRouter(prefix="/schedules", tags=["Schedules"])

@router.post("", response_model=Schedule)
def create_schedule(schedule: ScheduleCreate, db: Session = Depends(get_db)):
    """Create irrigation schedule"""
    service = SchedulerService(db)
    return service.create_schedule(schedule.dict())

@router.get("/{device_id}", response_model=List[Schedule])
def get_schedules(device_id: str, db: Session = Depends(get_db)):
    """Get all schedules for valve"""
    service = SchedulerService(db)
    return service.get_schedules(device_id)

@router.get("/{device_id}/active")
def get_active_schedules(device_id: str, db: Session = Depends(get_db)):
    """Get currently active schedules"""
    service = SchedulerService(db)
    return service.get_active_schedules(device_id)

@router.post("/{schedule_id}/toggle")
def toggle_schedule(schedule_id: int, db: Session = Depends(get_db)):
    """Enable/disable schedule"""
    service = SchedulerService(db)
    schedule = service.toggle_schedule(schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"message": "Schedule toggled successfully"}

@router.delete("/{schedule_id}")
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    """Delete schedule"""
    service = SchedulerService(db)
    if not service.delete_schedule(schedule_id):
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"message": "Schedule deleted successfully"}
