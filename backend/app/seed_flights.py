import random
from datetime import datetime, timedelta

from .db import get_conn, init_db

AIRPORTS = ["MAA", "DEL", "BLR", "BOM", "HYD", "CCJ", "IXM"]  # IXM = Madurai
AIRLINES = [("IndiGo", "6E"), ("Air India", "AI"), ("SpiceJet", "SG"), ("Akasa Air", "QP")]
DAYS = 14


def seed():
    init_db()
    random.seed(42)
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    with get_conn() as conn:
        conn.execute("DELETE FROM bookings")
        conn.execute("DELETE FROM flights")

        for origin in AIRPORTS:
            for dest in AIRPORTS:
                if origin == dest:
                    continue
                base_price = random.randint(2500, 7500)
                duration = random.choice([60, 75, 90, 120, 150, 165])

                for d in range(DAYS):
                    day = today + timedelta(days=d)
                    for _ in range(random.randint(2, 3)):
                        airline, code = random.choice(AIRLINES)
                        depart = day + timedelta(hours=random.randint(5, 22), minutes=random.choice([0, 15, 30, 45]))
                        arrive = depart + timedelta(minutes=duration)
                        price = int(base_price * random.uniform(0.85, 1.4) / 50) * 50
                        conn.execute(
                            """INSERT INTO flights
                               (flight_no, airline, origin, destination, depart_time, arrive_time, price, seats_left)
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                            (
                                f"{code}{random.randint(100, 999)}",
                                airline,
                                origin,
                                dest,
                                depart.strftime("%Y-%m-%dT%H:%M"),
                                arrive.strftime("%Y-%m-%dT%H:%M"),
                                price,
                                random.randint(5, 60),
                            ),
                        )

        count = conn.execute("SELECT COUNT(*) FROM flights").fetchone()[0]
    print(f"Seeded {count} flights")


if __name__ == "__main__":
    seed()