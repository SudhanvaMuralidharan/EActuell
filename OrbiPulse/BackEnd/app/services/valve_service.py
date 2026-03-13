from sqlalchemy.orm import Session, joinedload
from ..models.valve_model import ValveModel
from ..models.telemetry_model import TelemetryModel
from ..schemas import ValveCreate, ValveWithTelemetry
from typing import List, Optional

class ValveService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_valve(self, valve: ValveCreate) -> ValveModel:
        """Register new valve"""
        db_valve = ValveModel(**valve.dict())
        self.db.add(db_valve)
        self.db.commit()
        self.db.refresh(db_valve)
        return db_valve
    
    def get_valves(self, plot_id: Optional[int] = None) -> List[ValveModel]:
        """Get all valves"""
        query = self.db.query(ValveModel)
        if plot_id:
            query = query.filter(ValveModel.plot_id == plot_id)
        return query.all()
    
    def get_valve(self, device_id: str) -> ValveModel:
        """Get single valve"""
        return self.db.query(ValveModel).filter(ValveModel.device_id == device_id).first()
    
    def get_valve_with_telemetry(self, device_id: str) -> ValveWithTelemetry:
        """Get valve with latest telemetry"""
        valve = self.db.query(ValveModel).filter(ValveModel.device_id == device_id).first()
        if valve:
            latest_telemetry = self.db.query(TelemetryModel).filter(
                TelemetryModel.device_id == device_id
            ).order_by(TelemetryModel.timestamp.desc()).first()
            
            valve_dict = valve.__dict__.copy()
            valve_dict['latest_telemetry'] = latest_telemetry.__dict__ if latest_telemetry else None
            return ValveWithTelemetry(**valve_dict)
        return None
    
    def set_valve_flow(self, device_id: str, flow_percentage: float) -> ValveModel:
        """Set valve flow percentage"""
        valve = self.db.query(ValveModel).filter(ValveModel.device_id == device_id).first()
        if valve:
            valve.valve_flow = flow_percentage
            self.db.commit()
            self.db.refresh(valve)
        return valve
    
    def get_map_data(self) -> List[dict]:
        """Get map data with valve locations"""
        valves = self.db.query(ValveModel).options(joinedload(ValveModel.telemetry)).all()
        map_data = []
        
        for valve in valves:
            latest_telemetry = self.db.query(TelemetryModel).filter(
                TelemetryModel.device_id == valve.device_id
            ).order_by(TelemetryModel.timestamp.desc()).first()
            
            map_data.append({
                "device_id": valve.device_id,
                "latitude": valve.latitude,
                "longitude": valve.longitude,
                "status": latest_telemetry.status if latest_telemetry else "unknown",
                "latest_telemetry": {
                    "valve_position": latest_telemetry.valve_position if latest_telemetry else None,
                    "battery_voltage": latest_telemetry.battery_voltage if latest_telemetry else None,
                    "temperature": latest_telemetry.temperature if latest_telemetry else None,
                    "signal_strength": latest_telemetry.signal_strength if latest_telemetry else None,
                } if latest_telemetry else None
            })
        
        return map_data
