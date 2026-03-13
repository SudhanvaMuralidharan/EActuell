# 🌱 OrbiPulse – Smart Irrigation Monitoring Backend

FastAPI backend for the OrbiPulse mobile app — monitors and controls smart irrigation valves installed in agricultural plots.

---

## Quick Start

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the server
```bash
# From the project root
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Open Swagger docs
```
http://localhost:8000/docs
```

### 4. Authenticate in Swagger
Click the 🔒 **Authorize** button and enter:
- **Username:** `farmer1`
- **Password:** `pass123`

---

## Project Structure

```
orbipulse-backend/
├── app/
│   └── main.py                  # FastAPI app, routers, CORS, startup
├── config/
│   └── settings.py              # Pydantic settings, thresholds, JWT config
├── routes/
│   ├── auth_routes.py           # POST /login, GET /me
│   ├── plot_routes.py           # CRUD /plots
│   ├── valve_routes.py          # CRUD /valves + POST /valves/{id}/control
│   ├── telemetry_routes.py      # GET /telemetry, /latest, /summary
│   ├── alert_routes.py          # GET /alerts, PATCH /alerts/{id}/acknowledge
│   ├── schedule_routes.py       # CRUD /schedules
│   └── ai_routes.py             # GET /ai/insights, /ai/insights/{valve_id}
├── services/
│   ├── auth_service.py          # JWT generation, user lookup
│   ├── plot_service.py          # Plot CRUD logic
│   ├── valve_service.py         # Valve CRUD + simulated actuation
│   ├── telemetry_service.py     # Load & query telemetry dataset
│   ├── alert_service.py         # Threshold evaluation & alert store
│   └── scheduler_service.py     # Schedule CRUD + next-run calculation
├── models/
│   ├── user_model.py
│   ├── plot_model.py
│   ├── valve_model.py
│   ├── telemetry_model.py
│   ├── alert_model.py
│   └── schedule_model.py
├── ai_agent/
│   ├── telemetry_analyzer.py    # Step 1 – aggregate telemetry into context
│   ├── anomaly_detector.py      # Step 2 – rule-based anomaly detection
│   ├── decision_engine.py       # Step 3 – health score + recommendations
│   └── ai_service.py            # Step 4 – pipeline orchestrator
├── utils/
│   ├── validators.py
│   └── helpers.py
├── dataset/
│   └── telemetry_data.json      # Seed telemetry data for 5 valves
├── simulator/
│   └── telemetry_generator.py   # CLI tool to generate more telemetry data
└── requirements.txt
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Authenticate, returns JWT |
| GET | `/me` | Current user info |
| GET | `/plots` | List all plots |
| POST | `/plots` | Create a plot |
| GET | `/plots/{id}` | Get plot details |
| GET | `/plots/{id}/valves` | Plot + its valve IDs |
| PATCH | `/plots/{id}` | Update plot |
| DELETE | `/plots/{id}` | Delete plot |
| GET | `/valves?plot_id=` | List valves (filter by plot) |
| POST | `/valves` | Register a valve |
| GET | `/valves/{id}` | Get valve details |
| PATCH | `/valves/{id}` | Update valve |
| POST | `/valves/{id}/control` | Open or close valve |
| DELETE | `/valves/{id}` | Delete valve |
| GET | `/telemetry` | All telemetry (filter by valve_id) |
| GET | `/telemetry/latest/{valve_id}` | Most recent reading |
| GET | `/telemetry/summary/{valve_id}` | Aggregated stats |
| GET | `/telemetry/summaries` | Stats for all valves |
| GET | `/alerts` | List alerts |
| POST | `/alerts/evaluate` | Re-run threshold evaluation |
| PATCH | `/alerts/{id}/acknowledge` | Acknowledge an alert |
| GET | `/schedules` | List schedules |
| POST | `/schedules` | Create a schedule |
| GET | `/schedules/{id}` | Get schedule |
| PATCH | `/schedules/{id}` | Update schedule |
| DELETE | `/schedules/{id}` | Delete schedule |
| GET | `/ai/insights` | AI insights for all valves |
| GET | `/ai/insights/{valve_id}` | AI insights for one valve |

---

## AI Agent Pipeline

```
Telemetry Records
      │
      ▼
telemetry_analyzer.py   → TelemetryContext (stats, trends)
      │
      ▼
anomaly_detector.py     → AnomalyReport (typed anomalies + severity)
      │
      ▼
decision_engine.py      → ValveDecision (health score, recommendations)
      │
      ▼
ai_service.py           → JSON response (health, anomalies, stats, actions)
```

### Detectable Anomalies

| Anomaly | Trigger |
|---------|---------|
| `critical_battery` | Battery ≤ 20% |
| `low_battery` | Battery ≤ 30% |
| `battery_draining` | Falling trend + battery < 50% |
| `high_temperature` | Avg temp > 40°C |
| `temperature_rising` | Rising trend + temp > 35°C |
| `abnormal_motor_current` | Avg current > 3A |
| `valve_blockage` | Low flow + high current (valve open) |
| `flow_rate_mismatch` | Flow outside 5–25 L/min (valve open) |
| `low_pressure` | Pressure < 1.0 bar |
| `high_pressure` | Pressure > 4.0 bar |
| `weak_signal` | Signal < -80 dBm |

---

## Telemetry Simulator

Generate additional telemetry records:

```bash
# Generate 20 records for all default valves
python simulator/telemetry_generator.py --records 20

# Generate for specific valves
python simulator/telemetry_generator.py --valves valve_001 valve_004 --records 15 --interval 10
```

---

## Configuration

All thresholds and settings live in `config/settings.py`. Override via `.env`:

```env
SECRET_KEY=your-production-secret
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATASET_PATH=/path/to/custom/telemetry.json
```

---

## Demo Data

The system seeds the following on startup:

**Plots:** North Field · South Orchard · Greenhouse A  
**Valves:** valve_001–005 (each with distinct telemetry profiles)  
**Alerts:** Auto-generated from telemetry at startup  
**Users:** farmer1 / farmer2 (password: `pass123`)
