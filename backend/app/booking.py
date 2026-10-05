import random
import string
from datetime import datetime, timedelta

from .db import get_conn


def search_flights(origin: str, destination: str, date: str, max_price: int | None = None):
    """date format: YYYY-MM-DD"""
    query = """
        SELECT * FROM flights
        WHERE origin = ? AND destination = ?
          AND substr(depart_time, 1, 10) = ?
          AND seats_left > 0
    """
    params = [origin.upper(), destination.upper(), date]
    if max_price is not None:
        query += " AND price <= ?"
        params.append(max_price)
    query += " ORDER BY depart_time"

    with get_conn() as conn:
        rows = conn.execute(query, params).fetchall()
    return [dict(r) for r in rows]


def _new_pnr(conn):
    while True:
        pnr = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if not conn.execute("SELECT 1 FROM bookings WHERE pnr = ?", (pnr,)).fetchone():
            return pnr


def _pick_seat(conn, flight_id):
    taken = {
        r["seat"]
        for r in conn.execute(
            "SELECT seat FROM bookings WHERE flight_id = ? AND status = 'CONFIRMED'",
            (flight_id,),
        )
    }
    free = [f"{row}{col}" for row in range(1, 31) for col in "ABCDEF" if f"{row}{col}" not in taken]
    return random.choice(free)


def create_booking(flight_id: int, name: str, age: int):
    """Returns the booking dict, or None if flight missing / sold out."""
    with get_conn() as conn:
        flight = conn.execute("SELECT * FROM flights WHERE id = ?", (flight_id,)).fetchone()
        if not flight or flight["seats_left"] <= 0:
            return None

        pnr = _new_pnr(conn)
        seat = _pick_seat(conn, flight_id)
        conn.execute(
            """INSERT INTO bookings (pnr, flight_id, passenger_name, age, seat, status, created_at)
               VALUES (?, ?, ?, ?, ?, 'CONFIRMED', ?)""",
            (pnr, flight_id, name, age, seat, datetime.now().isoformat(timespec="seconds")),
        )
        conn.execute("UPDATE flights SET seats_left = seats_left - 1 WHERE id = ?", (flight_id,))

    return get_booking(pnr)


def get_booking(pnr: str):
    with get_conn() as conn:
        row = conn.execute(
            """SELECT b.*, f.flight_no, f.airline, f.origin, f.destination,
                      f.depart_time, f.arrive_time, f.price
               FROM bookings b JOIN flights f ON f.id = b.flight_id
               WHERE b.pnr = ?""",
            (pnr.upper(),),
        ).fetchone()
    return dict(row) if row else None


def list_bookings():
    with get_conn() as conn:
        rows = conn.execute(
            """SELECT b.*, f.flight_no, f.airline, f.origin, f.destination,
                      f.depart_time, f.arrive_time, f.price
               FROM bookings b JOIN flights f ON f.id = b.flight_id
               ORDER BY b.created_at DESC"""
        ).fetchall()
    return [dict(r) for r in rows]


def cancel_booking(pnr: str):
    """Returns the updated booking, or None if not found / already cancelled."""
    pnr = pnr.upper()
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM bookings WHERE pnr = ?", (pnr,)).fetchone()
        if not row or row["status"] == "CANCELLED":
            return None
        conn.execute("UPDATE bookings SET status = 'CANCELLED' WHERE pnr = ?", (pnr,))
        conn.execute("UPDATE flights SET seats_left = seats_left + 1 WHERE id = ?", (row["flight_id"],))
    return get_booking(pnr)


def refund_estimate(pnr: str):
    """Refund per the SkyWing policy (page 2). Returns None if the PNR doesn't exist."""
    b = get_booking(pnr)
    if not b:
        return None

    base = {"pnr": b["pnr"], "price": b["price"], "status": b["status"]}
    if b["status"] == "CANCELLED":
        return {**base, "eligible": False, "percent": 0, "refund": 0, "charge": 0,
                "hours_left": None, "rule": "This booking is already cancelled."}

    now = datetime.now()
    depart = datetime.fromisoformat(b["depart_time"])
    booked = datetime.fromisoformat(b["created_at"])
    hours_left = (depart - now).total_seconds() / 3600

    if hours_left <= 0:
        percent, rule = 0, "The flight has already departed, so no refund applies."
    elif now - booked <= timedelta(hours=24) and depart - booked >= timedelta(days=7):
        percent, rule = 100, "Free cancellation window: cancelled within 24 hours of booking, and the flight is 7+ days away (policy section 7)."
    elif hours_left > 72:
        percent, rule = 90, "More than 72 hours before departure: 10% cancellation charge (policy section 6)."
    elif hours_left >= 24:
        percent, rule = 75, "24 to 72 hours before departure: 25% cancellation charge (policy section 6)."
    elif hours_left >= 4:
        percent, rule = 50, "4 to 24 hours before departure: 50% cancellation charge (policy section 6)."
    else:
        percent, rule = 0, "Less than 4 hours before departure: no refund (policy section 6)."

    refund = round(b["price"] * percent / 100)
    return {**base, "eligible": True, "percent": percent, "refund": refund,
            "charge": b["price"] - refund, "hours_left": round(hours_left, 1), "rule": rule}