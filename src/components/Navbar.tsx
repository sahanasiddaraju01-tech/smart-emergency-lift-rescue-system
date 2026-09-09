import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Sliders,
  Users2,
  History,
  BarChart3,
  Info,
  RotateCcw,
  LayoutDashboard,
  Boxes,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ElevatorStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { soundFX } from '../lib/audio';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  elevatorStatus: ElevatorStatus;
  onResetSimulation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  elevatorStatus,
  onResetSimulation,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'simulation', label: 'Shaft Simulation', icon: Boxes },
    { id: 'control', label: 'Emergency Simulator', icon: Sliders },
    { id: 'rescue', label: 'Rescue Team', icon: Users2 },
    { id: 'history', label: 'History Logs', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'system', label: 'System Info', icon: Info },
  ];

  return (
    <header className="bg-slate-950/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
      {/* Top Banner with Project Branding & Telemetry */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-wide uppercase">
                Smart Emergency Lift Rescue System
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-[10px] font-mono text-cyan-300">
                CSE Portfolio Prototype
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Autonomous dual-door safety evaluation & protected egress management
            </p>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden md:inline font-mono">System State:</span>
            <StatusBadge status={elevatorStatus} size="md" pulse={elevatorStatus === 'EMERGENCY' || elevatorStatus === 'RESCUE REQUIRED'} />
          </div>

          <div className="hidden lg:flex items-center gap-1.5 font-mono text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{timeStr || '00:00:00'} UTC</span>
          </div>

          <button
            type="button"
            title="Toggle Sound Effects"
            onClick={() => {
              const next = !isMuted;
              setIsMuted(next);
              soundFX.isMuted = next;
            }}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            type="button"
            onClick={onResetSimulation}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-lg text-xs font-mono transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Reset Sim</span>
          </button>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="border-t border-slate-800/80 bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center overflow-x-auto no-scrollbar gap-1 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
