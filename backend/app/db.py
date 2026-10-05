import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "booking.db"


def get_conn():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # rows behave like dicts
    return conn


def init_db():
    with get_conn() as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS flights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            flight_no TEXT NOT NULL,
            airline TEXT NOT NULL,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            depart_time TEXT NOT NULL,   -- e.g. 2026-10-10T06:30
            arrive_time TEXT NOT NULL,
            price INTEGER NOT NULL,
            seats_left INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS bookings (
            pnr TEXT PRIMARY KEY,
            flight_id INTEGER NOT NULL,
            passenger_name TEXT NOT NULL,
            age INTEGER NOT NULL,
            seat TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'CONFIRMED',
            created_at TEXT NOT NULL,
            FOREIGN KEY (flight_id) REFERENCES flights(id)
        );
        """)