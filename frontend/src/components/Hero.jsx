function Cloud({ className = "", style }) {
  return (
    <svg
      viewBox="0 0 120 60"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <g fill="#ffffff">
        <circle cx="35" cy="35" r="20" />
        <circle cx="60" cy="25" r="25" />
        <circle cx="88" cy="36" r="18" />
        <rect x="30" y="35" width="62" height="20" rx="10" />
      </g>
    </svg>
  );
}

function Plane({ className = "" }) {
  return (
    <svg viewBox="0 0 420 220" className={className} aria-hidden="true">
      {/* far wing */}
      <path d="M205 88 L255 40 L282 40 L262 88Z" fill="#93c5fd" />
      {/* tail */}
      <path d="M72 88 L38 46 L78 46 L116 86Z" fill="#2f80ed" />
      {/* body */}
      <path
        d="M58 108 Q58 84 100 84 L300 84 Q356 88 372 108 Q356 128 300 132 L100 132 Q58 132 58 108Z"
        fill="#ffffff"
        stroke="#bfdbfe"
        strokeWidth="3"
      />
      {/* green stripe */}
      <path
        d="M72 116 L352 116"
        stroke="#22c55e"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* cockpit */}
      <path d="M318 92 Q350 94 362 106 L318 106Z" fill="#bfdbfe" />
      {/* windows */}
      {[110, 140, 170, 200, 230, 260, 290].map((x) => (
        <circle
          key={x}
          cx={x}
          cy="102"
          r="7"
          fill="#dbeafe"
          stroke="#93c5fd"
          strokeWidth="2"
        />
      ))}
      {/* near wing */}
      <path d="M175 120 L250 184 L290 184 L255 120Z" fill="#2f80ed" />
      {/* engine */}
      <ellipse
        cx="238"
        cy="158"
        rx="26"
        ry="11"
        fill="#e0f2fe"
        stroke="#93c5fd"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function Hero({ doc }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-sky-200 shadow-lg shadow-sky-200/60"
      style={{
        background:
          "linear-gradient(180deg, #7dd3fc 0%, #e0f2fe 60%, #ffffff 100%)",
      }}
    >
      {/* sun */}
      <div className="absolute right-8 top-6 size-14 rounded-full bg-yellow-200 opacity-90 shadow-[0_0_40px_10px_rgba(253,224,71,0.5)]" />

      {/* drifting clouds */}
      <Cloud className="cloud-drift absolute left-0 top-8 w-24 opacity-90" />
      <Cloud
        className="cloud-drift absolute left-0 top-24 w-32 opacity-70"
        style={{ animationDuration: "55s", animationDelay: "-20s" }}
      />
      <Cloud
        className="cloud-drift absolute left-0 top-44 w-20 opacity-80"
        style={{ animationDuration: "45s", animationDelay: "-8s" }}
      />

      <div className="relative z-10 grid items-center gap-2 px-6 pb-10 pt-8 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-extrabold leading-tight text-slate-800 md:text-4xl">
            Where to <span className="text-primary">next?</span> ✈️
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {doc
              ? `Ask about ${doc.filename} or book a flight.`
              : "Search flights in plain English, then book in two clicks."}
          </p>
        </div>
        <Plane className="plane-bob w-full drop-shadow-xl" />
      </div>

      {/* green hills */}
      <div className="absolute -bottom-6 left-0 h-12 w-full rounded-[100%] bg-emerald-300/80" />
      <div className="absolute -bottom-8 left-10 h-12 w-[90%] rounded-[100%] bg-emerald-400/80" />
    </div>
  );
}
