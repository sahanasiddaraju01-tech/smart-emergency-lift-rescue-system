# Smart Emergency Lift Rescue System
> **Autonomous Dual-Door Safety Evaluation & Protected Egress Management**  
> *A full-stack software simulation prototype engineered for CSE student portfolio, GitHub, LinkedIn, and technical resume demonstration.*

---

## ⚠️ Crucial Safety Disclaimer
> **"This project is a software simulation and educational prototype. It does not control or interface with real elevator hardware or building safety systems. Real elevator safety systems require certified hardware, professional engineering, testing, and regulatory approval."**

---

## 1. Problem Statement & Motivation
Standard elevators rely entirely on a single front entrance that opens onto common hallway landings. During mechanical breakdowns, power grid blackouts, or structural fires:
- Stalled cabins suspended between floors leave occupants trapped with zero safe self-evacuation routes.
- Attempting to force open standard front doors exposes passengers to fatal elevator shaft drop-offs.
- Conventional rescues require extensive delays waiting for specialized technician teams with manual hoisting tools.

The **Smart Emergency Lift Rescue System** introduces an intelligent dual-door architecture:
1. **Normal Entrance:** Front standard sliding doors for everyday transit.
2. **Controlled Emergency Exit:** A secondary, electronically interlocked escape door on the opposite cabin wall that connects to a dedicated protected airlock vestibule and fire stairs.

The software decision engine autonomously evaluates whether the opposite emergency route is strictly safe before authorizing exit unlatching, preventing dangerous premature passenger egress into the shaft.

---

## 2. Proposed Emergency Egress Architecture
```
┌─────────────────┐
│  Elevator Cabin │ (Sensors verify sill alignment ±25mm)
└────────┬────────┘
         │
         ▼
┌───────────────────────────┐
│ Controlled Emergency Exit │ (Electronically released ONLY when safe)
└────────┬──────────────────┘
         │
         ▼
┌───────────────────────────┐
│   Protected Access Area   │ (Pressurized, fire-resistant airlock)
└────────┬──────────────────┘
         │
         ▼
┌───────────────────────────┐
│     Emergency Stairs      │ (Smoke-isolated vertical egress)
└────────┬──────────────────┘
         │
         ▼
┌───────────────────────────┐
│    Safe Building Exit     │ (Ground floor assembly area)
└───────────────────────────┘
```

---

## 3. Emergency Decision Engine Logic

The core logic enforces two rigorous operational cases:

### **CASE A: Safe Emergency Exit Available**
- **Condition:** 
  - An emergency event is detected (e.g., Power Outage, Motor Inverter Fault, Door Jam).
  - AND Elevator cabin is aligned with a floor level within tolerance (`|alignment_offset| <= 25mm`).
  - AND Downstream optical smoke & debris sensors report the escape route is `AVAILABLE` and clear.
- **System Action:**
  1. Activates cabin indicator: `"SAFE EMERGENCY EXIT AVAILABLE"`.
  2. Electronically disengages opposite emergency door magnetic lock.
  3. Illuminates route guidance into the protected airlock vestibule.
  4. Broadcasts automated audio instructions to passengers.

### **CASE B: Emergency Exit Unavailable (Rescue Required)**
- **Condition:**
  - Elevator is stalled **between floors** (`|alignment_offset| > 25mm`, e.g., +480mm).
  - OR Downstream fire sensors report smoke or obstructions in the stairwell.
- **System Action:**
  1. Displays cabin warning: `"SAFE EXIT CURRENTLY UNAVAILABLE. RESCUE ASSISTANCE HAS BEEN NOTIFIED."`
  2. Firmly seals and locks the emergency exit to prevent hoistway fall hazards.
  3. Activates cabin emergency lighting, air ventilation fans, and two-way intercom.
  4. Dispatches high-priority incident telemetry to facility rescue personnel.
  5. Initializes precision response stopwatch and records event audit trail to SQLite.

---

## 4. Key System Features

- **Shaft & Cabin Hoistway Visualizer:** Cross-section animation showing car hoist ropes, motor winches, floor levels (Ground to 5th), front passenger doors, rear emergency hatch, protected airlock vestibule, and fire stairs.
- **Live Sensor Telemetry:** Real-time gauges for position encoders, laser alignment offset (mm), optical smoke barriers, grid 480V/battery inverter power, and cabin load cell.
- **Emergency Scenario Test Lab:** 1-click test harness for all 7 standard simulation scenarios:
  1. Normal Operation
  2. Power Failure Aligned with Floor (Case A)
  3. Power Failure Between Floors (Case B)
  4. Multiple Passenger Emergency (Load capacity management)
  5. Emergency Route Unavailable (Smoke barrier detection)
  6. Rescue Team Notified & Dispatched
  7. Emergency Successfully Resolved
