import React from 'react';
import {
  ShieldAlert,
  X,
  Cpu,
  FileCheck,
  Award,
  AlertTriangle,
  Building,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { soundFX } from '../lib/audio';

interface SafetyLimitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyLimitationsModal: React.FC<SafetyLimitationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="safety-limitations-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="safety-limitations-modal"
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-safety-modal-btn"
          type="button"
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-400 hover:text-white transition-all cursor-pointer"
          aria-label="Close Safety Dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-rose-950/70 border border-rose-500/80 rounded-xl text-rose-400 shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-rose-950 border border-rose-700/80 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300">
                Official Safety Notice
              </span>
              <span className="text-xs text-slate-400 font-mono">ASME A17.1 & EN 81-20/50 Context</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Safety, Regulatory Standards & System Limitations
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Software Simulation / Concept Prototype — Not connected to real elevator hardware
            </p>
          </div>
        </div>

        {/* Primary Callout Notice */}
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/50 text-rose-200 text-xs sm:text-sm leading-relaxed space-y-2">
          <p className="font-semibold text-rose-300">
            Crucial Notice for Evaluators, Recruiters, and Engineers:
          </p>
          <p>
            This software application is an <strong>educational proof-of-concept and algorithmic simulation</strong> created for a Computer Science & Engineering (CSE) academic portfolio. It models state machines, sensor telemetry thresholds, dual-door egress rules, and rescue dispatch workflows entirely in software.
          </p>
          <p className="text-rose-300/90 text-xs">
            <strong>It does NOT control, interface with, or transmit signals to any real-world elevator machinery, motors, traction brakes, door interlocks, or building fire systems.</strong>
          </p>
        </div>

        {/* 4 Engineering Pillars Required for Real Systems */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Mandatory Requirements for Real-World Elevator Emergency Implementations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* 1. Certified Hardware */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold font-mono">
                <Cpu className="w-4 h-4" />
                <span>1. Certified Safety Hardware</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Real passenger elevators require certified SIL-3 (Safety Integrity Level 3) safety PLCs, type-tested electro-mechanical door interlocks with positive mechanical break contacts, fail-safe spring-applied friction brakes, and certified overspeed governors. Software algorithms alone cannot unlock hoistway doors without physical interlock safety loops.
              </p>
            </div>

            {/* 2. Professional Engineering */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold font-mono">
                <Building className="w-4 h-4" />
                <span>2. Professional Engineering (PE)</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Introducing a secondary rear emergency exit hatch requires stamped structural calculations by a licensed Professional Engineer (PE). Calculations must account for cabin frame torsional rigidity, counterweight balance, hoistway fire-rated door assemblies (Class A 2-hour rating), and positive-pressure smoke stairwell ventilation.
              </p>
            </div>

            {/* 3. Rigorous Testing & Commissioning */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold font-mono">
                <FileCheck className="w-4 h-4" />
                <span>3. Testing & Commissioning</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Physical elevator safety systems undergo destructive and non-destructive load tests, 125% rated load brake testing, buffer engagement deceleration profiling, and emergency battery failover latency tests under simulated power cut conditions before any passenger permits are granted.
              </p>
            </div>

            {/* 4. Regulatory & Code Approval */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-semibold font-mono">
                <Award className="w-4 h-4" />
                <span>4. Regulatory Codes & AHJ Approval</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Deployment must strictly adhere to <strong>ASME A17.1 / CSA B44</strong> (Safety Code for Elevators and Escalators), <strong>EN 81-20/50</strong> European safety standards, <strong>NFPA 72 & 101</strong> Life Safety Code, and receive written certification from the local municipal Authority Having Jurisdiction (AHJ) and Fire Marshal.
              </p>
            </div>
          </div>
        </div>

        {/* Software Architecture & Simulation Scope */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-white font-mono font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Scope of this Academic Software Prototype</span>
          </div>
          <ul className="text-slate-300 text-[11px] space-y-1.5 list-disc list-inside">
            <li>
              <strong>Algorithmic Decision Tree:</strong> Deterministic evaluation of sill alignment (<span className="text-cyan-300 font-mono">offset ≤ ±25mm</span>) and smoke optical detector signals.
            </li>
            <li>
              <strong>Digital Sensor Telemetry:</strong> Simulated real-time streaming of position sensors, backup battery inverters, and cabin load cells.
            </li>
            <li>
              <strong>Dual-Door Egress Flow:</strong> Visual demonstration of how controlled egress through a rear protected vestibule and isolated fire stairs mitigates hoistway fall hazards.
            </li>
            <li>
              <strong>Emergency Incident Response:</strong> Simulated SQLite audit logging and tactical responder dispatch notification.
            </li>
          </ul>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <span className="text-[11px] font-mono text-slate-500">
            CSE Capstone Prototype • GitHub Ready
          </span>
          <button
            id="acknowledge-safety-modal-btn"
            type="button"
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-mono font-bold rounded-lg transition-all cursor-pointer shadow-lg shadow-cyan-950/50"
          >
            I Understand & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
