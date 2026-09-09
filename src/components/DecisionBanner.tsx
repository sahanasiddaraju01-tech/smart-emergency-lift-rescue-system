import React from 'react';
import { ShieldCheck, ShieldAlert, ArrowRight, Lock, Unlock, AlertTriangle, Clock } from 'lucide-react';
import { ElevatorState } from '../types';

interface DecisionBannerProps {
  state: ElevatorState;
  elapsedSeconds: number;
}

export const DecisionBanner: React.FC<DecisionBannerProps> = ({ state, elapsedSeconds }) => {
  const isEmergency = state.sensors.emergencyStatus === 'ACTIVE';
  const decision = state.emergencyDecision;

  if (!isEmergency) {
    return (
      <div id="decision-banner-nominal" className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 font-semibold tracking-wider uppercase">System Safe & Armed</span>
              <span className="text-xs text-slate-500">|</span>
              <span className="text-xs text-slate-400">Decision Engine: Monitoring Telemetry</span>
            </div>
            <p className="text-sm text-slate-300 font-medium mt-0.5">
              Normal hoistway operations. Emergency dual-door interlock is active and secure.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
          <span>Alignment: <strong className="text-emerald-400">0mm (Sill Locked)</strong></span>
          <span>•</span>
          <span>Escape Route: <strong className="text-emerald-400">Clear</strong></span>
        </div>
      </div>
    );
  }

  // Active Emergency state
  const isSafe = decision.outcome === 'SAFE EXIT AVAILABLE';

  return (
    <div
      id="decision-banner-emergency"
      className={`rounded-xl border p-5 transition-all shadow-lg ${
        isSafe
          ? 'bg-gradient-to-r from-emerald-950/50 via-slate-900 to-emerald-950/40 border-emerald-500/60 shadow-emerald-950/30'
          : 'bg-gradient-to-r from-rose-950/50 via-slate-900 to-rose-950/40 border-rose-500/60 shadow-rose-950/30'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-3 rounded-lg border ${
              isSafe
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 animate-pulse'
                : 'bg-rose-500/20 border-rose-400 text-rose-300 animate-bounce'
            }`}
          >
            {isSafe ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-mono font-bold tracking-widest px-2 py-0.5 rounded border uppercase ${
                  isSafe ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-rose-500/20 border-rose-400 text-rose-300'
                }`}
              >
                {isSafe ? 'CASE A: EVACUATION APPROVED' : 'CASE B: DOORS LOCKED'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Triggered: {state.activeEmergencyType || 'Emergency'}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              {isSafe ? 'SAFE EMERGENCY EXIT AVAILABLE' : 'EMERGENCY EXIT UNAVAILABLE'}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Emergency Timer:</span>
            <span className="text-sm font-bold text-amber-300">
              {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:
              {(elapsedSeconds % 60).toString().padStart(2, '0')}s
            </span>
          </div>

          <div
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold ${
              isSafe ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
            }`}
          >
            Exit Hatch: {state.emergencyExitStatus.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Rationale & Safety instructions */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-7">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Safety Evaluation Rationale
          </div>
          <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
            {decision.reason}
          </p>
          {!isSafe && (
            <p className="text-xs font-semibold text-rose-400 mt-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              SAFETY PROTOCOL: Never encourage passengers to force doors open or enter an elevator shaft.
            </p>
          )}
        </div>

        {/* Escape Route Pipeline visualization if safe */}
        <div className="lg:col-span-5 bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            {isSafe ? 'Authorized Evacuation Pathway' : 'Safety Lockdown State'}
          </div>

          {isSafe ? (
            <div className="space-y-1.5">
              {decision.routeSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-mono text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-200">{step}</span>
                  {idx < decision.routeSteps.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-emerald-400/50 ml-auto" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Rescue team automatically notified & dispatched.
              </div>
              <div className="text-slate-400">
                Location: <strong>Core Shaft Alpha, Floor {state.currentFloor}</strong> ({state.sensors.alignmentOffsetMm}mm off sill).
              </div>
              <div className="text-slate-400">
                Cabin lighting & ventilation running on backup battery reserves.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
