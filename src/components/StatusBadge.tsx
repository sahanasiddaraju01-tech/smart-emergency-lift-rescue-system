import React from 'react';
import { ElevatorStatus, RescueStatus, EmergencyExitStatus } from '../types';

interface StatusBadgeProps {
  status: ElevatorStatus | RescueStatus | EmergencyExitStatus | string;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', pulse = false }) => {
  const getColors = () => {
    switch (status) {
      case 'SAFE':
      case 'UNLOCKED_SAFE':
      case 'RESOLVED':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
      case 'NORMAL':
      case 'AVAILABLE':
      case 'STANDBY':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40';
      case 'WARNING':
      case 'ARMED':
      case 'ACKNOWLEDGED':
      case 'EN_ROUTE':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/40';
      case 'EMERGENCY':
      case 'RESCUE REQUIRED':
      case 'LOCKED':
      case 'UNAVAILABLE':
      case 'NOTIFIED':
      case 'FAULT':
      case 'OUTAGE':
      case 'OFFLINE':
      case 'BLOCKED_SMOKE':
      case 'BLOCKED_DEBRIS':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/40';
      default:
        return 'bg-slate-700/30 text-slate-300 border-slate-600/40';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-wider',
    lg: 'text-sm px-3.5 py-1.5 font-semibold tracking-wider',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase rounded border transition-all ${getColors()} ${sizeClasses} ${
        pulse ? 'animate-pulse' : ''
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status.replace(/_/g, ' ')}
    </span>
  );
};
