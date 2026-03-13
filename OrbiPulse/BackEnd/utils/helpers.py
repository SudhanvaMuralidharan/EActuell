from datetime import datetime
from typing import Any, Dict


def utcnow_iso() -> str:
    return datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")


def paginate(items: list, limit: int, offset: int) -> list:
    return items[offset: offset + limit]


def success_response(message: str, data: Any = None) -> Dict[str, Any]:
    resp: Dict[str, Any] = {"success": True, "message": message}
    if data is not None:
        resp["data"] = data
    return resp
