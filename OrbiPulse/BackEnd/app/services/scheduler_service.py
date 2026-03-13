from sqlalchemy.orm import Session
from ..models.schedule_model import Schedule
from datetime import datetime
from typing import List

class SchedulerService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_schedule(self, schedule_data: dict) -> Schedule:
        """Create irrigation schedule"""
        db_schedule = Schedule(**schedule_data)
        self.db.add(db_schedule)
        self.db.commit()
        self.db.refresh(db_schedule)
        return db_schedule
    
    def get_schedules(self, device_id: str) -> List[Schedule]:
        """Get all schedules for valve"""
        return self.db.query(Schedule).filter(Schedule.device_id == device_id).all()
    
    def get_active_schedules(self, device_id: str) -> List[Schedule]:
        """Get currently active schedules"""
        now = datetime.utcnow()
        return self.db.query(Schedule).filter(
            Schedule.device_id == device_id,
            Schedule.enabled == True,
            Schedule.start_time <= now,
            Schedule.end_time >= now
        ).all()
    
    def toggle_schedule(self, schedule_id: int) -> Schedule:
        """Enable/disable schedule"""
        schedule = self.db.query(Schedule).filter(Schedule.id == schedule_id).first()
        if schedule:
            schedule.enabled = not schedule.enabled
            self.db.commit()
            self.db.refresh(schedule)
        return schedule
    
    def delete_schedule(self, schedule_id: int) -> bool:
        """Delete schedule"""
        schedule = self.db.query(Schedule).filter(Schedule.id == schedule_id).first()
        if schedule:
            self.db.delete(schedule)
            self.db.commit()
            return True
        return False
