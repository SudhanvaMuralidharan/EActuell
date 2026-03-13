from fastapi import FastAPI
from .database import engine, Base
from .routes import plots, valves, telemetry

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Irrigation Monitoring System API",
    description="Backend API for monitoring irrigation valves",
    version="1.0.0"
)

# Include routers
app.include_router(plots.router)
app.include_router(valves.router)
app.include_router(telemetry.router)

# Authentication placeholder endpoints
@app.post("/auth/login")
def login():
    # Placeholder for phone or Google login
    return {"message": "Authentication placeholder - implement OAuth later"}

@app.post("/auth/register")
def register():
    # Placeholder for user registration
    return {"message": "Registration placeholder - implement user management later"}

@app.get("/")
def read_root():
    return {"message": "Smart Irrigation Monitoring System API"}