- **Tactical Rescue Team Dispatch Console:** Four-step operational workflow (`NOTIFY RESCUE TEAM` → `ACKNOWLEDGE` → `START RESCUE` → `MARK RESOLVED`).
- **Interactive Passenger Assistance Intercom:** Live simulated two-way dispatcher chat, text guidance, Web Audio voice broadcasts, and emergency SOS distress button.
- **SQLite Database Audit Trail:** Stores structured records for elevators, emergency incidents, passenger counts, rescue dispatches, and audit logs. Includes CSV export.
- **Analytics & Decision Telemetry:** Statistical charts tracking resolution rates, average response intervals, failure distribution, and Case A vs Case B ratios using Recharts.

---

## 5. Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Web Audio API synthesis.
- **Full-Stack Server:** Node.js (v22), Express, Vite Middleware, native `node:sqlite` database.
- **Alternative Backend:** Python FastAPI (`backend/app.py`), Uvicorn, Python SQLite3.
- **Test Suite:** Python unittest verifying mathematical decision engine boundaries and fault injection.

---

## 6. Project Structure

```
├── backend/
│   ├── app.py                      # FastAPI REST API endpoints
│   ├── database/database.py        # SQLite schema & query methods
│   ├── models/schemas.py           # Pydantic data schemas
│   ├── services/decision_engine.py # Python decision engine logic
│   └── simulation/elevator_simulator.py # State machine & motion physics
├── server.ts                       # Express + native SQLite full-stack server
├── src/
│   ├── App.tsx                     # Main application entry point & polling
│   ├── types.ts                    # Shared TypeScript interfaces & types
│   ├── lib/audio.ts                # Web Audio API sound & speech synthesizer
│   ├── components/
│   │   ├── Navbar.tsx              # Telemetry header & tab navigation
│   │   ├── DecisionBanner.tsx      # Case A / Case B visual banner
│   │   ├── ElevatorShaftVisualizer.tsx # Multi-floor architectural cross-section
│   │   ├── SensorGauges.tsx        # Physical sensor gauges & override toggles
│   │   ├── PassengerPanel.tsx      # Cabin intercom, voice guidance & SOS
│   │   └── StatusBadge.tsx         # Standardized status badge pill
│   └── pages/
│       ├── DashboardPage.tsx       # Live operations command center
│       ├── SimulationPage.tsx      # Mechanical shaft inspection & sill slider
│       ├── EmergencyControlPage.tsx# Scenario lab & failure injection
│       ├── RescueTeamPage.tsx      # Responder dispatch & incident logging
│       ├── HistoryPage.tsx         # SQLite incident audit trail & CSV export
│       ├── AnalyticsPage.tsx       # KPI metrics & distribution charts
│       └── SystemInfoPage.tsx      # Concept guide, API docs & portfolio details
├── tests/
│   └── test_emergency_engine.py    # Automated test suite for safety logic
└── metadata.json                   # App manifest
```

---

## 7. Installation & Quick Start

### Option A: Unified Full-Stack Run (Node.js + Vite)
```bash
# 1. Install dependencies
npm install

# 2. Start full-stack development server
npm run dev

# 3. Open browser
http://localhost:3000
```

### Option B: Python Backend & Automated Tests
```bash
# Run automated decision engine unit tests
PYTHONPATH=. python3 -m unittest discover tests

# Launch FastAPI backend
uvicorn backend.app:app --reload --port 8000
```

---

## 8. REST API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/elevator/status` | Current elevator state, sensor telemetry, and rescue status |
| `POST` | `/api/emergency/start` | Trigger failure scenario, evaluate decision engine, log incident |
| `POST` | `/api/emergency/clear` | Resolve active emergency, compute response time interval |
| `POST` | `/api/simulation/move` | Dispatch car to floor or stop mid-shaft |
| `POST` | `/api/simulation/sensors` | Override sensor values (alignment offset, smoke detectors) |
| `GET` | `/api/rescue/status` | Current rescue squad dispatch status and response clock |
| `POST` | `/api/rescue/action` | Execute NOTIFY, ACKNOWLEDGE, START RESCUE, or MARK RESOLVED |
| `GET` | `/api/emergencies` | Query all historical incident records from SQLite |
| `GET` | `/api/logs` | Fetch real-time system audit logs |
| `GET` | `/api/analytics` | Aggregated response times, resolution rates, and type frequency |
| `POST` | `/api/passengers/sos` | Trigger in-cabin passenger distress button |

---

## 9. Portfolio & Resume Presentation Points
- **System Engineering:** Demonstrates end-to-end design of safety-critical state machines, failsafe software interlocks, and sensor validation.
- **Full-Stack Proficiency:** Combines React 18, TypeScript, and responsive Tailwind UI with backend REST APIs, automated unit tests, and persistent SQLite storage.
- **Domain Innovation:** Tackles real-world high-rise emergency egress constraints with dual-door architectural isolation and intelligent evacuation routing.
