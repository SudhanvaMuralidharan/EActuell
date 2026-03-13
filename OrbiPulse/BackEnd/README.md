# Smart Irrigation Monitoring System Backend

This is the backend API for the Smart Irrigation Monitoring System built with FastAPI.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. Access the API documentation at: http://localhost:8000/docs

## API Endpoints

### Authentication (Placeholder)
- POST /auth/login
- POST /auth/register

### Plots
- POST /plots - Create a new plot
- GET /plots - Get all plots

### Valves
- POST /valves/register - Register a new valve
- GET /valves - Get all valves
- GET /valves/{device_id} - Get valve details with latest telemetry
- GET /valves/{device_id}/telemetry/latest - Get latest telemetry for a valve
- POST /valves/{device_id}/set-flow - Set valve flow percentage
- GET /valves/map - Get map data for all valves

### Telemetry
- POST /telemetry - Ingest telemetry data (single or batch)

## Database

The application uses SQLite for development. The database file `irrigation.db` will be created automatically when the server starts.

## Features

- Telemetry ingestion with automatic alert detection
- Valve management and flow control
- Plot management
- Map data for mobile app integration
- Automatic API documentation with Swagger UI