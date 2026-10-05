import { Plane } from "lucide-react";
import { Button } from "@/components/ui/button";

const time = (t) => t.slice(11, 16);
const day = (t) => t.slice(0, 10);
const duration = (a, b) => {
  const m = Math.round((new Date(b) - new Date(a)) / 60000);
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
};

export default function FlightCard({ flight, onBook }) {
  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-sky-200/70 sm:flex-row sm:items-center">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sm font-extrabold text-primary">
        {flight.flight_no.slice(0, 2)}
      </div>

      <div className="flex-1">
        <div className="text-xs font-semibold text-slate-500">
          {flight.airline} · {flight.flight_no} · {day(flight.depart_time)}
        </div>
        <div className="mt-1 flex items-center gap-3">
          <div className="text-center">
            <div className="text-xl font-extrabold text-slate-800">
              {time(flight.depart_time)}
            </div>
            <div className="text-xs font-bold text-primary">
              {flight.origin}
            </div>
          </div>
          <div className="flex flex-1 flex-col items-center">
            <div className="text-[10px] font-semibold text-slate-400">
              {duration(flight.depart_time, flight.arrive_time)}
            </div>
            <div className="relative flex w-full items-center">
              <div className="h-px flex-1 border-t-2 border-dashed border-sky-200" />
              <Plane className="mx-1 size-4 text-primary transition-transform duration-500 group-hover:translate-x-3" />
              <div className="h-px flex-1 border-t-2 border-dashed border-sky-200" />
            </div>
            <div className="text-[10px] font-semibold text-emerald-600">
              {flight.seats_left} seats left
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-extrabold text-slate-800">
              {time(flight.arrive_time)}
            </div>
            <div className="text-xs font-bold text-primary">
              {flight.destination}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <div className="text-2xl font-extrabold text-emerald-600">
          ₹{flight.price}
        </div>
        <Button
          size="sm"
          className="rounded-full bg-emerald-500 px-5 text-white transition active:scale-95 hover:bg-emerald-600"
          onClick={() => onBook(flight)}
        >
          Book
        </Button>
      </div>
    </div>
  );
}
