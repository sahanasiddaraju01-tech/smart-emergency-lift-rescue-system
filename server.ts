import express from 'express';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(process.cwd(), 'emergency_lift.db');
const db = new DatabaseSync(dbPath);

// Create required tables
db.exec(`
  CREATE TABLE IF NOT EXISTS elevators (
    id TEXT PRIMARY KEY,
    elevator_name TEXT NOT NULL,
    current_floor INTEGER NOT NULL,
    status TEXT NOT NULL,
    power_status TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS emergencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    elevator_id TEXT NOT NULL,
    emergency_type TEXT NOT NULL,
    detected_time TEXT NOT NULL,
    resolved_time TEXT,
    status TEXT NOT NULL,
    response_time REAL,
    passenger_count INTEGER DEFAULT 1,
    exit_used INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS passengers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    elevator_id TEXT NOT NULL,
    passenger_count INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rescue_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emergency_id INTEGER NOT NULL,
    notification_time TEXT NOT NULL,
    rescue_status TEXT NOT NULL,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    description TEXT NOT NULL
  );
`);

// Seed default elevator if empty
const checkElevator = db.prepare('SELECT id FROM elevators WHERE id = ?').get('LIFT-ALPHA-01');
if (!checkElevator) {
  db.prepare(`
    INSERT INTO elevators (id, elevator_name, current_floor, status, power_status)
    VALUES (?, ?, ?, ?, ?)
  `).run('LIFT-ALPHA-01', 'Core Shaft Alpha (Tower 1)', 2, 'NORMAL', 'MAIN_ACTIVE');

  db.prepare(`
    INSERT INTO passengers (elevator_id, passenger_count)
    VALUES (?, ?)
  `).run('LIFT-ALPHA-01', 4);

  // Seed initial realistic historical records for demo / analytics
  const now = new Date();
  const past1 = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
  const past1Resolved = new Date(now.getTime() - 24 * 3600 * 1000 + 45000).toISOString();
  const past2 = new Date(now.getTime() - 12 * 3600 * 1000).toISOString();
  const past2Resolved = new Date(now.getTime() - 12 * 3600 * 1000 + 115000).toISOString();

  db.prepare(`
    INSERT INTO emergencies (elevator_id, emergency_type, detected_time, resolved_time, status, response_time, passenger_count, exit_used)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('LIFT-ALPHA-01', 'Power Failure', past1, past1Resolved, 'RESOLVED', 45.0, 3, 1);

  db.prepare(`
    INSERT INTO emergencies (elevator_id, emergency_type, detected_time, resolved_time, status, response_time, passenger_count, exit_used)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('LIFT-ALPHA-01', 'Elevator Stopped Between Floors', past2, past2Resolved, 'RESOLVED', 115.0, 5, 0);

  db.prepare(`
    INSERT INTO system_logs (event_type, timestamp, description)
    VALUES (?, ?, ?)
  `).run('INITIALIZATION', now.toISOString(), 'System booted. Decision engine online. SQLite database initialized.');
}

// In-Memory Real-Time State
interface ElevatorSimulationState {
  id: string;
  name: string;
  currentFloor: number;
  targetFloor: number;
  movement: 'STOPPED' | 'MOVING_UP' | 'MOVING_DOWN' | 'IDLE';
  status: 'NORMAL' | 'WARNING' | 'EMERGENCY' | 'SAFE' | 'RESCUE REQUIRED' | 'RESOLVED';
  speedMps: number;
  sensors: {
    positionSensor: 'ACTIVE' | 'FAULT' | 'CALIBRATING';
    floorAlignment: boolean;
    alignmentOffsetMm: number;
    doorStatus: 'FRONT_CLOSED' | 'FRONT_OPEN' | 'EMERGENCY_UNLOCKED' | 'BOTH_LOCKED' | 'DOOR_FAULT';
    powerStatus: 'MAIN_ACTIVE' | 'BACKUP_ACTIVE' | 'OUTAGE';
    backupPowerStatus: 'AVAILABLE' | 'ACTIVE' | 'DEPLETED';
    emergencyStatus: 'NORMAL' | 'ACTIVE';
    escapeRouteAvailability: 'AVAILABLE' | 'BLOCKED_SMOKE' | 'BLOCKED_DEBRIS' | 'HAZARD_DETECTED';
    communicationStatus: 'ACTIVE' | 'DEGRADED' | 'OFFLINE';
    passengerCount: number;
  };
  emergencyExitStatus: 'LOCKED' | 'ARMED' | 'UNLOCKED_SAFE' | 'UNAVAILABLE';
  activeEmergencyId: number | null;
  activeEmergencyType: string | null;
  emergencyStartTime: number | null;
  emergencyDecision: {
    outcome: 'SAFE EXIT AVAILABLE' | 'RESCUE REQUIRED' | 'STANDBY';
    reason: string;
    canEvacuateOppositeDoor: boolean;
    routeSteps: string[];
    timestamp: string;
  };
  rescueTeam: {
    rescue_status: 'STANDBY' | 'NOTIFIED' | 'ACKNOWLEDGED' | 'EN_ROUTE' | 'ON_SITE' | 'RESOLVED';
    notification_time: string | null;
    notes: string;
  };
}

const state: ElevatorSimulationState = {
  id: 'LIFT-ALPHA-01',
  name: 'Core Shaft Alpha (Tower 1)',
  currentFloor: 2,
  targetFloor: 2,
  movement: 'STOPPED',
  status: 'NORMAL',
  speedMps: 0.0,
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
    reason: 'Elevator operating normally. All safety interlocks armed.',
    canEvacuateOppositeDoor: false,
    routeSteps: [],
    timestamp: new Date().toISOString(),
  },
  rescueTeam: {
    rescue_status: 'STANDBY',
    notification_time: null,
    notes: 'Monitoring telemetry. Rescue station on standby.',
  },
};

