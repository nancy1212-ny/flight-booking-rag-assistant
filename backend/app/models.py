from pydantic import BaseModel, Field


class BookRequest(BaseModel):
    flight_id: int
    name: str = Field(min_length=2, max_length=60)
    age: int = Field(ge=0, le=120)


class Flight(BaseModel):
    id: int
    flight_no: str
    airline: str
    origin: str
    destination: str
    depart_time: str
    arrive_time: str
    price: int
    seats_left: int


class Booking(BaseModel):
    pnr: str
    flight_id: int
    passenger_name: str
    age: int
    seat: str
    status: str
    created_at: str
    flight_no: str | None = None
    airline: str | None = None
    origin: str | None = None
    destination: str | None = None
    depart_time: str | None = None
    price: int | None = None