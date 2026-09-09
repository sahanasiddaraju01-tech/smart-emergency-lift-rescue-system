import React from 'react';
import {
  Activity,
  Compass,
  BatteryCharging,
  Zap,
  Radio,
  DoorClosed,
  Users,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { SensorData, EmergencyExitStatus } from '../types';
import { soundFX } from '../lib/audio';

interface SensorGaugesProps {
  sensors: SensorData;
  emergencyExitStatus: EmergencyExitStatus;
  onSensorOverride?: (overrides: Partial<SensorData>) => void;
}

export const SensorGauges: React.FC<SensorGaugesProps> = ({ sensors, emergencyExitStatus, onSensorOverride }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. Position Sensor */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">Position Sensor</span>
          <Compass className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-1">
          <div className="text-base font-bold font-mono text-white flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${sensors.positionSensor === 'ACTIVE' ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
            {sensors.positionSensor}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Absolute optical encoder</p>
        </div>
      </div>

      {/* 2. Floor Alignment Sensor */}
      <div
        className={`border rounded-xl p-3.5 flex flex-col justify-between transition-colors ${
          sensors.floorAlignment ? 'bg-slate-900 border-slate-800' : 'bg-rose-950/20 border-rose-500/40'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">Floor Alignment</span>
          <Activity className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-1">
          <div className="text-base font-bold font-mono flex items-center justify-between">
            <span className={sensors.floorAlignment ? 'text-emerald-400' : 'text-rose-400'}>
              {sensors.floorAlignment ? 'YES (ALIGNED)' : 'NO (MISALIGNED)'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Sill offset: {sensors.alignmentOffsetMm > 0 ? `+${sensors.alignmentOffsetMm}` : sensors.alignmentOffsetMm} mm (±25mm tol.)
          </p>
        </div>
      </div>

      {/* 3. Door & Interlock Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">Door & Interlock</span>
          <DoorClosed className="w-4 h-4 text-blue-400" />
        </div>
        <div className="mt-1">
          <div className="text-sm font-bold font-mono text-white truncate">
            {sensors.doorStatus.replace('_', ' ')}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
            Exit Hatch: {emergencyExitStatus.replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* 4. Main & Backup Power */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">Power / Backup</span>
          <Zap className={`w-4 h-4 ${sensors.powerStatus === 'MAIN_ACTIVE' ? 'text-emerald-400' : 'text-rose-400'}`} />
        </div>
        <div className="mt-1">
          <div className="text-base font-bold font-mono flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                sensors.powerStatus === 'MAIN_ACTIVE' ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'
              }`}
            />
            <span className={sensors.powerStatus === 'MAIN_ACTIVE' ? 'text-white' : 'text-rose-400 text-sm'}>
              {sensors.powerStatus === 'MAIN_ACTIVE' ? 'MAIN POWER' : 'POWER OUTAGE'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
            <BatteryCharging className="w-3 h-3 text-cyan-400" />
            Backup: {sensors.backupPowerStatus}
          </p>
        </div>
      </div>

      {/* 5. Escape Route Availability */}
      <div
        className={`border rounded-xl p-3.5 flex flex-col justify-between transition-colors ${
          sensors.escapeRouteAvailability === 'AVAILABLE'
            ? 'bg-slate-900 border-slate-800'
            : 'bg-rose-950/25 border-rose-500/40'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">Escape Route</span>
          <Flame className="w-4 h-4 text-orange-400" />
        </div>
        <div className="mt-1">
          <div
            className={`text-sm font-bold font-mono ${
              sensors.escapeRouteAvailability === 'AVAILABLE' ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {sensors.escapeRouteAvailability.replace('_', ' ')}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Vestibule + Stairwell barrier</p>
        </div>
      </div>

      {/* 6. Communication System */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">Communication</span>
          <Radio className="w-4 h-4 text-violet-400" />
        </div>
        <div className="mt-1">
          <div
            className={`text-base font-bold font-mono ${
              sensors.communicationStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {sensors.communicationStatus}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Cabin 2-way audio intercom</p>
        </div>
      </div>

      {/* 7. Passenger Count */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">Passenger Load</span>
          <Users className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-1">
          <div className="text-xl font-bold font-mono text-white flex items-center justify-between">
            <span>{sensors.passengerCount} <span className="text-xs text-slate-400 font-normal">souls</span></span>
            {onSensorOverride && (
              <div className="flex items-center gap-1">
                <button
                  id="sensor-passenger-minus-btn"
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onSensorOverride({ passengerCount: Math.max(1, sensors.passengerCount - 1) });
                  }}
                  className="w-5 h-5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded text-xs flex items-center justify-center font-mono transition-all cursor-pointer"
                >
                  -
                </button>
                <button
                  id="sensor-passenger-plus-btn"
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onSensorOverride({ passengerCount: Math.min(16, sensors.passengerCount + 1) });
                  }}
                  className="w-5 h-5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded text-xs flex items-center justify-center font-mono transition-all cursor-pointer"
                >
                  +
                </button>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Max rated capacity: 16 (1200kg)</p>
        </div>
      </div>

      {/* 8. Emergency Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider">Emergency Status</span>
          <ShieldAlert className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-1">
          <div
            className={`text-base font-bold font-mono ${
              sensors.emergencyStatus === 'ACTIVE' ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
            }`}
          >
            {sensors.emergencyStatus}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Failsafe supervision active</p>
        </div>
      </div>
    </div>
  );
};
