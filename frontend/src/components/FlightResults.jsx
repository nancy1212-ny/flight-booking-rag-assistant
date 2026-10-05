import { useState } from "react";
import FlightCard from "./FlightCard";
import BookingForm from "./BookingForm";
import TicketCard from "./TicketCard";
import { bookFlight } from "@/lib/booking-api";

export default function FlightResults({ flights, onBooked }) {
  const [selected, setSelected] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (id, name, age) => {
    setLoading(true);
    setError("");
    try {
      const b = await bookFlight(id, name, age);
      setTicket(b);
      setSelected(null);
      onBooked?.(b);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (ticket) return <TicketCard booking={ticket} />;

  if (selected)
    return (
      <BookingForm
        flight={selected}
        onSubmit={submit}
        onCancel={() => setSelected(null)}
        loading={loading}
        error={error}
      />
    );

  return (
    <div className="space-y-2">
      {flights.map((f) => (
        <FlightCard key={f.id} flight={f} onBook={setSelected} />
      ))}
    </div>
  );
}
