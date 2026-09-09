import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { SimulationPage } from './pages/SimulationPage';
import { EmergencyControlPage } from './pages/EmergencyControlPage';
import { RescueTeamPage } from './pages/RescueTeamPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SystemInfoPage } from './pages/SystemInfoPage';
import {
  ElevatorState,
  EmergencyType,
  SystemLog,
  EmergencyRecord,
} from './types';
import { soundFX } from './lib/audio';

const DEFAULT_STATE: ElevatorState = {
  id: 'LIFT-ALPHA-01',
  name: 'Core Shaft Alpha (Tower 1)',
  currentFloor: 2,
  targetFloor: 2,
  movement: 'STOPPED',
  status: 'NORMAL',
  speedMps: 0,
  sensors: {
    positionSensor: 'ACTIVE',
    floorAlignment: true,
    alignmentOffsetMm: 0,
    doorStatus: 'FRONT_CLOSED',
    powerStatus: 'MAIN_ACTIVE',
    backupPowerStatus: 'AVAILABLE',
    emergencyStatus: 'NORMAL',
    escapeRouteAvailability: 'AVAILABLE',
    communicationStatus: 'ACTIVE',
    passengerCount: 4,
  },
  emergencyExitStatus: 'LOCKED',
  activeEmergencyId: null,
  activeEmergencyType: null,
  emergencyStartTime: null,
  emergencyDecision: {
    outcome: 'STANDBY',
    reason: 'Elevator operating normally. All interlocks armed.',
    canEvacuateOppositeDoor: false,
    routeSteps: [],
    timestamp: new Date().toISOString(),
  },
  rescueTeam: {
    rescue_status: 'STANDBY',
    notification_time: null,
    notes: 'Monitoring telemetry. Station on standby.',
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [state, setState] = useState<ElevatorState>(DEFAULT_STATE);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyRecord[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Fetch all current state data
  const fetchData = useCallback(async () => {
    try {
      const [resStatus, resLogs, resEmergencies, resAnalytics] = await Promise.all([
        fetch('/api/elevator/status'),
        fetch('/api/logs'),
        fetch('/api/emergencies'),
        fetch('/api/analytics'),
      ]);

      if (resStatus.ok) {
        const data = await resStatus.json();
        setState(data);
      }
      if (resLogs.ok) {
        const data = await resLogs.json();
        setLogs(data);
      }
      if (resEmergencies.ok) {
        const data = await resEmergencies.json();
        setEmergencies(data);
      }
      if (resAnalytics.ok) {
        const data = await resAnalytics.json();
        setAnalytics(data);
      }
    } catch {
      // Fallback in case of temporary network latency
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2500);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Elapsed timer computation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.sensors.emergencyStatus === 'ACTIVE' && state.emergencyStartTime) {
      const updateClock = () => {
        const now = Date.now();
        const diff = Math.max(0, Math.floor((now - state.emergencyStartTime!) / 1000));
        setElapsedSeconds(diff);
      };
      updateClock();
      timer = setInterval(updateClock, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [state.sensors.emergencyStatus, state.emergencyStartTime]);

  // 1. Start Emergency
  const handleStartEmergency = async (
    emergency_type: EmergencyType,
    floor_aligned = true,
    escape_route_clear = true,
    passenger_count = 4,
    alignment_offset = 0
  ) => {
    soundFX.playAlarm();
    try {
      const res = await fetch('/api/emergency/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emergency_type,
          floor_aligned,
          escape_route_clear,
          passenger_count,
          alignment_offset,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setState(data);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to start emergency', err);
    }
  };

  // 2. Clear / Resolve Emergency
  const handleClearEmergency = async () => {
    soundFX.playSafeChime();
    try {
      const res = await fetch('/api/emergency/clear', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setState(data);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to clear emergency', err);
    }
  };

  // 3. Reset Simulation
  const handleResetSimulation = async () => {
    soundFX.playChime(500, 'triangle', 0.2);
    try {
      const res = await fetch('/api/simulation/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setState(data);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to reset simulation', err);
    }
  };

  // 4. Move Elevator
  const handleFloorMove = async (target_floor: number, stop_between = false) => {
    soundFX.playChime(440, 'sine', 0.15);
    try {
      const res = await fetch('/api/simulation/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_floor, stop_between }),
      });
      if (res.ok) {
        const data = await res.json();
        setState(data);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to move elevator', err);
    }
  };

  // 5. Override Sensors
  const handleSensorOverride = async (overrides: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/simulation/sensors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overrides),
      });
      if (res.ok) {
        const data = await res.json();
        setState(data);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to override sensors', err);
    }
  };

  // 6. Rescue Action
  const handleRescueAction = async (
    action: 'NOTIFY' | 'ACKNOWLEDGE' | 'START_RESCUE' | 'MARK_RESOLVED',
    notes?: string
  ) => {
    soundFX.playChime(600, 'sawtooth', 0.2);
    try {
      const res = await fetch('/api/rescue/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed rescue action', err);
    }
  };

  // 7. In-Cabin Passenger SOS
  const handleSOS = async () => {
    try {
      await fetch('/api/passengers/sos', { method: 'POST' });
      fetchData();
    } catch (err) {
      console.error('Failed SOS trigger', err);
    }
  };

  // 8. Scenario Quick Runners (Section 14)
  const handleRunScenario = (scenarioId: number) => {
    switch (scenarioId) {
      case 1:
        // Scenario 1: Normal operation
        handleResetSimulation();
        break;
      case 2:
        // Scenario 2: Power failure while elevator is aligned with a floor
        handleFloorMove(2, false);
        handleStartEmergency('Power Failure', true, true, 4, 0);
        break;
      case 3:
        // Scenario 3: Power failure while elevator is between floors
        handleFloorMove(2, true);
        handleStartEmergency('Elevator Stopped Between Floors', false, true, 4, 450);
        break;
      case 4:
        // Scenario 4: Multiple passengers during an emergency
        handleFloorMove(3, false);
        handleStartEmergency('Multiple Passenger Emergency', true, true, 10, 0);
        break;
      case 5:
        // Scenario 5: Emergency route unavailable (smoke detected)
        handleFloorMove(1, false);
        handleStartEmergency('Electrical Fault', true, false, 3, 0);
        break;
      case 6:
        // Scenario 6: Rescue team notified
        handleFloorMove(4, true);
        handleStartEmergency('Door Fault', false, true, 5, 520);
        setTimeout(() => handleRescueAction('NOTIFY', 'Automatic priority dispatch triggered for hoistway squad.'), 200);
        break;
      case 7:
        // Scenario 7: Emergency successfully resolved
        handleClearEmergency();
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        elevatorStatus={state.status}
        onResetSimulation={handleResetSimulation}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardPage
            state={state}
            logs={logs}
            elapsedSeconds={elapsedSeconds}
            onFloorMove={(f) => handleFloorMove(f, false)}
            onSensorOverride={handleSensorOverride}
            onSOS={handleSOS}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'simulation' && (
          <SimulationPage
            state={state}
            onFloorMove={handleFloorMove}
            onSensorOverride={handleSensorOverride}
          />
        )}

        {activeTab === 'control' && (
          <EmergencyControlPage
            state={state}
            onStartEmergency={handleStartEmergency}
            onClearEmergency={handleClearEmergency}
            onResetSimulation={handleResetSimulation}
            onSensorOverride={handleSensorOverride}
            onRunScenario={handleRunScenario}
          />
        )}

        {activeTab === 'rescue' && (
          <RescueTeamPage
            state={state}
            elapsedSeconds={elapsedSeconds}
            onRescueAction={handleRescueAction}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage emergencies={emergencies} logs={logs} />
        )}

        {activeTab === 'analytics' && <AnalyticsPage analytics={analytics} />}

        {activeTab === 'system' && <SystemInfoPage />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400">SMART EMERGENCY LIFT RESCUE SYSTEM</span>
            <span>•</span>
            <span>Full-Stack Software Simulation Prototype</span>
          </div>

          <div className="text-slate-500 text-center sm:text-right">
            <span>CSE Student Portfolio • Educational Software Simulation Only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
