import re
from fastapi import HTTPException, status


def validate_time_format(t: str) -> str:
    """Ensure time string is HH:MM (24h)."""
    if not re.match(r"^\d{2}:\d{2}$", t):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid time format '{t}'. Expected HH:MM (24-hour).",
        )
    h, m = map(int, t.split(":"))
    if not (0 <= h <= 23 and 0 <= m <= 59):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Time '{t}' is out of range.",
        )
    return t


def validate_coordinates(lat: float, lon: float) -> None:
    if not (-90 <= lat <= 90):
        raise HTTPException(status_code=422, detail=f"Latitude {lat} out of range [-90, 90]")
    if not (-180 <= lon <= 180):
        raise HTTPException(status_code=422, detail=f"Longitude {lon} out of range [-180, 180]")
