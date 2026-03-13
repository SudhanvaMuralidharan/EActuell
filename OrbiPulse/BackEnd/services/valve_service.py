import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status

from models.valve_model import Valve, ValveCreate, ValveUpdate

# ---------------------------------------------------------------------------
# In-memory store
# ---------------------------------------------------------------------------
_VALVES: dict[str, dict] = {}


def _seed_valves():
    demo_valves = [
        {"id": "valve_001", "plot_id": "plot_001", "name": "Zone A – Main Inlet",
         "description": "Primary feed valve for North Field Zone A", "status": "open",
         "latitude": 24.7140, "longitude": 46.6755, "model_number": "ORB-V200",
         "installed_at": datetime(2025, 1, 10), "last_seen": datetime(2025, 3, 13, 6, 30), "is_active": True},
        {"id": "valve_002", "plot_id": "plot_001", "name": "Zone B – Drip Line",
         "description": "Drip irrigation for North Field Zone B", "status": "open",
         "latitude": 24.7130, "longitude": 46.6760, "model_number": "ORB-V200",
         "installed_at": datetime(2025, 1, 11), "last_seen": datetime(2025, 3, 13, 6, 15), "is_active": True},
        {"id": "valve_003", "plot_id": "plot_002", "name": "Palm Row 1",
         "description": "Drip feed for palm row 1 – critical battery", "status": "closed",
         "latitude": 24.7060, "longitude": 46.6825, "model_number": "ORB-V100",
         "installed_at": datetime(2025, 1, 12), "last_seen": datetime(2025, 3, 13, 6, 15), "is_active": True},
        {"id": "valve_004", "plot_id": "plot_002", "name": "Palm Row 2",
         "description": "High-temp anomaly detected", "status": "open",
         "latitude": 24.7055, "longitude": 46.6830, "model_number": "ORB-V100",
         "installed_at": datetime(2025, 1, 12), "last_seen": datetime(2025, 3, 13, 6, 15), "is_active": True},
        {"id": "valve_005", "plot_id": "plot_003", "name": "Greenhouse Inlet",
         "description": "Main inlet for Greenhouse A", "status": "open",
         "latitude": 24.7202, "longitude": 46.6685, "model_number": "ORB-V300",
         "installed_at": datetime(2025, 2, 1), "last_seen": datetime(2025, 3, 13, 6, 0), "is_active": True},
    ]
    for v in demo_valves:
        _VALVES[v["id"]] = v


_seed_valves()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _to_model(raw: dict) -> Valve:
    return Valve(**{k: v for k, v in raw.items()})


# ---------------------------------------------------------------------------
# Service functions
# ---------------------------------------------------------------------------

def list_valves_for_plot(plot_id: str) -> List[Valve]:
    return [_to_model(v) for v in _VALVES.values() if v["plot_id"] == plot_id]


def get_valve(valve_id: str) -> Valve:
    raw = _VALVES.get(valve_id)
    if not raw:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Valve not found")
    return _to_model(raw)


def create_valve(data: ValveCreate) -> Valve:
    vid = f"valve_{uuid.uuid4().hex[:8]}"
    raw = {
        "id": vid,
        "plot_id": data.plot_id,
        "name": data.name,
        "description": data.description,
        "latitude": data.latitude,
        "longitude": data.longitude,
        "model_number": data.model_number,
        "status": "unknown",
        "installed_at": datetime.utcnow(),
        "last_seen": None,
        "is_active": True,
    }
    _VALVES[vid] = raw
    return _to_model(raw)


def update_valve(valve_id: str, data: ValveUpdate) -> Valve:
    raw = _VALVES.get(valve_id)
    if not raw:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Valve not found")
    for field, value in data.dict(exclude_none=True).items():
        raw[field] = value
    return _to_model(raw)


def control_valve(valve_id: str, action: str) -> Valve:
    """Open or close a valve (simulated)."""
    raw = _VALVES.get(valve_id)
    if not raw:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Valve not found")
    if action not in ("open", "close"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Action must be 'open' or 'close'")
    raw["status"] = "open" if action == "open" else "closed"
    raw["last_seen"] = datetime.utcnow()
    return _to_model(raw)


def delete_valve(valve_id: str) -> dict:
    if valve_id not in _VALVES:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Valve not found")
    del _VALVES[valve_id]
    return {"detail": "Valve deleted"}
