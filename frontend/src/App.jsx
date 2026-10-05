import { useEffect, useState } from "react";
import { Plane, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Chat from "@/components/Chat";
import PolicyPanel from "@/components/PolicyPanel";
import BookingsPanel from "@/components/BookingsPanel";
import { getHealth } from "@/lib/api";

function SkyClouds() {
  const cloud = (
    <svg viewBox="0 0 120 60" aria-hidden="true">
      <g fill="#ffffff">
        <circle cx="35" cy="35" r="20" />
        <circle cx="60" cy="25" r="25" />
        <circle cx="88" cy="36" r="18" />
        <rect x="30" y="35" width="62" height="20" rx="10" />
      </g>
    </svg>
  );
  const items = [
    { top: "6%", w: 110, o: 0.7, d: "60s", delay: "-10s" },
    { top: "38%", w: 150, o: 0.5, d: "85s", delay: "-40s" },
    { top: "70%", w: 90, o: 0.6, d: "70s", delay: "-25s" },
  ];
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {items.map((c, i) => (
        <div
          key={i}
          className="cloud-drift absolute left-0"
          style={{
            top: c.top,
            width: c.w,
            opacity: c.o,
            animationDuration: c.d,
            animationDelay: c.delay,
          }}
        >
          {cloud}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [doc, setDoc] = useState(null);
  const [health, setHealth] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [incoming, setIncoming] = useState(null); // question sent from the sidebar

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setHealth(false));
  }, []);

  const ask = (text) => setIncoming({ text, id: Date.now() });

  return (
    <div className="grid h-screen grid-cols-1 md:grid-cols-[320px_1fr]">
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col gap-5 overflow-y-auto p-5"
        style={{
          background:
            "linear-gradient(180deg, #7dd3fc 0%, #bae6fd 40%, #e0f2fe 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white shadow-md">
            <Plane className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold leading-tight text-slate-800">
              Flight Booking AI
            </h1>
            <p className="text-xs font-semibold text-slate-600">
              Search, book & ask about policies
            </p>
          </div>
        </div>

        <PolicyPanel doc={doc} onReady={setDoc} onAsk={ask} />

        <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
          <BookingsPanel refreshKey={refreshKey} />
        </div>

        <div className="mt-auto space-y-2 text-sm">
          {health === null && (
            <p className="flex items-center gap-2 font-semibold text-slate-600">
              <span className="inline-block size-2 animate-pulse rounded-full bg-slate-400" />
              Checking backend…
            </p>
          )}
          {health === false && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-600"
            >
              <WifiOff className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="text-xs font-bold">Backend not reachable</p>
                <p className="mt-0.5 text-xs opacity-80">
                  Run: uvicorn app.main:app --reload
                </p>
              </div>
            </div>
          )}
          {health && (
            <div className="flex items-center gap-2">
              <Wifi className="size-3.5 text-emerald-600" />
              <Badge variant="primary">
                {health.provider} · {health.model}
              </Badge>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main
        className="relative min-h-0 overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #bae6fd 0%, #e0f2fe 28%, #f0f9ff 60%, #ecfdf5 100%)",
        }}
      >
        <SkyClouds />
        <div className="relative z-10 h-full">
          <Chat
            doc={doc}
            incoming={incoming}
            onBooked={() => setRefreshKey((k) => k + 1)}
          />
        </div>
      </main>
    </div>
  );
}
