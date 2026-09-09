import unittest
import time
from backend.services.decision_engine import EmergencyDecisionEngine
from backend.simulation.elevator_simulator import ElevatorSimulator

class TestSmartEmergencyLift(unittest.TestCase):
    """
    Automated test suite for Smart Emergency Lift Rescue System.
    Validates safety invariant rules and the Emergency Decision Engine.
    """

    def setUp(self):
        self.simulator = ElevatorSimulator(elevator_id="TEST-LIFT-01")

    def test_01_emergency_detection(self):
        """Test that triggering an emergency transitions the state to ACTIVE."""
        self.assertEqual(self.simulator.sensors["emergencyStatus"], "NORMAL")
        self.simulator.start_emergency("Power Failure", floor_aligned=True, escape_route_clear=True)
        self.assertEqual(self.simulator.sensors["emergencyStatus"], "ACTIVE")
        self.assertEqual(self.simulator.active_emergency_type, "Power Failure")
        self.assertIsNotNone(self.simulator.emergency_start_time)

    def test_02_floor_alignment_decision_safe(self):
        """Test CASE A: Aligned cabin with clear escape route unlocks emergency exit."""
        self.simulator.start_emergency("Power Failure", floor_aligned=True, escape_route_clear=True)
        decision = self.simulator.emergency_decision
        self.assertEqual(decision["outcome"], "SAFE EXIT AVAILABLE")
        self.assertTrue(decision["canEvacuateOppositeDoor"])
        self.assertEqual(self.simulator.emergency_exit_status, "UNLOCKED_SAFE")
        self.assertEqual(self.simulator.status, "SAFE")
        self.assertTrue(len(decision["routeSteps"]) >= 4)

    def test_03_floor_alignment_decision_between_floors(self):
        """Test CASE B: Misaligned cabin (stopped between floors) keeps exit locked."""
        # Stopped 450mm above floor sill
        self.simulator.start_emergency("Elevator Stopped Between Floors", floor_aligned=False, alignment_offset=450)
        decision = self.simulator.emergency_decision
        self.assertEqual(decision["outcome"], "RESCUE REQUIRED")
        self.assertFalse(decision["canEvacuateOppositeDoor"])
        self.assertEqual(self.simulator.emergency_exit_status, "LOCKED")
        self.assertEqual(self.simulator.status, "RESCUE REQUIRED")
        self.assertIn("misaligned", decision["reason"].lower())

    def test_04_escape_route_availability_blocked(self):
        """Test CASE B: Even if floor is aligned, blocked escape route locks emergency exit."""
        self.simulator.start_emergency("Electrical Fault", floor_aligned=True, escape_route_clear=False)
        decision = self.simulator.emergency_decision
        self.assertEqual(decision["outcome"], "RESCUE REQUIRED")
        self.assertFalse(decision["canEvacuateOppositeDoor"])
        self.assertEqual(self.simulator.emergency_exit_status, "LOCKED")
        self.assertIn("unavailable", decision["reason"].lower())

    def test_05_rescue_notification(self):
        """Test rescue team automatic dispatch when exit is unavailable."""
        self.simulator.start_emergency("Door Fault", floor_aligned=False)
        self.assertEqual(self.simulator.rescue_team["rescue_status"], "NOTIFIED")
        self.assertIsNotNone(self.simulator.rescue_team["notification_time"])

    def test_06_emergency_resolution_and_response_time(self):
        """Test clearing emergency, calculating duration, and returning to safe baseline."""
        self.simulator.start_emergency("Power Failure", floor_aligned=True, escape_route_clear=True)
        time.sleep(0.05) # Tiny pause to measure response time
        duration = self.simulator.clear_emergency()
        self.assertGreaterEqual(duration, 0.0)
        self.assertEqual(self.simulator.sensors["emergencyStatus"], "NORMAL")
        self.assertEqual(self.simulator.status, "RESOLVED")
        self.assertEqual(self.simulator.emergency_exit_status, "LOCKED")
        self.assertEqual(self.simulator.rescue_team["rescue_status"], "RESOLVED")

if __name__ == "__main__":
    unittest.main()
