# OrbiPulse — Smart Water Network App

A full-featured Expo (React Native) mobile application built for the **OrbiPulse Smart Water Network Challenge**. Covers Challenges 1, 2, 3, 5, 6, and 7 from the hackathon problem statement.

---

## Screens & Challenge Coverage

| Tab | Screen | Challenge |
|-----|--------|-----------|
| 🗺 Map | Interactive valve network map with status colours, gateway pins, and detail panel | **#1** |
| 📡 Telemetry | Live-updating telemetry dashboard with sparklines, health table, and condition alerts | **#2 + #5** |
| ⚙️ Control | Valve control panel — open/close/set position with simulated ACK/NACK | **#3** |
| 📅 Schedule | Farmer irrigation scheduler — create, edit, enable/disable schedules | **#7** |
| (hook) | `useSimulator` hook — generates realistic live MQTT-style telemetry | **#6** |
| (screen) | Valve detail screen — deep-linked from the map, shows full condition flags | bonus |

---

## Project Structure

```
orbipulse/
├── app/
│   ├── _layout.tsx              # Root Stack navigator
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab bar
│   │   ├── index.tsx            # Map screen
│   │   ├── telemetry.tsx        # Telemetry dashboard
│   │   ├── control.tsx          # Valve control panel
│   │   └── scheduler.tsx        # Irrigation scheduler
│   └── valve/
│       └── [id].tsx             # Valve detail (deep link)
├── components/
│   ├── MetricCard.tsx           # Reusable KPI card
│   ├── StatusBadge.tsx          # Coloured status pill
│   ├── Sparkline.tsx            # SVG sparkline chart
│   └── ValveGauge.tsx           # SVG circular position gauge
├── constants/
│   └── theme.ts                 # Colours, spacing, typography
├── data/
│   └── mockData.ts              # 20 valves + 3 gateways + schedules
├── hooks/
│   └── useSimulator.ts          # Challenge 6 — live telemetry generator
├── app.json
├── babel.config.js
├── metro.config.js
├── package.json
└── tsconfig.json
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli` (or use `npx expo`)
- iOS Simulator / Android Emulator **or** the [Expo Go](https://expo.dev/client) app on your phone

### 1. Install dependencies
```bash
npm install
```

### 2. Start the dev server
```bash
npx expo start
```

Press **i** for iOS simulator, **a** for Android, or scan the QR code with Expo Go.

---

## Key Features

### Map (Challenge 1)
- Satellite map view with valve markers colour-coded by status
- Gateway markers with Wi-Fi icon
- Status filter chips (All / Open / Partial / Closed / Fault / Offline)
- Tap any valve → animated bottom sheet with gauge + metrics
- "Full Detail" button deep-links to the valve detail screen

### Telemetry (Challenge 2 + 5)
- Live telemetry updates every 3 s with pulsing indicator
- Fleet summary: Online / Fault / Offline counts
- Red alert banner when faults are detected
- Horizontal device selector with fault badges
- Per-device panel: battery, current, temp, signal cards + sparklines
- Auto-alerts when motor current > 2A, battery < 3.3V, temp > 45°C
- Full-fleet health table with colour-coded values — tap row to focus

### Control Panel (Challenge 3)
- Select any valve from the horizontal picker
- Circular gauge shows live position
- **OPEN** and **CLOSE** one-tap buttons
- Position slider with 5% steps + "Apply" button
- Simulated 800–1500 ms network round-trip with ACK/NACK (92% success)
- Offline/fault valves are blocked with a visual notice
- Scrolling command log with colour-coded ACK ✓ / NACK ✗

### Irrigation Scheduler (Challenge 7)
- Today's schedule timeline at the top
- Create / edit schedules: valve, start time, duration, repeat days
- Day-of-week quick presets (every day, weekdays, weekends, alt days)
- Human-readable schedule preview before saving
- Enable/disable toggle per schedule
- Delete with confirmation alert
- Summary cards: total, active, today's count, avg daily minutes

### Telemetry Simulator (Challenge 6)
`hooks/useSimulator.ts` — a React hook that:
- Drifts all telemetry values realistically per tick
- Randomly moves valves (3% chance per tick)
- Emits gateway heartbeats
- Fires random alert messages (5% chance per tick)
- Returns `{ messages, isRunning, messageCount, alertCount, start, stop, clear }`

---

## Mock Data

`data/mockData.ts` contains:
- **20 valves** across 3 gateways and 6 zones
- Mixed statuses: open, partial, closed, fault (×2), offline (×2)
- Realistic GPS coordinates clustered around a simulated farm area
- Pre-seeded irrigation schedules
- Helper functions: `getStatusColor`, `getBatteryColor`, `formatLastSeen`, `generateTelemetryHistory`

---

## Design System

Dark industrial theme in `constants/theme.ts`:

| Token | Value | Usage |
|-------|-------|-------|
| `Colors.accent` | `#00E5A0` | Open / active / CTA |
| `Colors.blue` | `#4A9EFF` | Info / closed valve |
| `Colors.orange` | `#F5A623` | Partial / warning |
| `Colors.red` | `#FF4D6D` | Fault / danger |
| `Colors.bg` | `#050D1A` | App background |

---

## Extending for Live MQTT

To connect to a real Mosquitto broker or the OrbiPulse MQTT backend, replace the mock updates in `hooks/useSimulator.ts` with a WebSocket/MQTT client (e.g. `mqtt` or `paho-mqtt`). The message shape in `TelemetryMessage` matches the `MESSAGE_CHEATSHEET.md` format from the starter kit.

---

## Judging Criteria Alignment

| Criterion | Coverage |
|-----------|----------|
| **Practical usefulness (35%)** | All 4 tabs directly address farmer + operator workflows |
| **User experience (25%)** | Dark industrial theme, animated transitions, one-hand-friendly controls |
| **Technical implementation (20%)** | TypeScript, Expo Router, SVG gauges, live simulation, modular architecture |
| **Presentation (20%)** | Clean hierarchy, status colour system, responsive to all phone sizes |
