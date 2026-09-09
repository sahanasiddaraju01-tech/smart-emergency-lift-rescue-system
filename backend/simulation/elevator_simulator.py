import time
from datetime import datetime
from typing import Dict, Any
from backend.services.decision_engine import EmergencyDecisionEngine

class ElevatorSimulator:
    def __init__(self, elevator_id="LIFT-ALPHA-01", name="Core Shaft Alpha (Tower 1)"):
        self.id = elevator_id
        self.name = name
        self.current_floor = 2
        self.target_floor = 2
        self.movement = "STOPPED"
        self.status = "NORMAL"
        self.speed_mps = 0.0

        self.sensors = {
            "positionSensor": "ACTIVE",
            "floorAlignment": True,
            "alignmentOffsetMm": 0,
            "doorStatus": "FRONT_CLOSED",
            "powerStatus": "MAIN_ACTIVE",
            "backupPowerStatus": "AVAILABLE",
            "emergencyStatus": "NORMAL",
            "escapeRouteAvailability": "AVAILABLE",
            "communicationStatus": "ACTIVE",
            "passengerCount": 4,
        }

        self.emergency_exit_status = "LOCKED"
        self.active_emergency_id = None
        self.active_emergency_type = None
        self.emergency_start_time = None

        self.rescue_team = {
            "rescue_status": "STANDBY",
            "notification_time": None,
            "notes": "Rescue squad monitoring telemetry.",
        }

        self.emergency_decision = {
            "outcome": "STANDBY",
            "reason": "Elevator operating normally.",
            "canEvacuateOppositeDoor": False,
            "routeSteps": [],
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }

        self.emergency_decision = EmergencyDecisionEngine.evaluate(self.to_dict())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "currentFloor": self.current_floor,
            "targetFloor": self.target_floor,
            "movement": self.movement,
            "status": self.status,
            "speedMps": self.speed_mps,
            "sensors": self.sensors,
            "emergencyExitStatus": self.emergency_exit_status,
            "activeEmergencyId": self.active_emergency_id,
            "activeEmergencyType": self.active_emergency_type,
            "emergencyStartTime": self.emergency_start_time,
            "emergencyDecision": self.emergency_decision,
            "rescueTeam": self.rescue_team,
        }

    def re_evaluate(self):
        decision = EmergencyDecisionEngine.evaluate(self.to_dict())
        self.emergency_decision = decision
        if self.sensors["emergencyStatus"] == "ACTIVE":
            if decision["outcome"] == "SAFE EXIT AVAILABLE":
                self.status = "SAFE"
                self.emergency_exit_status = "UNLOCKED_SAFE"
                self.sensors["doorStatus"] = "EMERGENCY_UNLOCKED"
            else:
                self.status = "RESCUE REQUIRED"
                self.emergency_exit_status = "LOCKED"
                self.sensors["doorStatus"] = "BOTH_LOCKED"
                if self.rescue_team["rescue_status"] == "STANDBY":
                    self.rescue_team["rescue_status"] = "NOTIFIED"
                    self.rescue_team["notification_time"] = datetime.utcnow().isoformat() + "Z"
                    self.rescue_team["notes"] = f"Automatic dispatch: {self.active_emergency_type}. Exit unavailable."
        else:
            if self.status != "RESOLVED":
                self.status = "NORMAL"
            self.emergency_exit_status = "LOCKED"

    def start_emergency(self, emergency_type: str, floor_aligned: bool = True, escape_route_clear: bool = True, passenger_count: int = 4, alignment_offset: int = 0):
        self.active_emergency_type = emergency_type
        self.sensors["emergencyStatus"] = "ACTIVE"
        self.emergency_start_time = time.time()
        self.sensors["floorAlignment"] = floor_aligned
        self.sensors["alignmentOffsetMm"] = 0 if floor_aligned else (alignment_offset or 450)
        self.sensors["escapeRouteAvailability"] = "AVAILABLE" if escape_route_clear else "BLOCKED_SMOKE"
        self.sensors["passengerCount"] = passenger_count

        if emergency_type == "Power Failure":
            self.sensors["powerStatus"] = "OUTAGE"
            self.sensors["backupPowerStatus"] = "ACTIVE"
        elif emergency_type == "Electrical Fault":
            self.sensors["powerStatus"] = "OUTAGE"
            self.sensors["backupPowerStatus"] = "DEPLETED"
        elif emergency_type == "Communication Failure":
            self.sensors["communicationStatus"] = "OFFLINE"
        elif emergency_type == "Door Fault":
            self.sensors["doorStatus"] = "DOOR_FAULT"

        self.re_evaluate()

    def clear_emergency(self):
        duration = 0
        if self.emergency_start_time:
            duration = round(time.time() - self.emergency_start_time, 1)

        self.sensors["emergencyStatus"] = "NORMAL"
        self.sensors["powerStatus"] = "MAIN_ACTIVE"
        self.sensors["backupPowerStatus"] = "AVAILABLE"
        self.sensors["communicationStatus"] = "ACTIVE"
        self.sensors["doorStatus"] = "FRONT_CLOSED"
        self.sensors["escapeRouteAvailability"] = "AVAILABLE"
        self.sensors["floorAlignment"] = True
        self.sensors["alignmentOffsetMm"] = 0
        self.emergency_exit_status = "LOCKED"
        self.status = "RESOLVED"
        self.rescue_team["rescue_status"] = "RESOLVED"
        self.rescue_team["notes"] = "System restored. Post-emergency inspection complete."

        self.active_emergency_id = None
        self.active_emergency_type = None
        self.emergency_start_time = None
        self.re_evaluate()
        return duration
