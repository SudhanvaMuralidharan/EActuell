# 🌱 OrbiPulse — Smart Irrigation Monitoring Platform

**OrbiPulse** is a full-stack IoT platform for monitoring and controlling smart irrigation valves across agricultural plots. It combines a **React Native mobile app**, a **FastAPI backend**, and an **autonomous AI agent** that detects anomalies (high pressure, blockages, excessive flow) and automatically adjusts valves in real time.

---

## 📁 Project Structure

```
OrbiPulse/
├── BackEnd/            # FastAPI backend + AI agent
│   ├── app/            # FastAPI application entry point
│   ├── ai_agent/       # Autonomous AI monitoring agent
│   ├── config/         # Database & app settings
│   ├── models/         # SQLAlchemy + Pydantic models
│   ├── routes/         # API endpoints
│   ├── services/       # Business logic layer
│   ├── dataset/        # Sample telemetry data
│   └── simulator/      # Telemetry simulator
│
├── frontend/           # React Native (Expo) mobile app
│   ├── app/            # Screens & navigation (Expo Router)
│   ├── components/     # Reusable UI components
│   ├── constants/      # Theme, colors, translations
│   ├── context/        # Auth, Theme, Valve, Language providers
│   ├── data/           # Mock valve/telemetry data
│   └── services/       # API service layer
```

---

## ✨ Features

### 📱 Mobile App (React Native + Expo)
- **Interactive Map** — Satellite view with valve markers, color-coded by status
- **Valve Control** — Open, close, or set precise position (0–100%) with slider
- **Telemetry Dashboard** — Real-time sparkline charts for current, voltage, temperature
- **Scheduler** — Create recurring irrigation schedules per valve
- **Multi-language** — English, Kannada, Hindi, Tamil
- **Dark Mode** — Full theme toggle
- **OTP Authentication** — Phone-based login flow

### ⚙️ Backend (FastAPI + PostgreSQL)
- **REST API** — Valve CRUD, telemetry queries, alert system, scheduling
- **JWT Authentication** — Secure token-based access
- **Alert Engine** — Threshold-based alerts for battery, temperature, pressure, flow
- **AI Insights** — 4-stage pipeline: analyze → detect anomalies → decide → recommend

### 🤖 Autonomous AI Agent
- **Background monitoring** — Continuously scans all valves every 60 seconds
- **Anomaly detection** — HIGH_PRESSURE, VALVE_BLOCKAGE, FLOW_RATE_MISMATCH
- **Auto-correction** — Reduces valve position or closes valves automatically

### 🗄️ Database (Supabase / PostgreSQL)
- `network.valves` — Valve registry with position, status, sensor data
- `telemetry.device_telemetry` — Time-series sensor readings
- `network.schedules` — Irrigation schedules

---

## 🚀 How to Run

### Prerequisites
- **Python 3.10+** (for backend)
- **Node.js 18+** (for frontend)
- **Expo Go** app on your phone (for mobile testing)
- **Supabase** account (database is cloud-hosted)

---

### 1. Backend

```bash
cd OrbiPulse/BackEnd

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt
pip install sqlalchemy[asyncio] asyncpg

# Create .env file with your Supabase database URL
# Example:
# DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **Swagger Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

### 2. Frontend

```bash
cd OrbiPulse/frontend

# Install dependencies
npm install

# Start Expo dev server (with tunnel for mobile access)
npx expo start --tunnel -c
```

Scan the QR code with **Expo Go** on your phone to open the app.

---

### 3. Database

The database is hosted on **Supabase** — no local setup required. It's always running in the cloud. To manage it:
- Visit [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Table Editor** or **SQL Editor**

---

## 🔑 Demo Login

The app uses mock OTP authentication for demo purposes:
- Enter any 10-digit phone number
- Enter any 6-digit OTP code
- You'll be logged in immediately

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native, Expo SDK 54, Expo Router |
| Backend | Python, FastAPI, SQLAlchemy (async) |
| Database | PostgreSQL (Supabase) |
| AI Agent | Custom anomaly detection + auto-correction |
| Auth | JWT + mock OTP |
| Maps | react-native-maps (satellite hybrid view) |

---

## 📄 License

MIT
