from typing import Optional, List
from pydantic import BaseModel

class SensorDataModel(BaseModel):
    positionSensor: str = "ACTIVE"
    floorAlignment: bool = True
    alignmentOffsetMm: int = 0
    doorStatus: str = "FRONT_CLOSED"
    powerStatus: str = "MAIN_ACTIVE"
    backupPowerStatus: str = "AVAILABLE"
    emergencyStatus: str = "NORMAL"
    escapeRouteAvailability: str = "AVAILABLE"
    communicationStatus: str = "ACTIVE"
    passengerCount: int = 4

class EmergencyDecisionModel(BaseModel):
    outcome: str
    reason: str
    canEvacuateOppositeDoor: bool
    routeSteps: List[str]
    timestamp: str

class StartEmergencyRequest(BaseModel):
    emergency_type: str
    floor_aligned: Optional[bool] = True
    escape_route_clear: Optional[bool] = True
    passenger_count: Optional[int] = 4
    alignment_offset: Optional[int] = 0

class MoveElevatorRequest(BaseModel):
    target_floor: int
    stop_between: Optional[bool] = False

class SensorOverrideRequest(BaseModel):
    floorAlignment: Optional[bool] = None
    alignmentOffsetMm: Optional[int] = None
    escapeRouteAvailability: Optional[str] = None
    powerStatus: Optional[str] = None
    backupPowerStatus: Optional[str] = None
    passengerCount: Optional[int] = None
    doorStatus: Optional[str] = None

class RescueActionRequest(BaseModel):
    action: str
    notes: Optional[str] = None
