import React from 'react';
import {
  Gauge,
  ShieldAlert,
  ShieldCheck,
  DoorClosed,
  DoorOpen,
  Zap,
  Users,
  Clock,
  Compass,
  ArrowUpDown,
  Radio,
  FileText,
} from 'lucide-react';
import { ElevatorState, SystemLog } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { DecisionBanner } from '../components/DecisionBanner';
import { SensorGauges } from '../components/SensorGauges';
import { ElevatorShaftVisualizer } from '../components/ElevatorShaftVisualizer';
import { PassengerPanel } from '../components/PassengerPanel';
import { soundFX } from '../lib/audio';

interface DashboardPageProps {
  state: ElevatorState;
  logs: SystemLog[];
  elapsedSeconds: number;
  onFloorMove: (floor: number) => void;
  onSensorOverride: (overrides: Record<string, unknown>) => void;
  onSOS: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  state,
  logs,
  elapsedSeconds,
  onFloorMove,
  onSensorOverride,
  onSOS,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Primary Intelligent Decision Banner */}
      <DecisionBanner state={state} elapsedSeconds={elapsedSeconds} />

      {/* 2. Core Dashboard Telemetry Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Elevator ID & Floor */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Cabin ID</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold font-mono text-white">{state.id}</div>
            <div className="text-xs text-cyan-400 font-semibold font-mono mt-0.5">
              Floor {state.currentFloor} ({state.currentFloor === 0 ? 'Ground' : `Level ${state.currentFloor}`})
            </div>
          </div>
        </div>

        {/* Movement */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Motion</span>
            <ArrowUpDown className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold font-mono text-white">{state.movement}</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {state.speedMps} m/s • Target: {state.targetFloor}F
            </div>
          </div>
        </div>

        {/* Emergency Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Emergency</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <StatusBadge status={state.status} size="sm" pulse={state.status === 'EMERGENCY' || state.status === 'RESCUE REQUIRED'} />
            <div className="text-[10px] text-slate-400 truncate mt-1">
              {state.activeEmergencyType || 'None active'}
            </div>
          </div>
        </div>

        {/* Emergency Exit Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Exit Hatch</span>
            <DoorClosed className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <StatusBadge status={state.emergencyExitStatus} size="sm" />
            <div className="text-[10px] text-slate-400 font-mono mt-1">Opposite Wall</div>
          </div>
        </div>

        {/* Rescue Team Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Rescue Team</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <StatusBadge status={state.rescueTeam.rescue_status} size="sm" />
            <div className="text-[10px] text-slate-400 truncate mt-1">
              {state.rescueTeam.rescue_status === 'STANDBY' ? 'Station Ready' : 'Dispatched'}
            </div>
          </div>
        </div>

        {/* Emergency Stopwatch */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Timer</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-base font-bold font-mono text-amber-300">
              {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:
              {(elapsedSeconds % 60).toString().padStart(2, '0')}s
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Response Clock</div>
          </div>
        </div>
      </div>

      {/* 3. Real-Time Elevator Visualization Cross-Section */}
      <ElevatorShaftVisualizer state={state} onFloorSelect={onFloorMove} />

      {/* 4. Complete Simulated Sensor System Gauges */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            Simulated Sensor System Telemetry
          </h3>
          <button
            id="dash-nav-control-btn"
            type="button"
            onClick={() => {
              soundFX.playClick();
              onNavigateTab('control');
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 active:scale-95 font-mono underline transition-all cursor-pointer"
          >
            Open Emergency Simulator Controls →
          </button>
        </div>
        <SensorGauges
          sensors={state.sensors}
          emergencyExitStatus={state.emergencyExitStatus}
          onSensorOverride={onSensorOverride}
        />
      </div>

      {/* 5. Bottom Two Columns: Passenger Assistance & Live System Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <PassengerPanel state={state} onSOS={onSOS} />
        </div>

        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">Live System Event Log</h3>
            </div>
            <button
              id="dash-nav-history-btn"
              type="button"
              onClick={() => {
                soundFX.playClick();
                onNavigateTab('history');
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 active:scale-95 font-mono transition-all cursor-pointer"
            >
              View Full History →
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 text-xs font-mono">
            {logs.slice(0, 8).map((log) => (
              <div key={log.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span className="font-bold text-cyan-400">{log.event_type}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{log.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
