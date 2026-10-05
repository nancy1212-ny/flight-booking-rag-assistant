import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBookings, cancelBooking, getRefund } from "@/lib/booking-api";

export default function BookingsPanel({ refreshKey }) {
  const [items, setItems] = useState([]);
  const [estimates, setEstimates] = useState({}); // pnr -> estimate
  const [busy, setBusy] = useState(null);

  const load = () =>
    getBookings()
      .then(setItems)
      .catch(() => {});

  useEffect(() => {
    load();
  }, [refreshKey]);

  const estimate = async (pnr) => {
    setBusy(pnr);
    try {
      const r = await getRefund(pnr);
      setEstimates((e) => ({ ...e, [pnr]: r }));
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  };

  const dismiss = (pnr) =>
    setEstimates((e) => {
      const { [pnr]: _, ...rest } = e;
      return rest;
    });

  const confirmCancel = async (pnr) => {
    setBusy(pnr);
    await cancelBooking(pnr).catch(() => {});
    dismiss(pnr);
    setBusy(null);
    load();
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
        🎫 My Bookings
      </div>
      {items.length === 0 && (
        <div className="text-sm font-semibold text-slate-400">
          No bookings yet
        </div>
      )}

      {items.map((b) => {
        const est = estimates[b.pnr];
        return (
          <div
            key={b.pnr}
            className="rounded-2xl border border-sky-100 bg-white p-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-extrabold tracking-wider text-primary">
                {b.pnr}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${
                  b.status === "CANCELLED" ? "bg-red-400" : "bg-emerald-500"
                }`}
              >
                {b.status}
              </span>
            </div>
            <div className="mt-1 font-bold text-slate-700">
              {b.origin} → {b.destination} · {b.depart_time.slice(0, 10)}
            </div>
            <div className="text-xs font-semibold text-slate-500">
              {b.passenger_name} · Seat {b.seat} · ₹{b.price}
            </div>

            {b.status === "CONFIRMED" && !est && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2 rounded-full"
                disabled={busy === b.pnr}
                onClick={() => estimate(b.pnr)}
              >
                {busy === b.pnr ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  "💸 Estimate refund"
                )}
              </Button>
            )}

            {est && (
              <div className="mt-2 space-y-2 rounded-xl bg-sky-50 p-3 animate-fade-in">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                      You get back
                    </div>
                    <div
                      className={`text-2xl font-extrabold ${est.refund > 0 ? "text-emerald-600" : "text-red-500"}`}
                    >
                      ₹{est.refund}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-extrabold text-white ${
                      est.percent >= 75
                        ? "bg-emerald-500"
                        : est.percent > 0
                          ? "bg-amber-500"
                          : "bg-red-400"
                    }`}
                  >
                    {est.percent}%
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  Cancellation charge: ₹{est.charge} of ₹{est.price}
                  {est.hours_left !== null && est.hours_left > 0 && (
                    <> · {est.hours_left} h before departure</>
                  )}
                </div>
                <div className="text-[11px] leading-snug text-slate-500">
                  {est.rule}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="rounded-full bg-red-500 text-white hover:bg-red-600"
                    disabled={busy === b.pnr}
                    onClick={() => confirmCancel(b.pnr)}
                  >
                    {busy === b.pnr ? "Cancelling…" : "Confirm cancel"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => dismiss(b.pnr)}
                  >
                    Keep booking
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
