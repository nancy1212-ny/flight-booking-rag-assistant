import { Plane } from "lucide-react";

export default function TicketCard({ booking }) {
  const cancelled = booking.status === "CANCELLED";
  return (
    <div className="overflow-hidden rounded-3xl border border-sky-200 bg-white shadow-lg shadow-sky-200/60 animate-message-in">
      <div
        className="flex items-center justify-between px-5 py-3 text-sm font-bold text-white"
        style={{ background: "linear-gradient(90deg, #2f80ed, #38bdf8)" }}
      >
        <span>
          {booking.airline} · {booking.flight_no}
        </span>
        <span
          className={`rounded-full px-3 py-0.5 text-xs ${cancelled ? "bg-red-500" : "bg-emerald-500"}`}
        >
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-3 items-center gap-4 p-5">
        <div>
          <div className="text-xs font-semibold text-slate-400">FROM</div>
          <div className="text-3xl font-extrabold text-slate-800">
            {booking.origin}
          </div>
        </div>
        <div className="flex items-center justify-center text-primary">
          <div className="h-px flex-1 border-t-2 border-dashed border-sky-300" />
          <Plane className="mx-2 size-7 plane-bob" />
          <div className="h-px flex-1 border-t-2 border-dashed border-sky-300" />
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-400">TO</div>
          <div className="text-3xl font-extrabold text-slate-800">
            {booking.destination}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-400">PASSENGER</div>
          <div className="font-bold text-slate-700">
            {booking.passenger_name}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-semibold text-slate-400">DEPARTS</div>
          <div className="font-bold text-slate-700">
            {booking.depart_time.replace("T", " ")}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-400">SEAT</div>
          <div className="font-bold text-emerald-600">{booking.seat}</div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t-2 border-dashed border-sky-200 bg-sky-50 px-5 py-3">
        <div className="text-sm font-semibold text-slate-500">
          PNR{" "}
          <span className="ml-2 font-mono text-xl font-extrabold tracking-widest text-primary">
            {booking.pnr}
          </span>
        </div>
        <div className="flex h-8 items-end gap-[2px]" aria-hidden="true">
          {[6, 14, 9, 18, 7, 16, 11, 20, 8, 15, 10, 17, 6, 13].map((h, i) => (
            <div
              key={i}
              className="w-[3px] rounded bg-slate-700"
              style={{ height: h + 8 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
