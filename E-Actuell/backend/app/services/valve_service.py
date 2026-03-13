from sqlalchemy.orm import Session, joinedload
from ..models import Valve, Telemetry
from ..schemas import ValveCreate, ValveWithTelemetry
from typing import List

class ValveService:
    def __init__(self, db: Session):
        self.db = db

    def create_valve(self, valve: ValveCreate) -> Valve:
        db_valve = Valve(**valve.dict())
        self.db.add(db_valve)
        self.db.commit()
        self.db.refresh(db_valve)
        return db_valve

    def get_valves(self) -> List[Valve]:
        return self.db.query(Valve).all()

    def get_valve(self, device_id: str) -> Valve:
        return self.db.query(Valve).filter(Valve.device_id == device_id).first()

    def get_valve_with_telemetry(self, device_id: str) -> ValveWithTelemetry:
        valve = self.db.query(Valve).filter(Valve.device_id == device_id).first()
        if valve:
            latest_telemetry = self.db.query(Telemetry).filter(Telemetry.device_id == device_id).order_by(Telemetry.timestamp.desc()).first()
            valve_dict = valve.__dict__.copy()
            valve_dict['latest_telemetry'] = latest_telemetry.__dict__ if latest_telemetry else None
            return ValveWithTelemetry(**valve_dict)
        return None

    def set_valve_flow(self, device_id: str, flow_percentage: float) -> Valve:
        valve = self.db.query(Valve).filter(Valve.device_id == device_id).first()
        if valve:
            valve.valve_flow = flow_percentage
            self.db.commit()
            self.db.refresh(valve)
        return valve

    def get_map_data(self) -> List[dict]:
        valves = self.db.query(Valve).options(joinedload(Valve.telemetry)).all()
        map_data = []
        for valve in valves:
            latest_telemetry = self.db.query(Telemetry).filter(Telemetry.device_id == valve.device_id).order_by(Telemetry.timestamp.desc()).first()
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