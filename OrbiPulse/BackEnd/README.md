# OrbiPulse Backend

Smart Irrigation Monitoring System - Backend API with AI-powered analytics

## 🚀 Features

- **RESTful API** - FastAPI-based backend
- **Database Support** - SQLite (dev) / PostgreSQL (production via Supabase)
- **AI Analytics** - Telemetry analysis, anomaly detection, predictive maintenance
- **Real-time Monitoring** - Valve telemetry and alerts
- **Scheduling** - Irrigation schedule management
- **Authentication Ready** - Supabase Auth integration ready

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py                     # FastAPI server entry point
│   ├── config/
│   │   └── settings.py             # App configuration
│   ├── routes/                     # API endpoints
│   │   ├── auth_routes.py
│   │   ├── plot_routes.py
│   │   ├── valve_routes.py
│   │   ├── telemetry_routes.py
│   │   ├── schedule_routes.py
│   │   ├── alert_routes.py
│   │   └── ai_routes.py
│   ├── services/                   # Business logic
│   │   ├── auth_service.py
│   │   ├── plot_service.py
│   │   ├── valve_service.py
│   │   ├── telemetry_service.py
│   │   ├── alert_service.py
│   │   └── scheduler_service.py
│   ├── models/                     # SQLAlchemy models
│   │   ├── user_model.py
│   │   ├── plot_model.py
│   │   ├── valve_model.py
│   │   ├── telemetry_model.py
│   │   ├── alert_model.py
│   │   └── schedule_model.py
│   ├── ai_agent/                   # AI monitoring system
│   │   ├── telemetry_analyzer.py
│   │   ├── anomaly_detector.py
│   │   ├── decision_engine.py
│   │   └── ai_service.py
│   ├── utils/                      # Helper utilities
│   │   ├── validators.py
│   │   └── helpers.py
│   ├── database.py                 # Database connection
│   └── schemas.py                  # Pydantic schemas
├── dataset/                        # Telemetry datasets
│   └── telemetry_data.json
├── simulator/                      # Data generator
│   └── telemetry_generator.py
├── requirements.txt
└── .gitignore
```

## 🛠️ Installation

### 1. Create Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Environment Variables

Create a `.env` file:

```env
DATABASE_URL=sqlite:///./irrigation.db
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
DEBUG=True
```

## 🚀 Running the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Access the API documentation at: `http://localhost:8000/docs`

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Plots
- `POST /plots` - Create plot
- `GET /plots` - Get all plots for farmer
- `GET /plots/{plot_id}` - Get single plot
- `DELETE /plots/{plot_id}` - Delete plot

### Valves
- `POST /valves/register` - Register valve
- `GET /valves` - Get all valves
- `GET /valves/{device_id}` - Get valve with telemetry
- `POST /valves/{device_id}/set-flow` - Set valve flow
- `GET /valves/map` - Get map data

### Telemetry
- `POST /telemetry` - Create telemetry record
- `POST /telemetry/batch` - Bulk insert telemetry
- `GET /telemetry/{device_id}/latest` - Get latest telemetry
- `GET /telemetry/{device_id}/history` - Get historical telemetry

### Alerts
- `GET /alerts` - Get all alerts
- `POST /alerts/{alert_id}/resolve` - Resolve alert
- `GET /alerts/count` - Get active alerts count

### Schedules
- `POST /schedules` - Create schedule
- `GET /schedules/{device_id}` - Get all schedules
- `GET /schedules/{device_id}/active` - Get active schedules
- `POST /schedules/{schedule_id}/toggle` - Toggle schedule
- `DELETE /schedules/{schedule_id}` - Delete schedule

### AI Analytics
- `GET /ai/valve/{device_id}/health` - Get valve health analysis
- `GET /ai/fleet/insights` - Get fleet insights
- `GET /ai/valve/{device_id}/report` - Generate AI report

## 🤖 AI Features

The system includes intelligent monitoring capabilities:

- **Trend Analysis** - Detects patterns in telemetry data
- **Anomaly Detection** - Identifies unusual readings using statistical methods
- **Health Scoring** - Calculates overall valve health (0-100)
- **Predictive Maintenance** - Forecasts maintenance needs
- **Recommendations** - Generates actionable insights

## 🗄️ Database Migration

### For SQLite (Development)
Already configured - just run the server.

### For PostgreSQL (Supabase Production)

1. Update `.env`:
```env
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

2. Run migrations:
```bash
alembic upgrade head
```

## 🧪 Testing

Generate test data:

```bash
cd simulator
python telemetry_generator.py
```

This creates sample telemetry data in `dataset/telemetry_data.json`.

## 📝 Notes

- Default port: 8000
- API docs available at `/docs`
- Health check endpoint: `/health`
- Supports both SQLite and PostgreSQL
- Ready for Supabase integration

## 🔐 Security

For production deployment:
1. Configure Supabase Auth
2. Enable Row Level Security (RLS) policies
3. Use environment variables for secrets
4. Implement JWT token validation
5. Add rate limiting

## 📄 License

MIT
