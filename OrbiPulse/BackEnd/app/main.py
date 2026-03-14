from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import get_settings
from routes import (
    auth_routes,
    plot_routes,
    valve_routes,
    telemetry_routes,
    alert_routes,
    schedule_routes,
    ai_routes,
)
from services.alert_service import run_full_evaluation

settings = get_settings()

# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## 🌱 OrbiPulse – Smart Irrigation Monitoring API

A backend API for monitoring and controlling smart irrigation valves
installed across agricultural plots.

### Features
- **JWT Authentication** — secure token-based access
- **Plot Management** — create and manage geo-referenced agricultural plots
- **Valve Management** — register, control (open/close), and monitor valves
- **Telemetry Monitoring** — stream and query sensor readings
- **Alert System** — threshold-based alerts with acknowledgement
- **Irrigation Scheduling** — recurring schedules per valve
- **AI Insights** — 4-stage pipeline: analyze → detect anomalies → decide → recommend

### Demo Credentials
| Username | Password |
|----------|----------|
| farmer1  | pass123  |
| farmer2  | pass123  |

Use the **Authorize** button (🔒) above with:
`username: farmer1`, `password: pass123`
""",
    contact={"name": "OrbiPulse Team", "email": "dev@orbipulse.io"},
    license_info={"name": "MIT"},
)

# ---------------------------------------------------------------------------
# CORS — allow all origins for development (tighten in production)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers (with /api prefix to match frontend config)
# ---------------------------------------------------------------------------
from fastapi import APIRouter

api_router = APIRouter(prefix="/api")
api_router.include_router(auth_routes.router)
api_router.include_router(plot_routes.router)
api_router.include_router(valve_routes.router)
api_router.include_router(telemetry_routes.router)
api_router.include_router(alert_routes.router)
api_router.include_router(schedule_routes.router)
api_router.include_router(ai_routes.router)

app.include_router(api_router)


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
from ai_agent.autonomous_agent import agent as auto_agent

@app.on_event("startup")
async def on_startup():
    """Pre-populate alerts and start AI agent on startup."""
    import logging
    logger = logging.getLogger("startup")

    # 1. Seed alerts (non-fatal if DB schema is incomplete)
    try:
        from config.database import SessionLocal
        async with SessionLocal() as db:
            await run_full_evaluation(db)
        print("✅ Alert evaluation complete")
    except Exception as e:
        logger.warning(f"⚠️  Alert evaluation skipped (DB issue): {e}")

    # 2. Start Autonomous AI Agent (non-fatal)
    try:
        await auto_agent.start()
        print("🤖 Autonomous AI Agent is ACTIVE")
    except Exception as e:
        logger.warning(f"⚠️  AI Agent start skipped: {e}")

    print(f"✅ {settings.APP_NAME} v{settings.APP_VERSION} started")
    print("📖 Swagger docs → http://localhost:8000/docs")


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"], summary="API health check")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"], summary="Liveness probe")
def health():
    return {"status": "ok"}
