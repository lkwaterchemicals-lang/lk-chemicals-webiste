// LK Assist — the site's AI sales engineer.
//
// One self-contained module, mounted once in __root.tsx so it is present on
// every public page (the React equivalent of dropping a script before </body>,
// but without a second DOM tree fighting hydration or a duplicate copy of the
// design system).
//
// The Gemini key is never here: this talks to /api/chat, which holds the key
// server-side. Nothing in this file can leak it, even in a sourcemap.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { MessageSquareText, RefreshCw, Send, Sparkles, X } from "lucide-react";
import logoUrl from "@/assets/lk-logo.png";
import { useWaLink } from "@/lib/content";
import { WhatsAppIcon } from "./WhatsApp";

type Msg = { role: "user" | "model"; text: string };

const STORAGE_KEY = "lk-assist-thread";
const MAX_STORED = 30;

const GREETING =
  "Hi! I'm LK Assist — I help match plants to the right LK Chemicals treatment.\n\n" +
  "Tell me what you're treating and I'll narrow it down. English, Hindi or Telugu, whichever you prefer.";

/** Openers that also teach the visitor what this thing is good at. */
const STARTERS = [
  "RO antiscalant for high TDS borewell water",
  "Boiler treatment for a 5 TPH boiler",
  "Cooling tower chemicals for a pharma plant",
  "Meeku ETP chemicals unnaya?",
];

/* ------------------------------------------------------------- rendering */

// The model is told to answer in plain text and to cite pages as /products/…
// paths. Turn those into real links so a recommendation is one tap from the
// product page; everything else is rendered as text, never as HTML.
function MessageBody({ text }: { text: string }) {
  const parts = useMemo(() => {
    const out: (string | { path: string })[] = [];
    const re = /\/(?:products|services)\/[a-z0-9\-/]+/gi;
    let last = 0;
    for (const m of text.matchAll(re)) {
      const at = m.index ?? 0;
      if (at > last) out.push(text.slice(last, at));
      out.push({ path: m[0].replace(/[.,;:)]+$/, "") });
      last = at + m[0].length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }, [text]);

  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{p}</span>
        ) : (
          <Link key={i} to={p.path} className="lkc-link">
            {p.path}
          </Link>
        ),
      )}
    </>
  );
}

/* ------------------------------------------------------------------ panel */

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const reduced = useReducedMotion();
  const waHref = useWaLink();

  useEffect(() => setMounted(true), []);

  // Restore the thread so a reload (or a hard navigation) doesn't lose context.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw) as Msg[]);
    } catch {
      /* private mode — start fresh */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {
      /* nothing to do */
    }
  }, [messages]);

  // Keep the newest message in view, including while the reply streams in.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [messages, busy, reduced]);

  useEffect(() => {
    if (open) document.body.dataset.chat = "1";
    else delete document.body.dataset.chat;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", esc);
    // Phones: don't steal focus, or the keyboard covers the whole panel.
    if (matchMedia("(min-width: 640px)").matches) {
      setTimeout(() => inputRef.current?.focus(), 260);
    }
    return () => removeEventListener("keydown", esc);
  }, [open]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;
      setError(null);
      setDraft("");
      const next: Msg[] = [...messages, { role: "user", text }];
      setMessages(next);
      setBusy(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next }),
        });
        const data = (await res.json()) as { reply?: string; error?: string };
        if (!res.ok || data.error) {
          setError(data.error ?? "The assistant is unavailable right now.");
        } else if (data.reply) {
          setMessages((m) => [...m, { role: "model", text: data.reply! }]);
        }
      } catch {
        setError("Couldn't reach the assistant — check your connection and try again.");
      } finally {
        setBusy(false);
      }
    },
    [busy, messages],
  );

  /** Hands the whole qualified conversation to the sales team on WhatsApp, so
   * nobody has to repeat what they already typed here. */
  const handoffHref = useMemo(() => {
    const transcript = messages
      .slice(-12)
      .map((m) => `${m.role === "user" ? "Me" : "LK Assist"}: ${m.text.replace(/\s+/g, " ")}`)
      .join("\n\n");
    return waHref(
      transcript
        ? `Hi LK Chemicals, I was chatting with LK Assist on your website and would like to speak to sales.\n\n---\n${transcript}\n---`
        : "Hi LK Chemicals, I'd like to speak to your sales team.",
    );
  }, [messages, waHref]);

  const reset = () => {
    setMessages([]);
    setError(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to do */
    }
  };

  if (!mounted) return null;

  const panel = (
    <AnimatePresence>
      {open && (
        <>
          {/* Phones get a scrim; on desktop the panel floats over the page. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="lkc-scrim"
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-label="LK Assist — chat with our sales engineer"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="lkc-panel"
          >
            {/* ---- header: the brand, then the two things they might want ---- */}
            <header className="lkc-head">
              <span className="lkc-head-mark">
                <img src={logoUrl} alt="" width={320} height={279} />
              </span>
              <span className="lkc-head-text">
                <span className="lkc-head-title">LK Assist</span>
                <span className="lkc-head-sub">
                  <i className="lkc-dot" aria-hidden /> Answers in English · हिंदी · Telugu
                </span>
              </span>
              <div className="lkc-head-actions">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={reset}
                    className="lkc-icon"
                    aria-label="Start a new conversation"
                    title="Start over"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="lkc-icon"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <a
              href={handoffHref}
              target="_blank"
              rel="noopener noreferrer"
              className="lkc-sales"
              // Brand rules: white on WhatsApp green, and the light theme's
              // `text-white` remap must not touch it.
              style={{ color: "#fff" }}
            >
              <WhatsAppIcon className="h-4 w-4" />
              Contact Sales
              <span className="lkc-sales-hint">sends this chat</span>
            </a>

            {/* ---- transcript ---- */}
            <div className="lkc-log" ref={logRef}>
              <div className="lkc-msg lkc-msg-bot">
                <MessageBody text={GREETING} />
              </div>

              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={reduced ? undefined : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className={`lkc-msg ${m.role === "user" ? "lkc-msg-user" : "lkc-msg-bot"}`}
                >
                  <MessageBody text={m.text} />
                </motion.div>
              ))}

              {busy && (
                <div className="lkc-msg lkc-msg-bot lkc-typing" aria-live="polite">
                  <span />
                  <span />
                  <span />
                </div>
              )}

              {error && <p className="lkc-error">{error}</p>}

              {messages.length === 0 && (
                <div className="lkc-starters">
                  {STARTERS.map((s) => (
                    <button key={s} type="button" onClick={() => void send(s)} className="lkc-chip">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ---- composer ---- */}
            <form
              className="lkc-composer"
              onSubmit={(e) => {
                e.preventDefault();
                void send(draft);
              }}
            >
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(draft);
                  }
                }}
                rows={1}
                placeholder="Industry, capacity, TDS, application…"
                aria-label="Message LK Assist"
                className="lkc-input"
              />
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                className="lkc-send"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="lkc-legal">
              AI assistant — confirm dosage and pricing with our technical team.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close LK Assist" : "Chat with LK Assist"}
        className={`lkc-launcher ${open ? "is-open" : ""}`}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <>
            <MessageSquareText className="h-5 w-5" />
            <Sparkles className="lkc-launcher-spark h-3 w-3" aria-hidden />
          </>
        )}
      </button>
      {createPortal(panel, document.body)}
    </>
  );
}
