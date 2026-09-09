export type ElevatorStatus = 'NORMAL' | 'WARNING' | 'EMERGENCY' | 'SAFE' | 'RESCUE REQUIRED' | 'RESOLVED';

export type MovementStatus = 'STOPPED' | 'MOVING_UP' | 'MOVING_DOWN' | 'IDLE';

export type PowerStatus = 'MAIN_ACTIVE' | 'BACKUP_ACTIVE' | 'OUTAGE';

export type EmergencyExitStatus = 'LOCKED' | 'ARMED' | 'UNLOCKED_SAFE' | 'UNAVAILABLE';

export type EscapeRouteStatus = 'AVAILABLE' | 'BLOCKED_SMOKE' | 'BLOCKED_DEBRIS' | 'HAZARD_DETECTED';

export type RescueStatus = 'STANDBY' | 'NOTIFIED' | 'ACKNOWLEDGED' | 'EN_ROUTE' | 'ON_SITE' | 'RESOLVED';

export type EmergencyType =
  | 'Power Failure'
  | 'Electrical Fault'
  | 'Door Fault'
  | 'Elevator Stopped Between Floors'
  | 'Communication Failure'
  | 'Multiple Passenger Emergency';

export interface SensorData {
  positionSensor: 'ACTIVE' | 'FAULT' | 'CALIBRATING';
  floorAlignment: boolean; // true if safely aligned within ±20mm
  alignmentOffsetMm: number; // 0mm = perfectly aligned, > 100mm = between floors
  doorStatus: 'FRONT_CLOSED' | 'FRONT_OPEN' | 'EMERGENCY_UNLOCKED' | 'BOTH_LOCKED' | 'DOOR_FAULT';
  powerStatus: PowerStatus;
  backupPowerStatus: 'AVAILABLE' | 'ACTIVE' | 'DEPLETED';
  emergencyStatus: 'NORMAL' | 'ACTIVE';
  escapeRouteAvailability: EscapeRouteStatus;
  communicationStatus: 'ACTIVE' | 'DEGRADED' | 'OFFLINE';
  passengerCount: number;
}

export interface ElevatorState {
  id: string;
  name: string;
  currentFloor: number; // 0 (Ground), 1, 2, 3, 4, 5
  targetFloor: number;
  movement: MovementStatus;
  status: ElevatorStatus;
  speedMps: number;
  sensors: SensorData;
  emergencyExitStatus: EmergencyExitStatus;
  activeEmergencyId: number | null;
  activeEmergencyType: EmergencyType | null;
  emergencyStartTime: number | null; // timestamp ms
  emergencyDecision: {
    outcome: 'SAFE EXIT AVAILABLE' | 'RESCUE REQUIRED' | 'STANDBY';
    reason: string;
    canEvacuateOppositeDoor: boolean;
    routeSteps: string[];
    timestamp: string;
  };
  rescueTeam: {
    rescue_status: RescueStatus;
    notification_time: string | null;
    notes: string;
  };
}

export interface RescueEvent {
  id: number;
  emergency_id: number;
  notification_time: string;
  rescue_status: RescueStatus;
  notes: string;
}

export interface EmergencyRecord {
  id: number;
  elevator_id: string;
  emergency_type: EmergencyType;
  detected_time: string;
  resolved_time: string | null;
  status: string;
  response_time: number | null; // in seconds
  passenger_count: number;
  exit_used: boolean;
}

export interface SystemLog {
  id: number;
  event_type: string;
  timestamp: string;
  description: string;
}

export interface PassengerMessage {
  id: string;
  sender: 'SYSTEM' | 'DISPATCHER' | 'PASSENGER';
  text: string;
  timestamp: string;
}
