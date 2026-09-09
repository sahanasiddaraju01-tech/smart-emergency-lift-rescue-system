import React from 'react';
import {
  Info,
  ShieldAlert,
  GraduationCap,
  Code2,
  Terminal,
  Cpu,
  Layers,
  ArrowRight,
  Database,
  CheckCircle2,
  Github,
  BookOpen,
} from 'lucide-react';

export const SystemInfoPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. Official Safety Disclaimer Banner (Mandatory) */}
      <div className="bg-rose-950/40 border-2 border-rose-500/80 rounded-xl p-5 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-rose-900/60 rounded-lg text-rose-300 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-300 font-mono">
              Crucial Safety Disclaimer & Purpose Notice
            </h3>
            <p className="text-xs text-rose-200 leading-relaxed font-medium">
              "This project is a software simulation and educational prototype. It does not control or interface with real elevator hardware or building safety systems. Real elevator safety systems require certified hardware, professional engineering, testing, and regulatory approval."
            </p>
            <p className="text-[11px] text-rose-300/80">
              Created for Computer Science & Engineering (CSE) student portfolio, resume, LinkedIn, and technical GitHub demonstration.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Core Idea & Architectural Route Concept */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-wide uppercase font-mono">
            System Concept & Proposed Emergency Route
          </h2>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Standard elevators feature only single front doors opening into the elevator shaft or floor landing. During emergencies where an elevator stalls between floors or encounters fire in the lobby, passengers are trapped without safe egress options and may risk catastrophic falls if attempting to exit into the open shaft.
        </p>

        <p className="text-sm text-slate-300 leading-relaxed">
          The <strong>Smart Emergency Lift Rescue System</strong> proposes an intelligent dual-door architecture:
        </p>

        {/* Egress Flow Pipeline */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
          <div className="text-amber-400 font-bold uppercase text-[11px]">
            Controlled Evacuation Route Hierarchy:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">START</span>
              <strong className="text-white text-xs">Elevator Cabin</strong>
              <p className="text-[10px] text-slate-400 font-sans mt-1">Sensor verified</p>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40">
              <span className="text-[10px] text-amber-400 block">STEP 1</span>
              <strong className="text-amber-300 text-xs">Controlled Exit</strong>
              <p className="text-[10px] text-slate-400 font-sans mt-1">Opposite rear hatch</p>
            </div>

            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/40">
              <span className="text-[10px] text-cyan-400 block">STEP 2</span>
              <strong className="text-cyan-300 text-xs">Protected Area</strong>
              <p className="text-[10px] text-slate-400 font-sans mt-1">Pressurized airlock</p>
            </div>

            <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-500/40">
              <span className="text-[10px] text-purple-400 block">STEP 3</span>
              <strong className="text-purple-300 text-xs">Staircase</strong>
              <p className="text-[10px] text-slate-400 font-sans mt-1">Fire-isolated egress</p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/50">
              <span className="text-[10px] text-emerald-400 block">DESTINATION</span>
              <strong className="text-emerald-300 text-xs">Building Exit</strong>
              <p className="text-[10px] text-slate-400 font-sans mt-1">Ground assembly zone</p>
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-slate-300 text-xs font-sans">
            <strong>Key Safety Invariant:</strong> The software decision engine MUST determine that the cabin is safely aligned with a designated floor level (within ±25mm threshold) AND that downstream smoke/fire sensors report no hazards before releasing the opposite emergency exit. Passengers are <em>never</em> allowed to arbitrarily unlatch the door while the elevator is suspended in the hoistway.
          </div>
        </div>
      </div>

      {/* 3. Decision Tree Logic Specification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono">
              Emergency Decision Engine Logic
            </h3>
          </div>
          <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed">
{`IF emergency == true:
    determine elevator position & floor alignment

    IF elevator is safely aligned with floor (offset <= ±25mm):
        check escape route optical smoke barriers

        IF escape route is available and clear:
            // CASE A
            show "SAFE EMERGENCY EXIT AVAILABLE"
            release electronic opposite-side exit hatch
            illuminate path: Cabin -> Airlock -> Staircase
        ELSE:
            // CASE B: HAZARD DETECTED
            show "EMERGENCY EXIT UNAVAILABLE"
            keep emergency exit securely sealed
            notify rescue team & start timer
    ELSE:
        // CASE B: MISALIGNED IN HOISTWAY
        show "EMERGENCY EXIT UNAVAILABLE"
        keep emergency exit securely locked
        prevent shaft fall hazard
        notify rescue team & start timer`}
          </pre>
        </div>

        {/* Database Schema (SQLite) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono">
              SQLite Database Architecture (Section 11)
            </h3>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="font-bold text-cyan-400">elevators</span>: id, elevator_name, current_floor, status, power_status
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="font-bold text-cyan-400">emergencies</span>: id, elevator_id, emergency_type, detected_time, resolved_time, status, response_time
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="font-bold text-cyan-400">passengers</span>: id, elevator_id, passenger_count
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="font-bold text-cyan-400">rescue_events</span>: id, emergency_id, notification_time, rescue_status, notes
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="font-bold text-cyan-400">system_logs</span>: id, event_type, timestamp, description
            </div>
          </div>
        </div>
      </div>

      {/* 4. REST API Endpoint Reference */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono">
              REST API Endpoints Specification (Section 12)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">JSON Protocol</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-bold text-[10px]">GET</span>
              <span className="text-white font-bold">/api/elevator/status</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              Returns elevator state, sensors, emergency decision, and rescue team status.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold text-[10px]">POST</span>
              <span className="text-white font-bold">/api/emergency/start</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              Triggers simulated emergency, invokes Decision Engine, records to SQLite.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold text-[10px]">POST</span>
              <span className="text-white font-bold">/api/emergency/clear</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              Resolves emergency, computes response time interval, updates database.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold text-[10px]">POST</span>
              <span className="text-white font-bold">/api/simulation/move</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              Dispatches cabin to target floor or stops between floors (+520mm offset).
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-bold text-[10px]">GET</span>
              <span className="text-white font-bold">/api/rescue/status</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              Retrieves rescue incident telemetry, response clock, notes, and squad status.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold text-[10px]">POST</span>
              <span className="text-white font-bold">/api/rescue/action</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              Executes NOTIFY, ACKNOWLEDGE, START RESCUE, or MARK RESOLVED.
            </p>
          </div>
        </div>
      </div>

      {/* 5. How to Run Frontend, Backend, and Tests (Section 20) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase font-mono">
            How to Install, Run & Test (Developer Guide)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Node / Unified Full-Stack */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <span className="text-cyan-400 font-bold uppercase block">1. Unified Full-Stack Run (React + SQLite)</span>
            <p className="text-slate-400 font-sans text-[11px]">
              Launches the Vite React frontend with Express API backend and native Node:SQLite:
            </p>
            <pre className="p-2.5 rounded bg-slate-900 text-slate-300 text-[11px] overflow-x-auto">
{`npm install
npm run dev
# Server listening on http://localhost:3000`}
            </pre>
          </div>

          {/* Python Backend & Tests */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <span className="text-emerald-400 font-bold uppercase block">2. Python Backend & Automated Tests</span>
            <p className="text-slate-400 font-sans text-[11px]">
              Run the Python FastAPI backend or execute the automated unit test suite:
            </p>
            <pre className="p-2.5 rounded bg-slate-900 text-slate-300 text-[11px] overflow-x-auto">
{`# Run Python automated unit tests:
PYTHONPATH=. python3 -m unittest discover tests

# Run Python FastAPI server:
uvicorn backend.app:app --reload --port 8000`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
