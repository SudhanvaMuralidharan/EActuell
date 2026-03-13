"""
telemetry_generator.py
----------------------
Standalone simulator that generates realistic telemetry records
and appends them to dataset/telemetry_data.json.

Usage:
    python simulator/telemetry_generator.py --valves valve_001 valve_002 --records 20
"""
import json
import random
import uuid
import argparse
from datetime import datetime, timedelta
from pathlib import Path

DATASET_PATH = Path(__file__).parent.parent / "dataset" / "telemetry_data.json"

# Baseline profiles per valve (mean ± noise)
VALVE_PROFILES = {
    "valve_001": {"flow_rate": 12.5, "pressure": 2.3, "temperature": 24.0, "motor_current": 1.2, "battery": 85},
    "valve_002": {"flow_rate": 14.9, "pressure": 2.1, "temperature": 23.8, "motor_current": 1.1, "battery": 91},
    "valve_003": {"flow_rate": 0.0,  "pressure": 2.2, "temperature": 23.5, "motor_current": 0.0, "battery": 14},
    "valve_004": {"flow_rate": 10.0, "pressure": 1.5, "temperature": 42.5, "motor_current": 3.6, "battery": 77},
    "valve_005": {"flow_rate": 11.0, "pressure": 2.2, "temperature": 24.5, "motor_current": 1.3, "battery": 65},
}

DEFAULT_PROFILE = {"flow_rate": 10.0, "pressure": 2.0, "temperature": 25.0, "motor_current": 1.5, "battery": 70}


def _jitter(value: float, noise: float = 0.05) -> float:
    """Add ±noise% random variation."""
    return round(value * (1 + random.uniform(-noise, noise)), 2)


def generate_records(valve_ids: list[str], n: int = 10, interval_minutes: int = 15) -> list[dict]:
    records = []
    now = datetime.utcnow()

    for valve_id in valve_ids:
        profile = VALVE_PROFILES.get(valve_id, DEFAULT_PROFILE)
        status = "open" if profile["flow_rate"] > 0 else "closed"

        for i in range(n):
            ts = now - timedelta(minutes=interval_minutes * (n - i))
            records.append({
                "id": f"tel_{uuid.uuid4().hex[:8]}",
                "valve_id": valve_id,
                "timestamp": ts.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "flow_rate": _jitter(profile["flow_rate"]),
                "pressure": _jitter(profile["pressure"]),
                "temperature": _jitter(profile["temperature"]),
                "battery_level": max(0, min(100, int(profile["battery"] - random.randint(0, 2)))),
                "motor_current": _jitter(profile["motor_current"]),
                "valve_status": status,
                "signal_strength": random.randint(-75, -55),
            })

    return records


def append_to_dataset(records: list[dict]) -> None:
    if DATASET_PATH.exists():
        with open(DATASET_PATH, "r") as f:
            data = json.load(f)
    else:
        data = {"telemetry": []}

    data["telemetry"].extend(records)

    with open(DATASET_PATH, "w") as f:
        json.dump(data, f, indent=2)

    print(f"✅ Appended {len(records)} records to {DATASET_PATH}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OrbiPulse telemetry simulator")
    parser.add_argument("--valves", nargs="+", default=list(VALVE_PROFILES.keys()), help="Valve IDs to simulate")
    parser.add_argument("--records", type=int, default=10, help="Records per valve")
    parser.add_argument("--interval", type=int, default=15, help="Minutes between readings")
    args = parser.parse_args()

    new_records = generate_records(args.valves, n=args.records, interval_minutes=args.interval)
    append_to_dataset(new_records)
