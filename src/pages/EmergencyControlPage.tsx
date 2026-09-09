import React, { useState } from 'react';
import {
  Sliders,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Zap,
  Users,
  DoorClosed,
  Radio,
  Flame,
  BatteryCharging,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { ElevatorState, EmergencyType, EscapeRouteStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { soundFX } from '../lib/audio';

interface EmergencyControlPageProps {
  state: ElevatorState;
  onStartEmergency: (
    type: EmergencyType,
    aligned?: boolean,
    routeClear?: boolean,
    passengers?: number,
    offset?: number
  ) => void;
  onClearEmergency: () => void;
  onResetSimulation: () => void;
  onSensorOverride: (overrides: Record<string, unknown>) => void;
  onRunScenario: (scenarioId: number) => void;
}

const EMERGENCY_TYPES: { type: EmergencyType; desc: string; icon: typeof Zap }[] = [
  {
    type: 'Power Failure',
    desc: 'Grid power lost. Primary traction motor shuts down. Battery inverter activates for cabin lighting & telemetry.',
    icon: Zap,
  },
  {
    type: 'Electrical Fault',
    desc: 'Short circuit detected in motor drive inverter. Backup battery circuits depleted.',
    icon: AlertTriangle,
  },
  {
    type: 'Door Fault',
    desc: 'Mechanical door obstruction or interlock circuit breaker trip detected on front entrance.',
    icon: DoorClosed,
  },
  {
    type: 'Elevator Stopped Between Floors',
    desc: 'Safety brake tripped mid-shaft. Cabin suspended +480mm above landing sill.',
    icon: Layers,
  },
  {
    type: 'Communication Failure',
    desc: 'Primary intercom and PSTN emergency dialer connection degraded or offline.',
    icon: Radio,
  },
  {
    type: 'Multiple Passenger Emergency',
    desc: 'High load occupancy (10 passengers) trapped with medical distress button triggered.',
    icon: Users,
  },
];

const SCENARIOS = [
  {
    id: 1,
    title: 'Scenario 1: Normal Operation',
    tag: 'NORMAL',
    desc: 'Elevator running standard passenger cycles. Cabin aligned, route clear, power nominal. Interlocks locked.',
    expected: 'Status: NORMAL • Decision: STANDBY • Exit: LOCKED',
  },
  {
    id: 2,
    title: 'Scenario 2: Power Failure Aligned with Floor',
    tag: 'CASE A (SAFE)',
    desc: 'Grid outage occurs while cabin is flush (±0mm) at Floor 2. Secondary route is verified clear.',
    expected: 'Status: SAFE • Decision: SAFE EXIT AVAILABLE • Exit: UNLOCKED (Opposite rear hatch released)',
  },
  {
    id: 3,
    title: 'Scenario 3: Power Failure Between Floors',
    tag: 'CASE B (MISALIGNED)',
    desc: 'Power cut occurs while elevator is moving, stopping cabin 450mm off sill. Shaft fall hazard present.',
    expected: 'Status: RESCUE REQUIRED • Decision: EXIT UNAVAILABLE • Exit: LOCKED (Shaft exit prohibited)',
  },
  {
    id: 4,
    title: 'Scenario 4: Multiple Passengers in Emergency',
    tag: 'HIGH LOAD',
    desc: 'Sudden electrical fault with 9 passengers aboard. Cabin aligns on backup battery.',
    expected: 'Status: SAFE / RESCUE • Capacity verified • Rescue squad placed on alert',
  },
  {
    id: 5,
    title: 'Scenario 5: Emergency Route Unavailable (Smoke)',
    tag: 'CASE B (HAZARD)',
    desc: 'Cabin is aligned with floor, but smoke detector in the staircase triggers. Egress blocked.',
    expected: 'Status: RESCUE REQUIRED • Exit: LOCKED to prevent toxic smoke intake into cabin',
  },
  {
    id: 6,
    title: 'Scenario 6: Rescue Team Notified & Dispatched',
    tag: 'DISPATCH',
    desc: 'Simulate automated incident dispatch to building on-site rescue personnel with tactical telemetry.',
    expected: 'Rescue Status: NOTIFIED / EN ROUTE • Incident log recorded in SQLite',
  },
  {
    id: 7,
    title: 'Scenario 7: Emergency Successfully Resolved',
    tag: 'RESOLVED',
    desc: 'Rescue team verifies all occupants safe. System logs response duration and returns to service baseline.',
    expected: 'Status: RESOLVED • Response time calculated • Baseline restored',
  },
];

export const EmergencyControlPage: React.FC<EmergencyControlPageProps> = ({
  state,
  onStartEmergency,
  onClearEmergency,
  onResetSimulation,
  onSensorOverride,
  onRunScenario,
}) => {
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<EmergencyType>('Power Failure');
  const isEmergency = state.sensors.emergencyStatus === 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Emergency Simulator & Safety Scenario Lab
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Induce simulated elevator failure events, test decision tree boundaries, and evaluate fail-safe interlocks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={state.status} size="md" pulse={isEmergency} />
          {isEmergency ? (
            <button
              id="clear-emergency-btn"
              type="button"
              onClick={() => {
                soundFX.playSafeChime();
                onClearEmergency();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-lg text-xs font-mono flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Resolve / Clear Emergency
            </button>
          ) : (
            <button
              id="trigger-emergency-btn"
              type="button"
              onClick={() => {
                soundFX.playClick();
                onStartEmergency(selectedEmergencyType);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold rounded-lg text-xs font-mono flex items-center gap-2 shadow-lg shadow-rose-950/50 cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Trigger Selected Emergency
            </button>
          )}

          <button
            id="control-reset-sim-btn"
            type="button"
            onClick={() => {
              soundFX.playClick();
              onResetSimulation();
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            Reset Sim
          </button>
        </div>
      </div>

      {/* 1. All 7 Simulation Scenarios (Section 14) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Standard Simulation Scenarios (1-Click Test Harness)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rapidly trigger the 7 official system benchmark scenarios required by specification.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800">
            7 Test Suites
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SCENARIOS.map((sc) => (
            <div
              key={sc.id}
              className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/90 hover:border-cyan-500/50 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-white truncate">{sc.title}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300 shrink-0">
                    {sc.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{sc.desc}</p>
                <div className="mt-2 text-[10px] font-mono text-slate-500 bg-slate-900/80 p-2 rounded border border-slate-800">
                  <strong className="text-slate-400">Target Outcome:</strong> {sc.expected}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-end">
                <button
                  id={`run-scenario-btn-${sc.id}`}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onRunScenario(sc.id);
                  }}
                  className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/40 active:scale-95 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 rounded text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Run Scenario {sc.id}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Emergency Type Selection Cards (Section 6) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Emergency Types Catalog
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select specific failure modes to trigger on the active elevator cabin.
            </p>
          </div>
          {isEmergency && (
            <span className="text-xs font-mono text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded border border-rose-800 animate-pulse">
              Active: {state.activeEmergencyType}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {EMERGENCY_TYPES.map((et) => {
            const Icon = et.icon;
            const isSelected = selectedEmergencyType === et.type;
            const isActive = state.activeEmergencyType === et.type;
            return (
              <div
                key={et.type}
                onClick={() => setSelectedEmergencyType(et.type)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950/40'
                    : isSelected
                    ? 'bg-cyan-950/30 border-cyan-500/60 shadow-md shadow-cyan-950/30'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      {et.type}
                    </span>
                    {isActive ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 font-bold">
                        ACTIVE
                      </span>
                    ) : isSelected ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300">
                        SELECTED
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{et.desc}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Mode ID: {et.type.slice(0, 8)}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFX.playClick();
                      setSelectedEmergencyType(et.type);
                      onStartEmergency(et.type);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 active:scale-95 transition-transform flex items-center gap-1 cursor-pointer"
                  >
                    Trigger Now <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Simulated Sensor System Overrides (Section 7) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Live Simulated Sensor Calibration Overrides
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dynamically manipulate software variables representing physical hoistway sensors.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Re-evaluates Decision Engine instantly</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          {/* Floor Alignment Toggle */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <span className="text-slate-400 block uppercase font-bold">Floor Sill Alignment</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onSensorOverride({ floorAlignment: true, alignmentOffsetMm: 0 });
                }}
                className={`flex-1 py-1.5 rounded border active:scale-95 transition-all cursor-pointer ${
                  state.sensors.floorAlignment
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                ALIGNED (0mm)
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onSensorOverride({ floorAlignment: false, alignmentOffsetMm: 480 });
                }}
                className={`flex-1 py-1.5 rounded border active:scale-95 transition-all cursor-pointer ${
                  !state.sensors.floorAlignment
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                MISALIGNED (+480mm)
              </button>
            </div>
            <p className="text-[10px] text-slate-500">Threshold: ±25mm for safe passenger exit.</p>
          </div>

          {/* Escape Route Availability */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <span className="text-slate-400 block uppercase font-bold">Escape Route Availability</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onSensorOverride({ escapeRouteAvailability: 'AVAILABLE' });
                }}
                className={`flex-1 py-1.5 rounded border active:scale-95 transition-all cursor-pointer ${
                  state.sensors.escapeRouteAvailability === 'AVAILABLE'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                CLEAR
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onSensorOverride({ escapeRouteAvailability: 'BLOCKED_SMOKE' });
                }}
                className={`flex-1 py-1.5 rounded border active:scale-95 transition-all cursor-pointer ${
                  state.sensors.escapeRouteAvailability !== 'AVAILABLE'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                SMOKE DETECTED
              </button>
            </div>
            <p className="text-[10px] text-slate-500">Staircase & airlock optical smoke barriers.</p>
          </div>

          {/* Power Status */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <span className="text-slate-400 block uppercase font-bold">Main Power Source</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onSensorOverride({ powerStatus: 'MAIN_ACTIVE' });
                }}
                className={`flex-1 py-1.5 rounded border active:scale-95 transition-all cursor-pointer ${
                  state.sensors.powerStatus === 'MAIN_ACTIVE'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                MAIN 480V
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onSensorOverride({ powerStatus: 'OUTAGE' });
                }}
                className={`flex-1 py-1.5 rounded border active:scale-95 transition-all cursor-pointer ${
                  state.sensors.powerStatus === 'OUTAGE'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                OUTAGE
              </button>
            </div>
            <p className="text-[10px] text-slate-500">Grid substation feeder breaker.</p>
          </div>

          {/* Passenger Count */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 uppercase font-bold">Passenger Count</span>
              <span className="text-cyan-400 font-bold">{state.sensors.passengerCount} souls</span>
            </div>
            <input
              type="range"
              min="1"
              max="16"
              value={state.sensors.passengerCount}
              onChange={(e) => onSensorOverride({ passengerCount: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1 (Solo)</span>
              <span>8 (Normal)</span>
              <span>16 (Max Load)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
