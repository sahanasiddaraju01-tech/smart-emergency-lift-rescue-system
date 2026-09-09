import sqlite3
import os

DB_PATH = os.environ.get("DB_PATH", os.path.join(os.getcwd(), "emergency_lift.db"))

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript("""
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
    """)

    cursor.execute("SELECT id FROM elevators WHERE id = ?", ("LIFT-ALPHA-01",))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO elevators (id, elevator_name, current_floor, status, power_status)
            VALUES (?, ?, ?, ?, ?)
        """, ("LIFT-ALPHA-01", "Core Shaft Alpha (Tower 1)", 2, "NORMAL", "MAIN_ACTIVE"))

        cursor.execute("""
            INSERT INTO passengers (elevator_id, passenger_count)
            VALUES (?, ?)
        """, ("LIFT-ALPHA-01", 4))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
