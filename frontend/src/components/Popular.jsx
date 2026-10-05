const ROUTES = [
  {
    from: "Madurai",
    to: "Delhi",
    emoji: "🏛️",
    tag: "Most searched",
    c: ["#38bdf8", "#2f80ed"],
  },
  {
    from: "Chennai",
    to: "Bengaluru",
    emoji: "🌳",
    tag: "Quick hop",
    c: ["#34d399", "#14b8a6"],
  },
  {
    from: "Mumbai",
    to: "Hyderabad",
    emoji: "🕌",
    tag: "Business favourite",
    c: ["#818cf8", "#38bdf8"],
  },
  {
    from: "Madurai",
    to: "Chennai",
    emoji: "🛕",
    tag: "Weekend trip",
    c: ["#4ade80", "#10b981"],
  },
  {
    from: "Delhi",
    to: "Mumbai",
    emoji: "🌆",
    tag: "Daily flights",
    c: ["#60a5fa", "#22d3ee"],
  },
  {
    from: "Bengaluru",
    to: "Kozhikode",
    emoji: "🌴",
    tag: "Beach escape",
    c: ["#2dd4bf", "#22c55e"],
  },
];

const QUESTIONS = [
  { icon: "🧳", q: "How much cabin baggage can I carry?" },
  { icon: "💸", q: "What is the cancellation and refund policy?" },
  { icon: "🛫", q: "When does web check-in open?" },
  { icon: "📄", q: "Summarize this document in 5 bullets" },
];

export default function Popular({ doc, onPick }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-lg font-extrabold text-slate-800">
          🔥 Popular routes
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROUTES.map((r) => (
            <button
              key={r.from + r.to}
              onClick={() => onPick(`${r.from} to ${r.to} tomorrow`)}
              className="group relative overflow-hidden rounded-2xl p-4 text-left text-white shadow-md transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${r.c[0]}, ${r.c[1]})`,
              }}
            >
              <div className="absolute -right-3 -top-3 text-6xl opacity-30 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                {r.emoji}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-white/80">
                {r.tag}
              </div>
              <div className="mt-2 text-lg font-extrabold leading-tight">
                {r.from}{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  ✈
                </span>{" "}
                {r.to}
              </div>
              <div className="mt-1 text-xs font-semibold text-white/80">
                Tap to search tomorrow's flights
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-extrabold text-slate-800">
          💬 Popular questions
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUESTIONS.map((x) => (
            <button
              key={x.q}
              disabled={!doc}
              onClick={() => onPick(x.q)}
              className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-white p-4 text-left text-sm font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-sky-200/70 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
            >
              <span className="text-xl">{x.icon}</span>
              <span className="flex-1">{x.q}</span>
              {!doc && (
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-primary">
                  Add policy
                </span>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
