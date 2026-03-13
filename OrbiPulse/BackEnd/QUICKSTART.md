# Quick Start Guide - OrbiPulse Backend

## 🎯 Get Started in 5 Minutes

### Step 1: Install Python Dependencies

```bash
cd c:\Users\xxtri\Desktop\Eactuell\OrbiPulse\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Set Up Environment Variables

Create a `.env` file in the backend directory:

```bash
notepad .env
```

Add this content:

```env
DATABASE_URL=sqlite:///./irrigation.db
SUPABASE_URL=
SUPABASE_ANON_KEY=
DEBUG=True
```

### Step 3: Generate Test Data (Optional)

```bash
cd simulator
python telemetry_generator.py
cd ..
```

This creates sample telemetry data for testing.

### Step 4: Run the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 5: Access the API

- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Root Endpoint**: http://localhost:8000/

---

## 📝 First API Calls

### 1. Create a Plot

```bash
curl -X POST "http://localhost:8000/plots" \
  -H "Content-Type: application/json" \
  -d '{"name":"Farm Plot A","farmer_id":"FARMER_001"}'
```

### 2. Register a Valve

```bash
curl -X POST "http://localhost:8000/valves/register" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "VALVE_001",
    "model_number": "SMV-2024-A",
    "plot_id": 1,
    "latitude": 14.6745,
    "longitude": 75.9310
  }'
```

### 3. Add Telemetry Data

```bash
curl -X POST "http://localhost:8000/telemetry" \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2024-01-15T10:00:00Z",
    "device_id": "VALVE_001",
    "valve_position": 45.5,
    "battery_voltage": 12.4,
    "motor_current": 1.8,
    "temperature": 38.2,
    "signal_strength": -72.5,
    "status": "normal"
  }'
```

### 4. Get AI Health Analysis

```bash
curl "http://localhost:8000/ai/valve/VALVE_001/health"
```

---

## 🔧 Common Tasks

### View All Endpoints

Open http://localhost:8000/docs in your browser to see interactive API documentation.

### Check Database

The SQLite database file `irrigation.db` will be created automatically in the backend directory.

### Stop the Server

Press `Ctrl+C` in the terminal.

### Restart After Changes

The server auto-reloads when you change code. If not, restart:

```bash
uvicorn app.main:app --reload
```

---

## 🐛 Troubleshooting

### Port Already in Use

If port 8000 is busy, use a different port:

```bash
uvicorn app.main:app --reload --port 8001
```

### Module Not Found Errors

Make sure you're in the backend directory and virtual environment is activated:

```bash
cd c:\Users\xxtri\Desktop\Eactuell\OrbiPulse\backend
venv\Scripts\activate
```

### Database Errors

Delete the database and recreate:

```bash
del irrigation.db
# Then restart the server - it will create a new database
```

---

## 📚 Next Steps

1. **Explore the API** - Try all endpoints via /docs
2. **Integrate Frontend** - Connect your React Native app
3. **Set Up Supabase** - For production PostgreSQL database
4. **Add Authentication** - Implement Supabase Auth
5. **Deploy** - Deploy to production server

---

## 💡 Tips

- Use the interactive `/docs` page to test endpoints
- All responses are in JSON format
- Timestamps are in ISO 8601 format
- Health check endpoint: `/health` returns `{"status": "healthy"}`
- Default flow percentage is 0-100
- Alert thresholds are configurable in `telemetry_service.py`

Happy coding! 🚀
