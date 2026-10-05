import { useRef, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { uploadPolicy } from "@/lib/booking-api";

const CHECKS = [
  {
    icon: "🧳",
    label: "Baggage rules",
    q: "How much cabin baggage can I carry?",
  },
  {
    icon: "💸",
    label: "Refund policy",
    q: "What is the cancellation and refund policy?",
  },
  { icon: "🛫", label: "Web check-in", q: "When does web check-in open?" },
];

export default function PolicyPanel({ doc, onReady, onAsk }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);

  async function handle(file) {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      onReady(await uploadPolicy(file));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setOver(false);
    }
  }

  const picker = (
    <input
      ref={inputRef}
      type="file"
      accept="application/pdf"
      className="hidden"
      onChange={(e) => {
        handle(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );

  /* ---------- loaded state ---------- */
  if (doc) {
    return (
      <div className="space-y-3 rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-sm animate-fade-in">
        {picker}
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-extrabold uppercase tracking-wide text-emerald-600">
              Policy loaded
            </div>
            <div
              className="truncate text-sm font-bold text-slate-700"
              title={doc.filename}
            >
              {doc.filename}
            </div>
            <div className="text-xs font-semibold text-slate-400">
              {doc.pages} pages · {doc.chunks} sections
            </div>
          </div>
        </div>

        <div className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
          Quick check
        </div>
        <div className="flex flex-wrap gap-2">
          {CHECKS.map((c) => (
            <button
              key={c.label}
              onClick={() => onAsk(c.q)}
              className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white hover:shadow-md active:scale-95"
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          Replace policy
        </button>
        {error && (
          <div className="text-xs font-semibold text-red-500">{error}</div>
        )}
      </div>
    );
  }

  /* ---------- empty state ---------- */
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        handle(e.dataTransfer.files?.[0]);
      }}
      className={`rounded-2xl border bg-white/90 p-4 shadow-sm transition ${
        over ? "border-primary ring-2 ring-primary/30" : "border-sky-100"
      }`}
    >
      {picker}
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-primary">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <div className="text-sm font-extrabold text-slate-700">
            Airline policy
          </div>
          <div className="text-xs font-semibold text-slate-400">
            Baggage, refunds, check-in rules
          </div>
        </div>
      </div>

      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 active:scale-95 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Reading PDF…
          </>
        ) : (
          <>
            <Plus className="size-4" /> Add policy PDF
          </>
        )}
      </button>
      <div className="mt-2 flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400">
        <FileText className="size-3" /> or drag a PDF onto this card
      </div>
      {error && (
        <div className="mt-2 text-xs font-semibold text-red-500">{error}</div>
      )}
    </div>
  );
}
