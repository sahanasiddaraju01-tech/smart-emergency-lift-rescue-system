from datetime import datetime
from typing import Dict, Any, List

class EmergencyDecisionEngine:
    """
    Intelligent Emergency Decision Engine for Smart Elevator Rescue.
    Evaluates simulated sensor streams and enforces failsafe safety rules:
    - Verifies floor sill alignment threshold (+/- 25mm).
    - Verifies integrity of protected vestibule and staircase escape routes.
    - Prevents hazardous exit openings into open elevator shafts.
    """

    ALIGNMENT_THRESHOLD_MM = 25

    @classmethod
    def evaluate(cls, state: Dict[str, Any]) -> Dict[str, Any]:
        sensors = state.get("sensors", {})
        emergency_status = sensors.get("emergencyStatus", "NORMAL")

        if emergency_status != "ACTIVE":
            return {
                "outcome": "STANDBY",
                "reason": "Elevator operating normally. All interlocks armed.",
                "canEvacuateOppositeDoor": False,
                "routeSteps": [],
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }

        floor = state.get("currentFloor", 1)
        offset = sensors.get("alignmentOffsetMm", 0)
        is_aligned = sensors.get("floorAlignment", True) and abs(offset) <= cls.ALIGNMENT_THRESHOLD_MM
        route_status = sensors.get("escapeRouteAvailability", "AVAILABLE")
        is_route_clear = route_status == "AVAILABLE"
        power_status = sensors.get("powerStatus", "MAIN_ACTIVE")
        backup_power = sensors.get("backupPowerStatus", "AVAILABLE")
        has_adequate_power = power_status == "MAIN_ACTIVE" or backup_power in ("ACTIVE", "AVAILABLE")

        if is_aligned and is_route_clear and has_adequate_power:
            # CASE A: SAFE EXIT AVAILABLE
            return {
                "outcome": "SAFE EXIT AVAILABLE",
                "reason": (
                    f"Cabin safely aligned with Floor {floor} (sill tolerance: {offset}mm). "
                    "Opposite controlled exit unlocked. Protected access route verified clear of smoke and obstacles."
                ),
                "canEvacuateOppositeDoor": True,
                "routeSteps": [
                    f"Elevator Cabin (Floor {floor})",
                    "Controlled Emergency Exit (Rear Sealed Hatch)",
                    "Protected Access Area (Airlock Vestibule)",
                    "Fire-Rated Pressurized Staircase",
                    "Building Exit Ground Level"
                ],
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        else:
            # CASE B: SAFE EXIT NOT AVAILABLE -> RESCUE REQUIRED
            reasons: List[str] = []
            if not is_aligned:
                reasons.append(
                    f"Elevator stopped between floors (misaligned by {offset}mm). "
                    "Emergency exit sealed to prevent fall hazard into elevator shaft."
                )
            if not is_route_clear:
                reasons.append(
                    f"Secondary escape route unavailable (status: {route_status.replace('_', ' ')}). "
                    "Exit sealed to isolate cabin from outside smoke/fire ingress."
                )
            if not has_adequate_power:
                reasons.append("Main and backup electrical power systems failed.")

            return {
                "outcome": "RESCUE REQUIRED",
                "reason": " ".join(reasons) or "Safety conditions not satisfied. Rescue dispatch required.",
                "canEvacuateOppositeDoor": False,
                "routeSteps": [],
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
