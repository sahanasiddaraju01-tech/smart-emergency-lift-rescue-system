import React from 'react';
import { motion } from 'motion/react';
import {
  DoorClosed,
  DoorOpen,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowDown,
  LogOut,
  Flame,
  Users,
  Shield,
  Zap,
} from 'lucide-react';
import { ElevatorState } from '../types';

interface ElevatorShaftVisualizerProps {
  state: ElevatorState;
  onFloorSelect?: (floor: number) => void;
}

const FLOORS = [5, 4, 3, 2, 1, 0];
const FLOOR_NAMES: Record<number, string> = {
  5: '5F - Executive Suites',
  4: '4F - Research & Labs',
  3: '3F - Operations & IT',
  2: '2F - Engineering Core',
  1: '1F - Mezzanine Deck',
  0: 'GF - Main Lobby / Exit',
};

export const ElevatorShaftVisualizer: React.FC<ElevatorShaftVisualizerProps> = ({ state, onFloorSelect }) => {
  const isEmergency = state.sensors.emergencyStatus === 'ACTIVE';
  const isSafeExit = state.emergencyDecision.outcome === 'SAFE EXIT AVAILABLE';
  const isAligned = state.sensors.floorAlignment;
  const currentFloor = state.currentFloor;
  const offsetMm = state.sensors.alignmentOffsetMm;

  // Calculate cabin position percentage from bottom:
  // Floor 0 is at bottom (0%), Floor 5 is at top (100%)
  // If misaligned, add proportional offset
  const floorHeightPercent = 100 / 5;
  let cabinBottomPercent = currentFloor * floorHeightPercent;
  if (!isAligned && offsetMm !== 0) {
    // 3000mm is typical floor-to-floor height
    const normalizedOffset = (offsetMm / 3000) * floorHeightPercent;
    cabinBottomPercent = Math.max(0, Math.min(100 - floorHeightPercent, cabinBottomPercent + normalizedOffset));
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-6 shadow-xl flex flex-col gap-4">
      {/* Visualizer Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Architectural Cross-Section Telemetry
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time mechanical hoistway, dual-door cabin, pressurized vestibule & staircase.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-blue-400" /> Normal Front Door
          </span>
          <span className="flex items-center gap-1 text-amber-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Proposed Emergency Exit
          </span>
          <span className="flex items-center gap-1 text-emerald-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Protected Vestibule & Stairs
          </span>
        </div>
      </div>

      {/* Main Cross-Section View */}
      <div className="relative w-full bg-slate-950 rounded-xl border border-slate-800/90 overflow-hidden min-h-[540px] flex">
        {/* LEFT COLUMN: Floor Call Buttons & Normal Entrance Side */}
        <div className="w-28 sm:w-36 border-r border-slate-800 bg-slate-950/70 flex flex-col justify-between p-2 shrink-0 z-10">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider mb-1 text-center">
            Normal Entrance
          </div>
          {FLOORS.map((floor) => {
            const isCarHere = currentFloor === floor;
            return (
              <div
                key={floor}
                onClick={() => onFloorSelect && onFloorSelect(floor)}
                className={`p-2 rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  isCarHere
                    ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-md shadow-blue-900/30'
                    : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono font-bold">{floor === 0 ? 'GF' : `${floor}F`}</span>
                  {isCarHere && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                </div>
                <div className="text-[9px] text-slate-400 truncate max-w-full text-center">
                  {floor === 0 ? 'Main Lobby' : `Level ${floor}`}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                  {isCarHere && state.sensors.doorStatus === 'FRONT_OPEN' ? (
                    <span className="text-blue-400 flex items-center gap-0.5"><DoorOpen className="w-3 h-3" /> OPEN</span>
                  ) : (
                    <span className="flex items-center gap-0.5"><DoorClosed className="w-3 h-3" /> CLOSED</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CENTER COLUMN: Elevator Shaft with Moving Cabin */}
        <div className="relative flex-1 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950 border-r border-slate-800 min-w-[200px] overflow-hidden">
          {/* Guide rails and hoist cables */}
          <div className="absolute inset-0 flex justify-center pointer-events-none opacity-20">
            <div className="w-0.5 h-full bg-slate-400 mx-8" />
            <div className="w-0.5 h-full bg-slate-400 mx-8" />
          </div>

          {/* Floor level landing horizontal lines */}
          {FLOORS.map((floor) => {
            const bottomPercent = floor * floorHeightPercent;
            return (
              <div
                key={floor}
                style={{ bottom: `${bottomPercent}%` }}
                className="absolute left-0 right-0 border-b border-dashed border-slate-800/80 flex items-center justify-between px-2 text-[10px] font-mono text-slate-600 pointer-events-none"
              >
                <span>SILL {floor}F</span>
                <span className="text-[9px] text-slate-600">±0mm</span>
              </div>
            );
          })}

          {/* MOVING ELEVATOR CABIN */}
          <motion.div
            animate={{
              bottom: `${cabinBottomPercent}%`,
            }}
            transition={{
              type: 'spring',
              stiffness: 120,
              damping: 18,
            }}
            className={`absolute left-4 right-4 h-[72px] rounded-lg border-2 shadow-2xl transition-colors duration-300 z-20 flex flex-col justify-between p-2 ${
              isEmergency
                ? isSafeExit
                  ? 'bg-emerald-950/90 border-emerald-400 shadow-emerald-900/50'
                  : 'bg-rose-950/90 border-rose-500 shadow-rose-900/50 animate-pulse'
                : 'bg-slate-800/95 border-cyan-400/80 shadow-cyan-950/40'
            }`}
          >
            {/* Cabin Top Header: ID & Status */}
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="font-bold text-white flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {state.id}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-0.5 text-slate-200">
                  <Users className="w-3 h-3 text-cyan-300" />
                  {state.sensors.passengerCount}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    isAligned ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {isAligned ? 'ALIGNED' : `${offsetMm > 0 ? '+' : ''}${offsetMm}mm`}
                </span>
              </div>
            </div>

            {/* Cabin Center: Dual Doors Indicator */}
            <div className="flex items-center justify-between my-1 px-1">
              {/* Left Door: Normal Entrance */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-mono text-blue-300 uppercase">Front Door</span>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-200">
                  <DoorClosed className="w-3.5 h-3.5 text-blue-400" />
                  <span>Normal</span>
                </div>
              </div>

              {/* Center Cabin Status Icon */}
              <div className="flex flex-col items-center">
                {isEmergency ? (
                  isSafeExit ? (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-300 font-bold">
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                      SAFE EVAC
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-rose-300 font-bold">
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      LOCKED
                    </div>
                  )
                ) : (
                  <div className="text-[9px] font-mono text-cyan-300">
                    SPEED {state.speedMps} m/s
                  </div>
                )}
              </div>

              {/* Right Door: Proposed Emergency Exit */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-mono text-amber-300 uppercase">Emerg. Exit</span>
                <div
                  className={`flex items-center gap-1 text-[10px] font-semibold ${
                    state.emergencyExitStatus === 'UNLOCKED_SAFE'
                      ? 'text-emerald-300'
                      : 'text-amber-300'
                  }`}
                >
                  {state.emergencyExitStatus === 'UNLOCKED_SAFE' ? (
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span>Opposite</span>
                </div>
              </div>
            </div>

            {/* Cabin Bottom Sills & Level Sensor Gauge */}
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 border-t border-slate-700/60 pt-0.5">
              <span>Lev. Sensor: {isAligned ? '±0 mm' : `${offsetMm} mm`}</span>
              <span className={isEmergency ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                {state.movement}
              </span>
            </div>
          </motion.div>

          {/* Emergency Siren Pulses in shaft if emergency */}
          {isEmergency && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/50 px-2 py-1 rounded text-[10px] font-mono text-rose-300 animate-pulse z-30">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              EMERGENCY MODE
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Proposed Emergency Route Architecture */}
        <div className="w-48 sm:w-64 bg-slate-950/90 flex flex-col justify-between p-3 shrink-0 relative overflow-hidden">
          <div className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider mb-2 flex items-center justify-between">
            <span>Emergency Escape Route</span>
            <Shield className="w-3.5 h-3.5 text-amber-400" />
          </div>

          {/* Flow Diagram from Top to Ground */}
          <div className="space-y-3 relative z-10 flex-1 flex flex-col justify-around">
            {/* Step 1: Controlled Emergency Exit Hatch */}
            <div
              className={`p-2.5 rounded-lg border text-xs transition-all ${
                state.emergencyExitStatus === 'UNLOCKED_SAFE'
                  ? 'bg-emerald-950/40 border-emerald-400 text-emerald-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="font-bold text-amber-300">1. CONTROLLED EXIT</span>
                {state.emergencyExitStatus === 'UNLOCKED_SAFE' ? (
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>
              <p className="text-[11px] mt-1">
                Opposite-side cabin emergency hatch. Interlocked with floor alignment sensor.
              </p>
            </div>

            <div className="flex justify-center text-slate-600">
              <ArrowDown className={`w-4 h-4 ${isSafeExit ? 'text-emerald-400 animate-bounce' : ''}`} />
            </div>

            {/* Step 2: Protected Access Area (Airlock Vestibule) */}
            <div
              className={`p-2.5 rounded-lg border text-xs transition-all ${
                isSafeExit
                  ? 'bg-emerald-950/40 border-emerald-400 text-emerald-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="font-bold text-cyan-300">2. PROTECTED ACCESS AREA</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Airlock
                </span>
              </div>
              <p className="text-[11px] mt-1">
                Pressurized buffer zone preventing shaft drafts, smoke ingress, and vertigo falls.
              </p>
            </div>

            <div className="flex justify-center text-slate-600">
              <ArrowDown className={`w-4 h-4 ${isSafeExit ? 'text-emerald-400 animate-bounce' : ''}`} />
            </div>

            {/* Step 3: Staircase */}
            <div
              className={`p-2.5 rounded-lg border text-xs transition-all ${
                isSafeExit
                  ? 'bg-emerald-950/40 border-emerald-400 text-emerald-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="font-bold text-amber-300">3. ENCLOSED STAIRCASE</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  2-Hr Fire Rated
                </span>
              </div>
              <p className="text-[11px] mt-1">
                Isolated stairwell equipped with emergency luminescent guidance strips.
              </p>
            </div>

            <div className="flex justify-center text-slate-600">
              <ArrowDown className={`w-4 h-4 ${isSafeExit ? 'text-emerald-400 animate-bounce' : ''}`} />
            </div>

            {/* Step 4: Building Exit */}
            <div
              className={`p-2.5 rounded-lg border text-xs transition-all ${
                isSafeExit
                  ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="font-bold text-emerald-400">4. GROUND EXIT</span>
                <LogOut className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-[11px] mt-1">
                Direct exterior egress to safe assembly zone outside building perimeter.
              </p>
            </div>
          </div>

          {/* Escape Route Sensor Status */}
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono flex items-center justify-between">
            <span className="text-slate-500">Route Smoke Barrier:</span>
            <span
              className={
                state.sensors.escapeRouteAvailability === 'AVAILABLE'
                  ? 'text-emerald-400 font-bold'
                  : 'text-rose-400 font-bold'
              }
            >
              {state.sensors.escapeRouteAvailability}
            </span>
          </div>
        </div>
      </div>

      {/* Visualizer Footer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono bg-slate-950/60 p-3 rounded-lg border border-slate-800">
        <div>
          <span>Selected Car: <strong className="text-white">{state.name}</strong></span>
          <span className="mx-2">•</span>
          <span>Sill Offset: <strong className={isAligned ? 'text-emerald-400' : 'text-rose-400'}>{offsetMm} mm</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span>Click any floor button (GF - 5F) on the left to simulate moving the cabin.</span>
        </div>
      </div>
    </div>
  );
};
