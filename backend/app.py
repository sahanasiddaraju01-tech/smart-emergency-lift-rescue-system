from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import time

from backend.database.database import get_db_connection, init_db
from backend.models.models import (
    StartEmergencyRequest,
    MoveElevatorRequest,
    SensorOverrideRequest,
    RescueActionRequest,
)
from backend.simulation.elevator_simulator import ElevatorSimulator

init_db()

app = FastAPI(
    title="Smart Emergency Lift Rescue System - API",
    description="Software simulation prototype of intelligent elevator emergency response and dual-door escape safety.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

simulator = ElevatorSimulator()

@app.get("/api/elevator/status")
def get_elevator_status():
    return simulator.to_dict()

@app.post("/api/emergency/start")
def start_emergency(req: StartEmergencyRequest):
    simulator.start_emergency(
        emergency_type=req.emergency_type,
        floor_aligned=req.floor_aligned if req.floor_aligned is not None else True,
        escape_route_clear=req.escape_route_clear if req.escape_route_clear is not None else True,
        passenger_count=req.passenger_count or 4,
        alignment_offset=req.alignment_offset or 0
    )

    # Persist to database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO emergencies (elevator_id, emergency_type, detected_time, status, passenger_count, exit_used)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        simulator.id,
        simulator.active_emergency_type,
        datetime.utcnow().isoformat() + "Z",
        "ACTIVE",
        simulator.sensors["passengerCount"],
        1 if simulator.emergency_decision["canEvacuateOppositeDoor"] else 0
    ))
    emergency_id = cursor.lastrowid
    simulator.active_emergency_id = emergency_id

    cursor.execute("""
        INSERT INTO system_logs (event_type, timestamp, description)
        VALUES (?, ?, ?)
    """, (
        "EMERGENCY_TRIGGERED",
        datetime.utcnow().isoformat() + "Z",
        f"Simulated emergency '{req.emergency_type}' initiated. Decision: {simulator.emergency_decision['outcome']}."
    ))

    conn.commit()
    conn.close()

    return simulator.to_dict()

@app.post("/api/emergency/clear")
def clear_emergency():
    duration = simulator.clear_emergency()
    conn = get_db_connection()
    cursor = conn.cursor()

    if simulator.active_emergency_id:
        cursor.execute("""
            UPDATE emergencies
            SET resolved_time = ?, status = 'RESOLVED', response_time = ?
            WHERE id = ?
        """, (datetime.utcnow().isoformat() + "Z", duration, simulator.active_emergency_id))

    cursor.execute("""
        INSERT INTO system_logs (event_type, timestamp, description)
        VALUES (?, ?, ?)
    """, (
        "EMERGENCY_RESOLVED",
        datetime.utcnow().isoformat() + "Z",
        f"Emergency cleared. Duration: {duration}s."
    ))

    conn.commit()
    conn.close()

    return simulator.to_dict()

@app.post("/api/simulation/move")
def move_elevator(req: MoveElevatorRequest):
    if req.target_floor < 0 or req.target_floor > 5:
        raise HTTPException(status_code=400, detail="Invalid target floor (must be 0 to 5)")

    simulator.target_floor = req.target_floor
    simulator.current_floor = req.target_floor
    if req.stop_between:
        simulator.sensors["floorAlignment"] = False
        simulator.sensors["alignmentOffsetMm"] = 520
        simulator.status = "WARNING"
    else:
        simulator.sensors["floorAlignment"] = True
        simulator.sensors["alignmentOffsetMm"] = 0

    simulator.re_evaluate()
    return simulator.to_dict()

@app.post("/api/simulation/sensors")
def override_sensors(req: SensorOverrideRequest):
    if req.floorAlignment is not None:
        simulator.sensors["floorAlignment"] = req.floorAlignment
        simulator.sensors["alignmentOffsetMm"] = 0 if req.floorAlignment else (req.alignmentOffsetMm or 450)
    if req.alignmentOffsetMm is not None:
        simulator.sensors["alignmentOffsetMm"] = req.alignmentOffsetMm
        simulator.sensors["floorAlignment"] = abs(req.alignmentOffsetMm) <= 25
    if req.escapeRouteAvailability:
        simulator.sensors["escapeRouteAvailability"] = req.escapeRouteAvailability
    if req.powerStatus:
        simulator.sensors["powerStatus"] = req.powerStatus
    if req.backupPowerStatus:
        simulator.sensors["backupPowerStatus"] = req.backupPowerStatus
    if req.passengerCount is not None:
        simulator.sensors["passengerCount"] = req.passengerCount

    simulator.re_evaluate()
    return simulator.to_dict()

@app.get("/api/rescue/status")
def get_rescue_status():
    return {
        "emergencyId": simulator.active_emergency_id,
        "elevatorId": simulator.id,
        "currentFloor": simulator.current_floor,
        "alignmentOffsetMm": simulator.sensors["alignmentOffsetMm"],
        "emergencyType": simulator.active_emergency_type,
        "passengerCount": simulator.sensors["passengerCount"],
        "timeSinceEmergencyMs": (time.time() - simulator.emergency_start_time) * 1000 if simulator.emergency_start_time else 0,
        "communicationStatus": simulator.sensors["communicationStatus"],
        "rescueStatus": simulator.rescue_team["rescue_status"],
        "notes": simulator.rescue_team["notes"],
        "decision": simulator.emergency_decision,
    }

@app.post("/api/rescue/notify")
def notify_rescue():
    simulator.rescue_team["rescue_status"] = "NOTIFIED"
    simulator.rescue_team["notification_time"] = datetime.utcnow().isoformat() + "Z"
    simulator.rescue_team["notes"] = f"Manual notification dispatched for {simulator.id}."
    return simulator.rescue_team

@app.post("/api/rescue/action")
def rescue_action(req: RescueActionRequest):
    if req.action == "ACKNOWLEDGE":
        simulator.rescue_team["rescue_status"] = "ACKNOWLEDGED"
    elif req.action == "START_RESCUE":
        simulator.rescue_team["rescue_status"] = "EN_ROUTE"
    elif req.action == "MARK_RESOLVED":
        simulator.rescue_team["rescue_status"] = "RESOLVED"
    if req.notes:
        simulator.rescue_team["notes"] = req.notes
    return simulator.rescue_team

@app.get("/api/logs")
def get_logs():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM system_logs ORDER BY id DESC LIMIT 50")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

@app.get("/api/emergencies")
def get_emergencies():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM emergencies ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

@app.get("/api/analytics")
def get_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM emergencies")
    total = cursor.fetchone()["count"]
    cursor.execute("SELECT COUNT(*) as count FROM emergencies WHERE status = 'RESOLVED'")
    resolved = cursor.fetchone()["count"]
    cursor.execute("SELECT AVG(response_time) as avg_resp FROM emergencies WHERE response_time IS NOT NULL")
    avg_resp = cursor.fetchone()["avg_resp"] or 65.4
    cursor.execute("SELECT COUNT(*) as count FROM emergencies WHERE exit_used = 1")
    safe_exit_count = cursor.fetchone()["count"]

    cursor.execute("SELECT emergency_type, COUNT(*) as count FROM emergencies GROUP BY emergency_type")
    by_type = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return {
        "totalEmergencies": total,
        "resolvedEmergencies": resolved,
        "safeExitCount": safe_exit_count,
        "rescueRequiredCount": total - safe_exit_count,
        "averageResponseTimeSec": round(avg_resp, 1),
        "byType": by_type,
    }
