import React, { useState } from 'react';
import {
  Users2,
  Bell,
  CheckSquare,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Radio,
  FileCheck,
  Shield,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { ElevatorState, RescueStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface RescueTeamPageProps {
  state: ElevatorState;
  elapsedSeconds: number;
  onRescueAction: (action: 'NOTIFY' | 'ACKNOWLEDGE' | 'START_RESCUE' | 'MARK_RESOLVED', notes?: string) => void;
}

export const RescueTeamPage: React.FC<RescueTeamPageProps> = ({
  state,
  elapsedSeconds,
  onRescueAction,
}) => {
  const [customNotes, setCustomNotes] = useState('');
  const rescue = state.rescueTeam;
  const isEmergency = state.sensors.emergencyStatus === 'ACTIVE';

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Tactical Rescue Management & Dispatch Console
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dedicated station for facility emergency responders, building safety chiefs, and rescue personnel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">Current Status:</span>
          <StatusBadge status={rescue.rescue_status} size="lg" pulse={rescue.rescue_status === 'NOTIFIED' || rescue.rescue_status === 'EN_ROUTE'} />
        </div>
      </div>

      {/* Primary Incident Telemetry Board (Section 10) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Emergency ID */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Incident ID</span>
          <div className="text-sm font-bold font-mono text-white mt-1">
            {state.activeEmergencyId ? `#EMG-${state.activeEmergencyId}` : 'NONE'}
          </div>
        </div>

        {/* Elevator ID */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Elevator ID</span>
          <div className="text-sm font-bold font-mono text-cyan-400 mt-1">{state.id}</div>
        </div>

        {/* Simulated Location */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Location</span>
          <div className="text-sm font-bold font-mono text-white mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            Floor {state.currentFloor}
          </div>
          <span className="text-[9px] text-slate-500 font-mono">
            {state.sensors.floorAlignment ? 'Flush with sill' : `${state.sensors.alignmentOffsetMm}mm offset`}
          </span>
        </div>

        {/* Emergency Type */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Failure Type</span>
          <div className="text-xs font-bold font-mono text-rose-300 mt-1 truncate">
            {state.activeEmergencyType || 'Normal Operation'}
          </div>
        </div>

        {/* Passenger Count */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Trapped Count</span>
          <div className="text-sm font-bold font-mono text-amber-300 mt-1">
            {state.sensors.passengerCount} Persons
          </div>
        </div>

        {/* Time Since Emergency */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Elapsed Clock</span>
          <div className="text-sm font-bold font-mono text-amber-400 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {isEmergency ? formatElapsed(elapsedSeconds) : '00:00'}
          </div>
        </div>

        {/* Communication Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Intercom Link</span>
          <div className="text-xs font-bold font-mono text-emerald-400 mt-1 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5" />
            {state.sensors.communicationStatus}
          </div>
        </div>

        {/* Rescue Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Squad Phase</span>
          <div className="text-xs font-bold font-mono text-white mt-1">
            {rescue.rescue_status}
          </div>
        </div>
      </div>

      {/* 4 Official Simulation Action Buttons (Section 10) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Rescue Team Command Actions (Simulated)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute standardized rescue operational workflow steps. All operations are digital simulations.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            Phase Step Controller
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Button 1: NOTIFY RESCUE TEAM */}
          <button
            type="button"
            onClick={() => onRescueAction('NOTIFY', customNotes || 'Dispatcher flagged on-duty rescue squad.')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 font-mono transition-all cursor-pointer ${
              rescue.rescue_status === 'NOTIFIED'
                ? 'bg-rose-950/60 border-rose-400 text-rose-300 ring-2 ring-rose-500/40'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Bell className="w-5 h-5 text-rose-400 animate-bounce" />
            <span className="text-xs font-bold uppercase tracking-wider">1. Notify Rescue Team</span>
            <span className="text-[10px] text-slate-500 text-center font-sans">
              Dispatch alarm to pager & mobile radio
            </span>
          </button>

          {/* Button 2: ACKNOWLEDGE */}
          <button
            type="button"
            onClick={() => onRescueAction('ACKNOWLEDGE', customNotes || 'Squad Captain confirmed receipt of dispatch.')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 font-mono transition-all cursor-pointer ${
              rescue.rescue_status === 'ACKNOWLEDGED'
                ? 'bg-amber-950/60 border-amber-400 text-amber-300 ring-2 ring-amber-500/40'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
            }`}
          >
            <CheckSquare className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider">2. Acknowledge</span>
            <span className="text-[10px] text-slate-500 text-center font-sans">
              Confirm squad mobilizes with elevator keys
            </span>
          </button>

          {/* Button 3: START RESCUE */}
          <button
            type="button"
            onClick={() => onRescueAction('START_RESCUE', customNotes || 'Technicians on hoistway machine deck.')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 font-mono transition-all cursor-pointer ${
              rescue.rescue_status === 'EN_ROUTE' || rescue.rescue_status === 'ON_SITE'
                ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/40'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Truck className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider">3. Start Rescue</span>
            <span className="text-[10px] text-slate-500 text-center font-sans">
              Arrival on scene & manual hoist leveling
            </span>
          </button>

          {/* Button 4: MARK RESOLVED */}
          <button
            type="button"
            onClick={() => onRescueAction('MARK_RESOLVED', customNotes || 'All occupants safely evacuated. Clear.')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 font-mono transition-all cursor-pointer ${
              rescue.rescue_status === 'RESOLVED'
                ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/40'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">4. Mark Resolved</span>
            <span className="text-[10px] text-slate-500 text-center font-sans">
              Debrief completed & incident logged
            </span>
          </button>
        </div>

        {/* Optional Dispatch Notes Input */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="Add operational rescue notes (e.g., 'Fire crew staged on Floor 2 mezzanine with thermal camera')..."
            className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <span className="text-[11px] text-slate-500 whitespace-nowrap">
            Saved into SQLite table: <code className="text-slate-400">rescue_events</code>
          </span>
        </div>
      </div>

      {/* Incident Dispatch Detail & Safety Decision Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Operational Status Note */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            Current Field Dispatch Log
          </h3>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/90 text-xs font-mono space-y-2">
            <div className="text-slate-400 flex justify-between">
              <span>Timestamp:</span>
              <span className="text-slate-200">{rescue.notification_time || 'Standby'}</span>
            </div>
            <div className="text-slate-400 flex justify-between">
              <span>Rescue Status:</span>
              <span className="text-cyan-400 font-bold">{rescue.rescue_status}</span>
            </div>
            <div className="text-slate-400">
              <span>Notes:</span>
              <p className="text-slate-200 mt-1 bg-slate-900 p-2.5 rounded border border-slate-800 leading-relaxed">
                {rescue.notes}
              </p>
            </div>
          </div>
        </div>

        {/* Shaft Tactical Safety Map */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Shaft Positioning & Route Assessment
          </h3>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/90 text-xs font-mono space-y-2.5">
            <div className="flex justify-between items-center text-slate-300">
              <span>Car Position:</span>
              <span className="text-white font-bold">Floor {state.currentFloor} ({state.sensors.alignmentOffsetMm}mm)</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Decision Engine Verdict:</span>
              <span className={state.emergencyDecision.outcome === 'SAFE EXIT AVAILABLE' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {state.emergencyDecision.outcome}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Opposite Emergency Door:</span>
              <span className={state.emergencyExitStatus === 'UNLOCKED_SAFE' ? 'text-emerald-400' : 'text-rose-400'}>
                {state.emergencyExitStatus}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <strong>Action Directive: </strong>
              {state.emergencyDecision.outcome === 'SAFE EXIT AVAILABLE'
                ? 'Advise occupants to safely step through rear door into protected airlock.'
                : 'Strictly prohibit occupants from attempting to exit into the open hoistway shaft. Secure cabin.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
