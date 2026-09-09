import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Radio,
  Send,
  HeartPulse,
  Shield,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { ElevatorState, PassengerMessage } from '../types';
import { soundFX } from '../lib/audio';

interface PassengerPanelProps {
  state: ElevatorState;
  onSOS: () => void;
}

export const PassengerPanel: React.FC<PassengerPanelProps> = ({ state, onSOS }) => {
  const isEmergency = state.sensors.emergencyStatus === 'ACTIVE';
  const isSafeExit = state.emergencyDecision.outcome === 'SAFE EXIT AVAILABLE';
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(true);
  const [customMsg, setCustomMsg] = useState('');
  const [messages, setMessages] = useState<PassengerMessage[]>([
    {
      id: 'm1',
      sender: 'SYSTEM',
      text: 'Cabin communication system online. Monitoring cabin safety interlocks.',
      timestamp: '00:00',
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;

    const newMsg: PassengerMessage = {
      id: String(Date.now()),
      sender: 'PASSENGER',
      text: customMsg.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setCustomMsg('');

    // Simulate dispatcher response
    setTimeout(() => {
      const dispatcherReply: PassengerMessage = {
        id: String(Date.now() + 1),
        sender: 'DISPATCHER',
        text: isEmergency
          ? isSafeExit
            ? 'Command Center: Exit authorization active. Please follow the illuminated opposite emergency door into the protected airlock.'
            : 'Command Center: We have your cabin location. Rescue team is en route. Do NOT attempt to force open any doors. Air ventilation is operational.'
          : 'Command Center: Copy that. Elevator operating nominally.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setMessages((prev) => [...prev, dispatcherReply]);
      if (voiceGuidanceEnabled) {
        soundFX.speak(dispatcherReply.text);
      }
    }, 900);
  };

  const handleTriggerSOS = () => {
    soundFX.playAlarm();
    onSOS();
    const sosMsg: PassengerMessage = {
      id: String(Date.now()),
      sender: 'PASSENGER',
      text: 'EMERGENCY SOS PRESSED! Occupants requesting immediate assistance!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setMessages((prev) => [...prev, sosMsg]);
  };

  const playVoiceAnnouncement = () => {
    let announcement = '';
    if (isEmergency) {
      if (isSafeExit) {
        announcement =
          'Emergency detected. Safe emergency exit is available. Please remain calm and proceed through the rear controlled exit into the protected access area.';
      } else {
        announcement =
          'Emergency detected. Please remain calm. Safe exit is currently unavailable. Emergency rescue assistance has been notified. Follow the displayed safety instructions and do not attempt to open doors.';
      }
    } else {
      announcement = 'Elevator system operating under normal conditions.';
    }
    soundFX.speak(announcement);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-800 rounded-lg text-cyan-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Cabin Passenger Assistance & Intercom
            </h3>
            <p className="text-xs text-slate-400">
              Interactive two-way emergency communication and voice guidance simulator.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setVoiceGuidanceEnabled(!voiceGuidanceEnabled);
              soundFX.isMuted = voiceGuidanceEnabled;
            }}
            className={`px-3 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              voiceGuidanceEnabled
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {voiceGuidanceEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            {voiceGuidanceEnabled ? 'Voice Guidance: ON' : 'Muted'}
          </button>

          <button
            type="button"
            onClick={playVoiceAnnouncement}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            Play Voice Broadcast
          </button>
        </div>
      </div>

      {/* Emergency Passenger Guidance Prompts */}
      {isEmergency ? (
        <div
          className={`p-4 rounded-xl border ${
            isSafeExit ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <AlertCircle className="w-4 h-4" />
            Cabin Screen Guidance Message
          </div>

          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <strong>"Emergency detected."</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <strong>"Please remain calm."</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <strong>"Emergency assistance has been notified."</strong>
            </div>

            {isSafeExit ? (
              <div className="flex items-center gap-2 text-emerald-300 font-bold pt-1 border-t border-emerald-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                "SAFE EMERGENCY EXIT AVAILABLE — Follow illuminated signs to the opposite door."
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-300 font-bold pt-1 border-t border-rose-800/40">
                <Shield className="w-4 h-4 text-rose-400" />
                "Safe exit is currently unavailable. Rescue assistance has been notified."
              </div>
            )}
            <div className="text-xs text-slate-300 italic pt-1">
              "Follow the displayed safety instructions."
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Cabin interior conditions normal. Airflow, lighting, and communication online.
          </span>
          <span className="font-mono text-slate-500">Cabin Comfort: 21°C • 52% RH</span>
        </div>
      )}

      {/* Two-Way Intercom Message Log */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 h-48 overflow-y-auto space-y-2 text-xs font-mono">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2 rounded-lg ${
              m.sender === 'PASSENGER'
                ? 'bg-cyan-950/40 border border-cyan-800/40 text-cyan-200 ml-6'
                : m.sender === 'DISPATCHER'
                ? 'bg-amber-950/40 border border-amber-800/40 text-amber-200 mr-6'
                : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
              <span className="font-bold uppercase tracking-wider">{m.sender}</span>
              <span>{m.timestamp}</span>
            </div>
            <p className="text-xs leading-relaxed">{m.text}</p>
          </div>
        ))}
      </div>

      {/* Message Input & SOS Button */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSendMessage} className="flex-1 w-full flex items-center gap-2">
          <input
            type="text"
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            placeholder="Type message to building emergency dispatcher..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </form>

        {/* SOS Button */}
        <button
          type="button"
          onClick={handleTriggerSOS}
          className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold rounded-lg text-xs tracking-wider uppercase border border-rose-400 shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <HeartPulse className="w-4 h-4 animate-pulse" />
          Press Emergency SOS
        </button>
      </div>
    </div>
  );
};
