import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status

from models.plot_model import Plot, PlotCreate, PlotUpdate, PlotWithValves, GeoLocation

# ---------------------------------------------------------------------------
# In-memory store (replace with DB in production)
# ---------------------------------------------------------------------------
_PLOTS: dict[str, dict] = {}


def _seed_plots():
    demo_plots = [
        {
            "id": "plot_001",
            "owner_id": "demo",           # overwritten per user via seeding
            "name": "North Field",
            "description": "Primary wheat cultivation zone",
            "location": {"latitude": 24.7136, "longitude": 46.6753},
            "area_hectares": 12.5,
            "crop_type": "Wheat",
            "created_at": datetime(2025, 1, 10),
            "valve_ids": ["valve_001", "valve_002"],
        },
        {
            "id": "plot_002",
            "owner_id": "demo",
            "name": "South Orchard",
            "description": "Date palm grove",
            "location": {"latitude": 24.7056, "longitude": 46.6820},
            "area_hectares": 8.0,
            "crop_type": "Date Palm",
            "created_at": datetime(2025, 1, 12),
            "valve_ids": ["valve_003", "valve_004"],
        },
        {
            "id": "plot_003",
            "owner_id": "demo",
            "name": "Greenhouse A",
            "description": "Controlled tomato greenhouse",
            "location": {"latitude": 24.7200, "longitude": 46.6680},
            "area_hectares": 2.0,
            "crop_type": "Tomato",
            "created_at": datetime(2025, 2, 1),
            "valve_ids": ["valve_005"],
        },
    ]
    for p in demo_plots:
        _PLOTS[p["id"]] = p


_seed_plots()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _to_model(raw: dict) -> Plot:
    return Plot(
        id=raw["id"],
        owner_id=raw["owner_id"],
        name=raw["name"],
        description=raw.get("description"),
        location=GeoLocation(**raw["location"]),
        area_hectares=raw.get("area_hectares"),
        crop_type=raw.get("crop_type"),
        created_at=raw["created_at"],
        valve_count=len(raw.get("valve_ids", [])),
    )


# ---------------------------------------------------------------------------
# Service functions
# ---------------------------------------------------------------------------

def list_plots(owner_id: str) -> List[Plot]:
    return [_to_model(p) for p in _PLOTS.values() if p["owner_id"] in (owner_id, "demo")]


def get_plot(plot_id: str, owner_id: str) -> Plot:
    raw = _PLOTS.get(plot_id)
    if not raw or raw["owner_id"] not in (owner_id, "demo"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plot not found")
    return _to_model(raw)


def get_plot_with_valves(plot_id: str, owner_id: str) -> PlotWithValves:
    raw = _PLOTS.get(plot_id)
    if not raw or raw["owner_id"] not in (owner_id, "demo"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plot not found")
    plot = _to_model(raw)
    return PlotWithValves(**plot.dict(), valve_ids=raw.get("valve_ids", []))


def create_plot(data: PlotCreate, owner_id: str) -> Plot:
    pid = f"plot_{uuid.uuid4().hex[:8]}"
    raw = {
        "id": pid,
        "owner_id": owner_id,
        "name": data.name,
        "description": data.description,
        "location": data.location.dict(),
        "area_hectares": data.area_hectares,
        "crop_type": data.crop_type,
        "created_at": datetime.utcnow(),
        "valve_ids": [],
    }
    _PLOTS[pid] = raw
    return _to_model(raw)


def update_plot(plot_id: str, data: PlotUpdate, owner_id: str) -> Plot:
    raw = _PLOTS.get(plot_id)
    if not raw or raw["owner_id"] not in (owner_id, "demo"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plot not found")
    if data.name is not None:
        raw["name"] = data.name
    if data.description is not None:
        raw["description"] = data.description
    if data.location is not None:
        raw["location"] = data.location.dict()
    if data.area_hectares is not None:
        raw["area_hectares"] = data.area_hectares
    if data.crop_type is not None:
        raw["crop_type"] = data.crop_type
    return _to_model(raw)


def delete_plot(plot_id: str, owner_id: str) -> dict:
    raw = _PLOTS.get(plot_id)
    if not raw or raw["owner_id"] not in (owner_id, "demo"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plot not found")
    del _PLOTS[plot_id]
    return {"detail": "Plot deleted"}