// Emergency Decision Engine function
function evaluateEmergencyDecision(): void {
  if (state.sensors.emergencyStatus !== 'ACTIVE') {
    state.emergencyDecision = {
      outcome: 'STANDBY',
      reason: 'Elevator operating normally. All systems nominal.',
      canEvacuateOppositeDoor: false,
      routeSteps: [],
      timestamp: new Date().toISOString(),
    };
    state.emergencyExitStatus = 'LOCKED';
    if (state.status !== 'RESOLVED') {
      state.status = 'NORMAL';
    }
    return;
  }

  // Safety checks
  const isAligned = state.sensors.floorAlignment && Math.abs(state.sensors.alignmentOffsetMm) <= 25;
  const isRouteClear = state.sensors.escapeRouteAvailability === 'AVAILABLE';
  const hasPower = state.sensors.powerStatus === 'MAIN_ACTIVE' || state.sensors.backupPowerStatus === 'ACTIVE' || state.sensors.backupPowerStatus === 'AVAILABLE';

  if (isAligned && isRouteClear && hasPower) {
    // CASE A: SAFE EXIT AVAILABLE
    state.emergencyDecision = {
      outcome: 'SAFE EXIT AVAILABLE',
      reason: `Cabin is safely aligned with Floor ${state.currentFloor} (offset: ${state.sensors.alignmentOffsetMm}mm). Escape route and protected access area verified clear. Controlled opposite emergency exit is unlocked.`,
      canEvacuateOppositeDoor: true,
      routeSteps: [
        `Elevator Cabin (Floor ${state.currentFloor})`,
        'Controlled Emergency Exit (Rear Sealed Hatch)',
        'Protected Access Area (Fire & Smoke Dampened Airlock)',
        'Fire-Rated Pressurized Staircase',
        'Ground-Floor Safe Building Egress'
      ],
      timestamp: new Date().toISOString(),
    };
    state.emergencyExitStatus = 'UNLOCKED_SAFE';
    state.status = 'SAFE';
    state.sensors.doorStatus = 'EMERGENCY_UNLOCKED';
  } else {
    // CASE B: SAFE EXIT NOT AVAILABLE
    let refusalReason = '';
    if (!isAligned) {
      refusalReason = `Cabin is misaligned between floors (offset: ${state.sensors.alignmentOffsetMm}mm). Opening emergency exit risks shaft fall hazard. Passengers must remain securely in cabin.`;
    } else if (!isRouteClear) {
      refusalReason = `Emergency escape route compromised (${state.sensors.escapeRouteAvailability.replace('_', ' ')}). Exit kept sealed to protect passengers from outside toxic smoke/debris.`;
    } else {
      refusalReason = 'Power and backup systems severely degraded. Mechanical emergency interlocks locked pending on-site rescue team intervention.';
    }

    state.emergencyDecision = {
      outcome: 'RESCUE REQUIRED',
      reason: refusalReason,
      canEvacuateOppositeDoor: false,
      routeSteps: [],
      timestamp: new Date().toISOString(),
    };
    state.emergencyExitStatus = 'LOCKED';
    state.status = 'RESCUE REQUIRED';
    state.sensors.doorStatus = 'BOTH_LOCKED';

    // Automatically flag rescue team if not yet notified
    if (state.rescueTeam.rescue_status === 'STANDBY') {
      state.rescueTeam.rescue_status = 'NOTIFIED';
      state.rescueTeam.notification_time = new Date().toISOString();
      state.rescueTeam.notes = `Auto-dispatched alert: ${state.activeEmergencyType || 'Emergency'} - Cabin at Floor ${state.currentFloor} (${state.sensors.alignmentOffsetMm}mm offset). Exit unavailable.`;

      if (state.activeEmergencyId) {
        db.prepare(`
          INSERT INTO rescue_events (emergency_id, notification_time, rescue_status, notes)
          VALUES (?, ?, ?, ?)
        `).run(state.activeEmergencyId, state.rescueTeam.notification_time, 'NOTIFIED', state.rescueTeam.notes);
      }
    }
  }

  // Persist updated status to elevators table
  db.prepare(`
    UPDATE elevators
    SET status = ?, current_floor = ?, power_status = ?
    WHERE id = ?
  `).run(state.status, state.currentFloor, state.sensors.powerStatus, state.id);
}

