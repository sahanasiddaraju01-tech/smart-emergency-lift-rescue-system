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
  onOpenSafetyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  elevatorStatus,
  onResetSimulation,
  onOpenSafetyModal,
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
    { id: 'system', label: 'Safety & System Info', icon: Info },
  ];

  return (
    <header className="bg-slate-950/95 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
      {/* Top Banner with Project Branding & Telemetry */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-base font-bold text-white tracking-wide uppercase">
                Smart Emergency Lift Rescue System
              </h1>
              <span className="hidden md:inline-block px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-[10px] font-mono text-cyan-300">
                CSE Portfolio Prototype
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[280px] sm:max-w-none">
              Autonomous dual-door safety evaluation & protected egress management
            </p>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] text-slate-400 hidden lg:inline font-mono">Status:</span>
            <StatusBadge status={elevatorStatus} size="sm" pulse={elevatorStatus === 'EMERGENCY' || elevatorStatus === 'RESCUE REQUIRED'} />
          </div>

          <div className="hidden xl:flex items-center gap-1.5 font-mono text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{timeStr || '00:00:00'} UTC</span>
          </div>

          {/* Safety & Limitations trigger button in navbar */}
          <button
            id="nav-safety-btn"
            type="button"
            title="View Safety & Limitations"
            onClick={() => {
              soundFX.playClick();
              onOpenSafetyModal();
            }}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 active:scale-95 text-slate-300 hover:text-white border border-slate-700/80 rounded-lg text-xs font-mono transition-all cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Safety</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="nav-sound-toggle-btn"
            type="button"
            title={isMuted ? 'Unmute Audio Alerts' : 'Mute Audio Alerts'}
            onClick={() => {
              const next = !isMuted;
              setIsMuted(next);
              soundFX.isMuted = next;
              if (!next) {
                soundFX.playClick();
              }
            }}
            className="p-1.5 sm:p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 active:scale-95 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Reset Simulation Button */}
          <button
            id="nav-reset-sim-btn"
            type="button"
            title="Reset simulation to initial normal state"
            onClick={() => {
              soundFX.playClick();
              onResetSimulation();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-950/40 hover:bg-amber-900/60 active:scale-95 text-amber-300 hover:text-amber-200 border border-amber-500/60 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer shadow-sm shadow-amber-950/40"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Sim</span>
          </button>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="border-t border-slate-800/80 bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center overflow-x-auto no-scrollbar gap-1 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onTabChange(tab.id);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
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
