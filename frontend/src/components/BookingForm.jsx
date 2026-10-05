import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BookingForm({
  flight,
  onSubmit,
  onCancel,
  loading,
  error,
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const submit = () => {
    if (name.trim().length < 2 || !age) return;
    onSubmit(flight.id, name.trim(), Number(age));
  };

  return (
    <div className="space-y-3 rounded-2xl border border-sky-100 bg-white p-5 shadow-md animate-fade-in">
      <div className="text-sm font-bold text-slate-700">
        ✈️ {flight.flight_no}: {flight.origin} → {flight.destination} ·{" "}
        <span className="text-emerald-600">₹{flight.price}</span>
      </div>
      <Input
        placeholder="Passenger name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="Age"
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />
      {error && (
        <div className="text-sm font-semibold text-red-500">{error}</div>
      )}
      <div className="flex gap-2">
        <Button
          onClick={submit}
          disabled={loading}
          className="rounded-full bg-emerald-500 text-white transition active:scale-95 hover:bg-emerald-600"
        >
          {loading ? "Booking..." : "Confirm booking"}
        </Button>
        <Button variant="outline" className="rounded-full" onClick={onCancel}>
          Back
        </Button>
      </div>
    </div>
  );
}
