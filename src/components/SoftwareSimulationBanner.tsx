import React from 'react';
import { ShieldAlert, AlertTriangle, Info, Sparkles, Terminal } from 'lucide-react';
import { soundFX } from '../lib/audio';

interface SoftwareSimulationBannerProps {
  onOpenSafetyModal: () => void;
}

export const SoftwareSimulationBanner: React.FC<SoftwareSimulationBannerProps> = ({
  onOpenSafetyModal,
}) => {
  return (
    <div
      id="software-simulation-label-banner"
      className="bg-amber-950/40 border-b border-amber-500/40 text-amber-200 text-xs px-4 py-2 font-mono flex flex-wrap items-center justify-between gap-2.5 shadow-sm"
    >
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>

        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-amber-900/60 border border-amber-600/60 font-bold text-[10px] text-amber-300 tracking-wider uppercase">
            Notice
          </span>
          <strong className="text-amber-100 font-semibold tracking-wide">
            Software Simulation / Concept Prototype — Not connected to real elevator hardware
          </strong>
        </div>

        <span className="hidden md:inline text-amber-500/80">•</span>
        <span className="hidden md:inline text-slate-300 text-[11px]">
          CSE Academic Portfolio & Technical Demo
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          id="open-safety-limitations-btn"
          type="button"
          onClick={() => {
            soundFX.playClick();
            onOpenSafetyModal();
          }}
          className="px-2.5 py-1 bg-amber-900/50 hover:bg-amber-850 text-amber-200 hover:text-white border border-amber-500/60 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Safety & Limitations</span>
        </button>
      </div>
    </div>
  );
};
