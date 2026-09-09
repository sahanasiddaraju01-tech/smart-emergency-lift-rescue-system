import React from 'react';
import {
  Boxes,
  DoorOpen,
  DoorClosed,
  ArrowDownUp,
  Shield,
  Layers,
  Sparkles,
  AlertOctagon,
  ArrowRight,
  Lock,
  Unlock,
} from 'lucide-react';
import { ElevatorState } from '../types';
import { ElevatorShaftVisualizer } from '../components/ElevatorShaftVisualizer';
import { StatusBadge } from '../components/StatusBadge';

interface SimulationPageProps {
  state: ElevatorState;
  onFloorMove: (floor: number, stopBetween?: boolean) => void;
  onSensorOverride: (overrides: Record<string, unknown>) => void;
}

export const SimulationPage: React.FC<SimulationPageProps> = ({
  state,
  onFloorMove,
  onSensorOverride,
}) => {
  const isEmergency = state.sensors.emergencyStatus === 'ACTIVE';
  const isAligned = state.sensors.floorAlignment;
  const offset = state.sensors.alignmentOffsetMm;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Elevator Hoistway & Dual-Door Architecture Simulation
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual inspection of the front passenger entrance, rear emergency escape hatch, pressurized airlock vestibule, and fire stairs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={state.status} size="md" />
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
            Sill Alignment: <strong className={isAligned ? 'text-emerald-400' : 'text-rose-400'}>{offset} mm</strong>
          </div>
        </div>
      </div>

      {/* Main Interactive Visualizer */}
      <ElevatorShaftVisualizer state={state} onFloorSelect={(f) => onFloorMove(f, false)} />

      {/* Interactive Controls & Fine-Tuning Bench */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Floor Move & Stop Between Floors Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
            <ArrowDownUp className="w-4 h-4 text-cyan-400" />
            Car Dispatch & Positioning Controls
          </h3>
          <p className="text-xs text-slate-400">
            Command the elevator to standard floor sills, or deliberately simulate stopping between floors to evaluate the safety interlock.
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[5, 4, 3, 2, 1, 0].map((fl) => (
              <button
                key={fl}
                type="button"
                onClick={() => onFloorMove(fl, false)}
                className={`py-2 px-3 rounded-lg border font-mono text-xs font-bold transition-all cursor-pointer ${
                  state.currentFloor === fl && isAligned
                    ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-900/40'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                {fl === 0 ? 'GF (0)' : `${fl}F`}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onFloorMove(state.currentFloor, true)}
              className="px-4 py-2 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/50 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              Simulate Stop Between Floors (+520mm Misalignment)
            </button>

            <button
              type="button"
              onClick={() => onSensorOverride({ floorAlignment: true, alignmentOffsetMm: 0 })}
              className="px-4 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/50 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Re-Align Flush with Floor Sill (0mm)
            </button>
          </div>

          {/* Sill Alignment Manual Slider */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Manual Level Sensor Offset Slider:</span>
              <span className={`font-bold ${Math.abs(offset) <= 25 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {offset > 0 ? `+${offset}` : offset} mm ({Math.abs(offset) <= 25 ? 'SAFE PASS' : 'DANGEROUS MISALIGNMENT'})
              </span>
            </div>
            <input
              type="range"
              min="-600"
              max="600"
              step="10"
              value={offset}
              onChange={(e) => {
                const val = Number(e.target.value);
                onSensorOverride({ alignmentOffsetMm: val, floorAlignment: Math.abs(val) <= 25 });
              }}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>-600mm (Low)</span>
              <span className="text-emerald-400">±25mm Safety Window</span>
              <span>+600mm (High)</span>
            </div>
          </div>
        </div>

        {/* Dual-Door Comparative Analysis */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Dual-Door Operational Philosophy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Front Entrance */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-blue-400">NORMAL FRONT ENTRANCE</span>
                <DoorClosed className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Standard two-panel center-opening sliding doors leading to the building common lobby. In power failures or mechanical stoppage, these doors remain locked if between floors to prevent passenger falls into the hoistway pit.
              </p>
              <div className="text-[10px] font-mono text-slate-500">
                Current Status: <strong className="text-slate-300">{state.sensors.doorStatus}</strong>
              </div>
            </div>

            {/* Proposed Emergency Exit */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-amber-800/40 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-amber-400">PROPOSED EMERGENCY EXIT</span>
                {state.emergencyExitStatus === 'UNLOCKED_SAFE' ? (
                  <Unlock className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4 text-rose-400" />
                )}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                A dedicated, reinforced emergency hatch situated on the rear wall of the cabin opposite to the front door. Operates under strict electronic software interlocking: only unlocks when floor alignment and downstream smoke sensors confirm safe passage.
              </p>
              <div className="text-[10px] font-mono text-slate-500">
                Current Status: <strong className="text-amber-300">{state.emergencyExitStatus}</strong>
              </div>
            </div>
          </div>

          {/* Escape Route Pipeline Summary */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold">
              Proposed Safe Evacuation Route Hierarchy:
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-700 font-mono">1. Cabin</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="px-2 py-1 bg-amber-950/60 text-amber-300 rounded border border-amber-700/60 font-mono">
                2. Emergency Exit
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="px-2 py-1 bg-cyan-950/60 text-cyan-300 rounded border border-cyan-700/60 font-mono">
                3. Protected Area
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="px-2 py-1 bg-purple-950/60 text-purple-300 rounded border border-purple-700/60 font-mono">
                4. Staircase
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="px-2 py-1 bg-emerald-950/60 text-emerald-300 rounded border border-emerald-700/60 font-mono font-bold">
                5. Building Exit
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
