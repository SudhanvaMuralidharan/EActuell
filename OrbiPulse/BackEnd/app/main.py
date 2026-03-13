from fastapi import FastAPI, Depends
from .database import engine, Base
from .routes import auth_routes, plot_routes, valve_routes, telemetry_routes, alert_routes, schedule_routes
from .config.settings import APP_NAME, APP_VERSION

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=APP_NAME,
    description="Backend API for smart irrigation monitoring with AI-powered analytics",
    version=APP_VERSION
)

# Include routers
app.include_router(auth_routes.router)
app.include_router(plot_routes.router)
app.include_router(valve_routes.router)
app.include_router(telemetry_routes.router)
app.include_router(alert_routes.router)
app.include_router(schedule_routes.router)

@app.get("/")
def read_root():
    return {
        "message": "Smart Irrigation Monitoring System API",
        "version": APP_VERSION,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
