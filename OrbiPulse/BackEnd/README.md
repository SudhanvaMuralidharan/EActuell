# ⚙️ OrbiPulse Backend — Smart Irrigation API

FastAPI backend for the OrbiPulse smart irrigation platform. Provides REST endpoints for valve management, telemetry monitoring, alert evaluation, and an autonomous AI agent that detects anomalies and auto-corrects valve positions.

---

## 📁 Structure

```
BackEnd/
├── app/
│   └── main.py              # FastAPI application + startup
├── ai_agent/
│   ├── ai_service.py         # AI insight pipeline
│   ├── anomaly_detector.py   # Anomaly detection logic
│   └── autonomous_agent.py   # Background monitoring agent
├── config/
│   ├── database.py           # Async SQLAlchemy engine + session
│   └── settings.py           # App settings (env-based)
├── models/
│   ├── database_models.py    # SQLAlchemy ORM models (ValveDB, TelemetryDB, ScheduleDB)
│   ├── valve_model.py        # Pydantic request/response schemas
│   ├── telemetry_model.py    # Telemetry data schemas
│   ├── alert_model.py        # Alert schemas
│   └── user_model.py         # User/auth schemas
├── routes/
│   ├── auth_routes.py        # JWT authentication
│   ├── valve_routes.py       # Valve CRUD + control
│   ├── telemetry_routes.py   # Telemetry queries
│   ├── alert_routes.py       # Alert management
│   ├── schedule_routes.py    # Irrigation scheduling
│   ├── ai_routes.py          # AI insights endpoints
│   └── plot_routes.py        # Plot management
├── services/
│   ├── valve_service.py      # Valve business logic
│   ├── telemetry_service.py  # Telemetry data access
│   ├── alert_service.py      # Alert evaluation engine
│   ├── auth_service.py       # JWT + user authentication
│   └── plot_service.py       # Plot management
├── dataset/                  # Sample telemetry JSON data
├── requirements.txt          # Python dependencies
└── .env                      # Environment variables (not committed)
```

---

## 🚀 How to Run

### 1. Set Up Virtual Environment

```bash
cd OrbiPulse/BackEnd

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # macOS/Linux
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
pip install sqlalchemy[asyncio] asyncpg
```

### 3. Configure Environment

Create a `.env` file in the `BackEnd/` directory:

```env
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres
DEBUG=True
```

### 4. Start the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Access the API

| URL | Description |
|-----|------------|
| http://localhost:8000/ | Health check |
| http://localhost:8000/docs | Swagger UI (interactive API docs) |
| http://localhost:8000/health | Liveness probe |

---

## 🔌 API Endpoints

All endpoints are prefixed with `/api`.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with username/password → JWT token |

### Valves
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/valves` | List all valves (optional `?zone=` filter) |
| GET | `/api/valves/{device_id}` | Get valve details |
| POST | `/api/valves` | Register a new valve |
| PATCH | `/api/valves/{device_id}` | Update valve metadata |
| POST | `/api/valves/{device_id}/control` | Open/close/set position |
| DELETE | `/api/valves/{device_id}` | Delete a valve |

### Telemetry
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/telemetry` | Get telemetry records |
| GET | `/api/telemetry/summary` | Aggregated telemetry summary |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | List alerts |
| POST | `/api/alerts/{id}/acknowledge` | Acknowledge an alert |

### AI Insights
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/insights` | Get AI insights for all valves |
| GET | `/api/ai/insights/{device_id}` | Get AI insights for a specific valve |

### Schedules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schedules` | List schedules |
| POST | `/api/schedules` | Create a schedule |
| DELETE | `/api/schedules/{id}` | Delete a schedule |

---

## 🤖 Autonomous AI Agent

The backend includes a background AI agent that starts automatically on server launch:

- **Runs every 60 seconds** — scans all valves in the database
- **Detects anomalies** — high pressure, valve blockage, excessive flow
- **Takes action** — reduces valve position by 15–20% or closes valve entirely
- **Logs everything** — all actions logged with `[AUTONOMOUS]` prefix

The agent can be tuned via the `interval_seconds` parameter in `autonomous_agent.py`.

---

## 🗄️ Database Schema

The backend connects to a **Supabase PostgreSQL** database with the following tables:

### `network.valves`
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| device_id | varchar | Unique valve identifier |
| gateway_id | varchar | Associated gateway |
| zone | varchar | Geographic zone |
| latitude / longitude | float | GPS coordinates |
| valve_position | integer | Current position (0–100%) |
| battery_voltage | float | Battery level |
| motor_current | float | Motor current draw |
| temperature | float | Internal temperature |
| signal_strength | integer | Signal strength (dBm) |
| status | varchar | open/closed/partial/fault/offline |

### `telemetry.device_telemetry`
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| device_id | varchar | Valve identifier |
| position | integer | Valve position at reading time |
| motor_current | float | Current draw |
| temperature | float | Temperature reading |
| battery_voltage | float | Battery voltage |
| flow_rate | float | Water flow rate |
| pressure | float | Water pressure |
| timestamp | datetime | Reading timestamp |

---

## 🔐 Demo Credentials

| Username | Password |
|----------|----------|
| farmer1 | pass123 |
| farmer2 | pass123 |

Use Swagger UI at `/docs` → click **Authorize** 🔒 → enter credentials.

---

## 📄 License

MIT