function logEvent(type: string, desc: string) {
  const ts = new Date().toISOString();
  db.prepare(`
    INSERT INTO system_logs (event_type, timestamp, description)
    VALUES (?, ?, ?)
  `).run(type, ts, desc);
}

// REST API Endpoints

// 1. GET /api/elevator/status
app.get('/api/elevator/status', (_req, res) => {
  res.json(state);
});

// 2. POST /api/emergency/start
app.post('/api/emergency/start', (req, res) => {
  const { emergency_type, floor_aligned, escape_route_clear, passenger_count, alignment_offset } = req.body;

  state.activeEmergencyType = emergency_type || 'Power Failure';
  state.sensors.emergencyStatus = 'ACTIVE';
  state.emergencyStartTime = Date.now();

  if (typeof floor_aligned === 'boolean') {
    state.sensors.floorAlignment = floor_aligned;
    state.sensors.alignmentOffsetMm = floor_aligned ? 0 : (alignment_offset ?? 480);
  }
  if (typeof escape_route_clear === 'boolean') {
    state.sensors.escapeRouteAvailability = escape_route_clear ? 'AVAILABLE' : 'BLOCKED_SMOKE';
  }
  if (typeof passenger_count === 'number') {
    state.sensors.passengerCount = passenger_count;
    db.prepare('UPDATE passengers SET passenger_count = ? WHERE elevator_id = ?').run(passenger_count, state.id);
  }

  // Adjust power status based on emergency type
  if (emergency_type === 'Power Failure') {
    state.sensors.powerStatus = 'OUTAGE';
    state.sensors.backupPowerStatus = 'ACTIVE';
  } else if (emergency_type === 'Electrical Fault') {
    state.sensors.powerStatus = 'OUTAGE';
    state.sensors.backupPowerStatus = 'DEPLETED';
  } else if (emergency_type === 'Communication Failure') {
    state.sensors.communicationStatus = 'OFFLINE';
  } else if (emergency_type === 'Door Fault') {
    state.sensors.doorStatus = 'DOOR_FAULT';
  }

  const detectedTime = new Date().toISOString();
  const insertResult = db.prepare(`
    INSERT INTO emergencies (elevator_id, emergency_type, detected_time, status, passenger_count, exit_used)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(state.id, state.activeEmergencyType, detectedTime, 'ACTIVE', state.sensors.passengerCount, 0);

  state.activeEmergencyId = Number(insertResult.lastInsertRowid);

  // Run Decision Engine
  evaluateEmergencyDecision();

  logEvent('EMERGENCY_TRIGGERED', `Emergency '${state.activeEmergencyType}' initiated at Floor ${state.currentFloor}. Decision: ${state.emergencyDecision.outcome}`);

  res.json(state);
});

// 3. POST /api/emergency/clear (or resolve)
app.post('/api/emergency/clear', (_req, res) => {
  const resolvedTime = new Date().toISOString();
  let durationSec = 0;
  if (state.emergencyStartTime) {
    durationSec = Math.round(((Date.now() - state.emergencyStartTime) / 1000) * 10) / 10;
  }

  if (state.activeEmergencyId) {
    const exitUsed = state.emergencyDecision.canEvacuateOppositeDoor ? 1 : 0;
    db.prepare(`
      UPDATE emergencies
      SET resolved_time = ?, status = 'RESOLVED', response_time = ?, exit_used = ?
      WHERE id = ?
    `).run(resolvedTime, durationSec, exitUsed, state.activeEmergencyId);

    db.prepare(`
      INSERT INTO rescue_events (emergency_id, notification_time, rescue_status, notes)
      VALUES (?, ?, 'RESOLVED', ?)
    `).run(state.activeEmergencyId, resolvedTime, `Emergency cleared. Duration: ${durationSec}s.`);
  }

  // Reset state to normal
  state.status = 'RESOLVED';
  state.sensors.emergencyStatus = 'NORMAL';
  state.sensors.powerStatus = 'MAIN_ACTIVE';
  state.sensors.backupPowerStatus = 'AVAILABLE';
  state.sensors.communicationStatus = 'ACTIVE';
  state.sensors.doorStatus = 'FRONT_CLOSED';
  state.sensors.escapeRouteAvailability = 'AVAILABLE';
  state.sensors.floorAlignment = true;
  state.sensors.alignmentOffsetMm = 0;
  state.emergencyExitStatus = 'LOCKED';
  state.rescueTeam.rescue_status = 'RESOLVED';
  state.rescueTeam.notes = 'All passengers accounted for. System safe.';
  state.activeEmergencyId = null;
  state.activeEmergencyType = null;
  state.emergencyStartTime = null;

  evaluateEmergencyDecision();

  logEvent('EMERGENCY_RESOLVED', `Emergency successfully resolved. System returned to safe baseline after ${durationSec}s.`);

  res.json(state);
});

// 4. POST /api/simulation/move
app.post('/api/simulation/move', (req, res) => {
  const { target_floor, stop_between } = req.body;
  if (typeof target_floor === 'number' && target_floor >= 0 && target_floor <= 5) {
    state.targetFloor = target_floor;
    if (stop_between) {
      state.currentFloor = target_floor;
      state.sensors.floorAlignment = false;
      state.sensors.alignmentOffsetMm = 520; // stopped 520mm above sill
      state.movement = 'STOPPED';
      state.status = 'WARNING';
    } else {
      state.currentFloor = target_floor;
      state.sensors.floorAlignment = true;
      state.sensors.alignmentOffsetMm = 0;
      state.movement = 'STOPPED';
    }

    evaluateEmergencyDecision();
    logEvent('ELEVATOR_MOVE', `Car moved to Floor ${state.currentFloor} (Aligned: ${state.sensors.floorAlignment}, Offset: ${state.sensors.alignmentOffsetMm}mm).`);
  }
  res.json(state);
});

// 5. POST /api/simulation/sensors
app.post('/api/simulation/sensors', (req, res) => {
  const { floorAlignment, alignmentOffsetMm, escapeRouteAvailability, powerStatus, backupPowerStatus, passengerCount, doorStatus } = req.body;

  if (typeof floorAlignment === 'boolean') {
    state.sensors.floorAlignment = floorAlignment;
    state.sensors.alignmentOffsetMm = floorAlignment ? 0 : (alignmentOffsetMm ?? 450);
  }
  if (typeof alignmentOffsetMm === 'number') {
    state.sensors.alignmentOffsetMm = alignmentOffsetMm;
    state.sensors.floorAlignment = Math.abs(alignmentOffsetMm) <= 25;
  }
  if (escapeRouteAvailability) {
    state.sensors.escapeRouteAvailability = escapeRouteAvailability;
  }
  if (powerStatus) {
    state.sensors.powerStatus = powerStatus;
  }
  if (backupPowerStatus) {
    state.sensors.backupPowerStatus = backupPowerStatus;
  }
  if (doorStatus) {
    state.sensors.doorStatus = doorStatus;
  }
  if (typeof passengerCount === 'number') {
    state.sensors.passengerCount = passengerCount;
    db.prepare('UPDATE passengers SET passenger_count = ? WHERE elevator_id = ?').run(passengerCount, state.id);
  }

  evaluateEmergencyDecision();
  logEvent('SENSOR_OVERRIDE', `Sensors updated: Aligned=${state.sensors.floorAlignment}, Route=${state.sensors.escapeRouteAvailability}, Power=${state.sensors.powerStatus}`);

  res.json(state);
});

// 6. GET /api/rescue/status
app.get('/api/rescue/status', (_req, res) => {
  res.json({
    emergencyId: state.activeEmergencyId,
    elevatorId: state.id,
    currentFloor: state.currentFloor,
    alignmentOffsetMm: state.sensors.alignmentOffsetMm,
    emergencyType: state.activeEmergencyType,
    passengerCount: state.sensors.passengerCount,
    timeSinceEmergencyMs: state.emergencyStartTime ? Date.now() - state.emergencyStartTime : 0,
    communicationStatus: state.sensors.communicationStatus,
    rescueStatus: state.rescueTeam.rescue_status,
    notes: state.rescueTeam.notes,
    decision: state.emergencyDecision,
  });
});

// 7. POST /api/rescue/notify
app.post('/api/rescue/notify', (_req, res) => {
  state.rescueTeam.rescue_status = 'NOTIFIED';
  state.rescueTeam.notification_time = new Date().toISOString();
  state.rescueTeam.notes = `Manual alert triggered. Dispatching building safety team to Core Shaft Floor ${state.currentFloor}.`;

  if (state.activeEmergencyId) {
    db.prepare(`
      INSERT INTO rescue_events (emergency_id, notification_time, rescue_status, notes)
      VALUES (?, ?, 'NOTIFIED', ?)
    `).run(state.activeEmergencyId, state.rescueTeam.notification_time, state.rescueTeam.notes);
  }

  logEvent('RESCUE_NOTIFIED', state.rescueTeam.notes);
  res.json(state.rescueTeam);
});

// 8. POST /api/rescue/action
app.post('/api/rescue/action', (req, res) => {
  const { action, notes } = req.body;
  const now = new Date().toISOString();

  if (action === 'ACKNOWLEDGE') {
    state.rescueTeam.rescue_status = 'ACKNOWLEDGED';
    state.rescueTeam.notes = notes || 'Rescue personnel acknowledged incident. Emergency equipment checked.';
  } else if (action === 'START_RESCUE') {
    state.rescueTeam.rescue_status = 'EN_ROUTE';
    state.rescueTeam.notes = notes || 'Rescue squad arriving on scene. Securing elevator shaft.';
  } else if (action === 'MARK_RESOLVED') {
    state.rescueTeam.rescue_status = 'RESOLVED';
    state.rescueTeam.notes = notes || 'All occupants safely assisted. Inspection complete.';
  }

  if (state.activeEmergencyId) {
    db.prepare(`
      INSERT INTO rescue_events (emergency_id, notification_time, rescue_status, notes)
      VALUES (?, ?, ?, ?)
    `).run(state.activeEmergencyId, now, state.rescueTeam.rescue_status, state.rescueTeam.notes);
  }

  logEvent('RESCUE_ACTION', `Rescue action: ${action} - ${state.rescueTeam.notes}`);
  res.json(state.rescueTeam);
});

// 9. POST /api/passengers/sos
app.post('/api/passengers/sos', (_req, res) => {
  logEvent('PASSENGER_SOS', `In-cabin SOS button pressed by passengers at Floor ${state.currentFloor}!`);
  if (state.sensors.emergencyStatus !== 'ACTIVE') {
    state.sensors.emergencyStatus = 'ACTIVE';
    state.activeEmergencyType = 'Passenger Assistance Requested';
    state.emergencyStartTime = Date.now();
    evaluateEmergencyDecision();
  }
  state.rescueTeam.rescue_status = 'NOTIFIED';
  state.rescueTeam.notes = 'Passenger panic alarm triggered. Intercom open.';
  res.json({ message: 'Emergency SOS received. Dispatcher speaking with cabin.', state });
});

// 10. GET /api/logs
app.get('/api/logs', (_req, res) => {
  const logs = db.prepare('SELECT * FROM system_logs ORDER BY id DESC LIMIT 50').all();
  res.json(logs);
});

// 11. GET /api/emergencies (History)
app.get('/api/emergencies', (_req, res) => {
  const emergencies = db.prepare('SELECT * FROM emergencies ORDER BY id DESC').all();
  res.json(emergencies);
});

// 12. GET /api/analytics
app.get('/api/analytics', (_req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM emergencies').get() as { count: number };
  const resolved = db.prepare("SELECT COUNT(*) as count FROM emergencies WHERE status = 'RESOLVED'").get() as { count: number };
  const avgResponse = db.prepare('SELECT AVG(response_time) as avg_resp FROM emergencies WHERE response_time IS NOT NULL').get() as { avg_resp: number | null };
  const safeExitCount = db.prepare('SELECT COUNT(*) as count FROM emergencies WHERE exit_used = 1').get() as { count: number };
  const rescueRequiredCount = db.prepare('SELECT COUNT(*) as count FROM emergencies WHERE exit_used = 0').get() as { count: number };

  const byType = db.prepare(`
    SELECT emergency_type, COUNT(*) as count
    FROM emergencies
    GROUP BY emergency_type
  `).all();

  const history = db.prepare('SELECT * FROM emergencies ORDER BY id DESC LIMIT 10').all();

  res.json({
    totalEmergencies: total.count,
    resolvedEmergencies: resolved.count,
    safeExitCount: safeExitCount.count,
    rescueRequiredCount: rescueRequiredCount.count,
    averageResponseTimeSec: avgResponse.avg_resp ? Math.round(avgResponse.avg_resp * 10) / 10 : 65.4,
    byType,
    history,
  });
});

// 13. POST /api/simulation/reset
app.post('/api/simulation/reset', (_req, res) => {
  state.currentFloor = 2;
  state.targetFloor = 2;
  state.movement = 'STOPPED';
  state.status = 'NORMAL';
  state.speedMps = 0;
  state.sensors = {
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
  };
  state.emergencyExitStatus = 'LOCKED';
  state.activeEmergencyId = null;
  state.activeEmergencyType = null;
  state.emergencyStartTime = null;
  state.emergencyDecision = {
    outcome: 'STANDBY',
    reason: 'Elevator operating normally. All safety interlocks armed.',
    canEvacuateOppositeDoor: false,
    routeSteps: [],
    timestamp: new Date().toISOString(),
  };
  state.rescueTeam = {
    rescue_status: 'STANDBY',
    notification_time: null,
    notes: 'Monitoring telemetry. Rescue station on standby.',
  };

  db.prepare(`
    UPDATE elevators
    SET status = ?, current_floor = ?, power_status = ?
    WHERE id = ?
  `).run('NORMAL', 2, 'MAIN_ACTIVE', state.id);
  db.prepare('UPDATE passengers SET passenger_count = ? WHERE elevator_id = ?').run(4, state.id);

  logEvent('SIMULATION_RESET', 'Simulation completely reset to baseline normal state.');
  res.json(state);
});

// Mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart Emergency Lift Rescue System] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
