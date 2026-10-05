import ReactMarkdown from "react-markdown";
import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, SendHorizontal, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Hero from "@/components/Hero";
import Popular from "@/components/Popular";
import FlightResults from "@/components/FlightResults";
import { askAssistant } from "@/lib/booking-api";

function SkeletonResponse() {
  return (
    <div className="max-w-[85%] space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="size-3.5 text-primary" />
        </div>
        <span className="text-xs font-bold text-muted-foreground">
          Thinking
        </span>
        <div className="thinking-dots ml-1 flex gap-1">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="space-y-3 pl-9">
        <div className="skeleton-line h-4 w-full" />
        <div className="skeleton-line h-4 w-[85%]" />
        <div className="skeleton-line h-4 w-[60%]" />
      </div>
    </div>
  );
}

function CitationBadges({ sources, onCitationClick }) {
  if (!sources?.length) return null;
  const pageMap = new Map();
  for (const s of sources) {
    const existing = pageMap.get(s.page);
    if (!existing || s.score > existing.score) pageMap.set(s.page, s);
  }
  const uniquePages = [...pageMap.entries()].sort((a, b) => a[0] - b[0]);

  return (
    <div className="mt-2 flex flex-wrap gap-1.5 pl-9">
      {uniquePages.map(([page, src]) => (
        <Badge
          key={page}
          variant="citation"
          role="button"
          tabIndex={0}
          title={`Jump to page ${page} source (score: ${src.score})`}
          onClick={() => onCitationClick(page)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onCitationClick(page);
          }}
        >
          <FileText className="size-3" />
          p.{page}
        </Badge>
      ))}
    </div>
  );
}

function Sources({ sources, highlightPage }) {
  if (!sources?.length) return null;
  return (
    <div className="mt-3 space-y-2 pl-9 animate-fade-in">
      <p className="text-xs font-bold text-muted-foreground">
        Sources ({sources.length} passages)
      </p>
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {sources.map((s, i) => (
          <div
            key={i}
            id={`source-page-${s.page}-${i}`}
            data-page={s.page}
            className={`rounded-xl border bg-white p-3 text-sm transition-all duration-300 ${
              highlightPage === s.page
                ? "border-primary/50 ring-2 ring-primary/20"
                : "border-sky-100"
            }`}
          >
            <div className="mb-1.5 flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                Page {s.page}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                · match {s.score}
              </span>
            </div>
            <p className="line-clamp-4 text-xs leading-relaxed text-slate-600">
              <mark className="rounded bg-emerald-100 px-0.5 text-slate-800">
                {s.text}
              </mark>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Answer({ text, error }) {
  return (
    <div
      className={`rounded-2xl rounded-tl-md bg-white px-4 py-3 text-base leading-relaxed shadow-sm ${
        error ? "text-destructive" : "text-slate-700"
      }`}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-2 list-disc space-y-1.5 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal space-y-1.5 pl-5">{children}</ol>
          ),
          strong: ({ children }) => (
            <strong className="font-extrabold text-slate-800">
              {children}
            </strong>
          ),
          a: ({ children, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default function Chat({ doc, incoming, onBooked }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [expandedSources, setExpandedSources] = useState(null);
  const [highlightPage, setHighlightPage] = useState(null);
  const endRef = useRef(null);

  // New PDF = fresh conversation
  useEffect(() => {
    setMessages([]);
    setExpandedSources(null);
    setHighlightPage(null);
  }, [doc?.doc_id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  // Questions clicked in the sidebar ("Quick check" chips)
  useEffect(() => {
    if (incoming?.id) send(incoming.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incoming?.id]);

  function handleCitationClick(msgIndex, page) {
    setExpandedSources(msgIndex);
    setHighlightPage(page);
    requestAnimationFrame(() => {
      const el =
        document.querySelector(`#source-page-${page}-0`) ||
        document.querySelector(`[data-page="${page}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    setTimeout(() => setHighlightPage(null), 2000);
  }

  async function send(question) {
    const q = question.trim();
    if (!q || busy) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setBusy(true);
    setExpandedSources(null);
    try {
      const res = await askAssistant(q, doc?.doc_id);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          type: res.type,
          content: res.answer,
          sources: res.sources,
          flights: res.flights,
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: e.message, error: true },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        {/* Home: hero + popular routes + popular questions */}
        {messages.length === 0 && (
          <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
            <Hero doc={doc} />
            <Popular doc={doc} onPick={send} />
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end animate-message-in">
              <div className="max-w-[75%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20">
                {m.content}
              </div>
            </div>
          ) : (
            <div
              key={i}
              className="mx-auto max-w-4xl space-y-1 animate-message-in"
            >
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
                  <Sparkles className="size-3.5 text-emerald-600" />
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                  AI Assistant
                </span>
              </div>

              <div className="max-w-[85%] pl-9">
                <Answer text={m.content} error={m.error} />
              </div>

              {m.type === "flights" && m.flights?.length > 0 && (
                <div className="max-w-[90%] pl-9 pt-2">
                  <FlightResults flights={m.flights} onBooked={onBooked} />
                </div>
              )}

              {!m.error && (
                <CitationBadges
                  sources={m.sources}
                  onCitationClick={(page) => handleCitationClick(i, page)}
                />
              )}

              {expandedSources === i && (
                <Sources sources={m.sources} highlightPage={highlightPage} />
              )}
            </div>
          ),
        )}

        {busy && (
          <div className="mx-auto max-w-4xl">
            <SkeletonResponse />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-sky-100 bg-white/80 p-4 backdrop-blur-sm">
        <form
          className="mx-auto flex max-w-3xl gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            placeholder="Search flights, or ask about your policy PDF…"
            aria-label="Your message"
          />
          <Button
            type="submit"
            size="icon"
            disabled={busy || !input.trim()}
            aria-label="Send message"
            className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SendHorizontal className="size-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
