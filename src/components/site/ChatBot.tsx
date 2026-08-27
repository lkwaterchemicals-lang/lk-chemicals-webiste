// LK Assist — the site's AI sales engineer.
//
// Mounted once in __root.tsx so it is present on every public page. The Gemini
// key is never here: this talks to /api/chat, which holds it server-side.
//
// The design target is a maintenance in-charge on a phone, mid-shift, who is
// not an engineer and may not type English comfortably. So the interface is
// built around TAPPING, not typing: every answer arrives with two to four
// suggested replies, and a recommendation arrives as a real product card with
// a photo — never a bare URL buried in a paragraph.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MessageSquareText, RefreshCw, Send, Sparkles, X } from "lucide-react";
import logoUrl from "@/assets/lk-logo.png";
import { useWaLink } from "@/lib/content";
import { useChatbotContent } from "@/lib/pages";
import { WhatsAppIcon } from "./WhatsApp";

type ProductCard = {
  slug: string;
  name: string;
  category: string;
  image: string | null;
  blurb: string;
  url: string;
};

type Msg = {
  role: "user" | "model";
  text: string;
  suggestions?: string[];
  products?: ProductCard[];
};

const STORAGE_KEY = "lk-assist-thread";
const MAX_STORED = 30;

// Every word the panel says — greeting, buttons, languages, CTAs — comes from
// Admin → Website content → AI assistant. The built-ins in src/data/chatbot.ts
// render first so it is never blank, then the saved document replaces them.
// Chemical terminology belongs to the client, not to this file.

/* ------------------------------------------------------------- rendering */

/** Strips the markdown a model reaches for out of habit. The bubbles render
 * plain text, so `**LK 1001**` would otherwise show its asterisks. */
function plain(text: string): string {
  return (
    text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/```[a-z]*\n?/gi, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      // Paths belong in productSlugs, which become cards. If one slips into the
      // prose anyway, drop it — a raw URL means nothing to a non-technical reader.
      .replace(/\s*\/(?:products|services)\/[a-z0-9\-/]+/gi, "")
      .trim()
  );
}

const LANG_CHIP = (on: boolean) => `lkc-chip lkc-chip-quiet${on ? " is-on" : ""}`;

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
  const { data: content } = useChatbotContent();
  // Which language button is active, or null for the default opening screen.
  const [lang, setLang] = useState<number | null>(null);

  // Memoised because pickLanguage closes over it; a fresh [] every render would
  // give that callback a new identity on every keystroke in the composer.
  const languages = useMemo(() => content.languages ?? [], [content.languages]);
  const active = lang === null ? null : languages[lang];
  const greeting = active?.greeting?.trim() || content.greeting;
  const starters = (active?.starters?.length ? active.starters : content.starters) ?? [];

  useEffect(() => setMounted(true), []);

  // Restore the thread so a reload doesn't lose the context they just gave.
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
    // Phones: never autofocus, or the keyboard swallows the panel on open.
    if (matchMedia("(min-width: 640px)").matches) {
      setTimeout(() => inputRef.current?.focus(), 280);
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
          // Only role/text go up: suggestions and cards are presentation.
          body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, text: m.text })) }),
        });
        const data = (await res.json()) as {
          reply?: string;
          suggestions?: string[];
          products?: ProductCard[];
          error?: string;
        };
        if (!res.ok || data.error) {
          setError(data.error ?? content.errorMessage);
        } else if (data.reply) {
          setMessages((m) => [
            ...m,
            {
              role: "model",
              text: data.reply!,
              suggestions: data.suggestions ?? [],
              products: data.products ?? [],
            },
          ]);
        }
      } catch {
        setError("Couldn't reach the assistant — check your connection and try again.");
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, content.errorMessage],
  );

  /** Tapping a language switches the opening screen into it when the client has
   * translated one — buttons in your own language beat a canned opening line.
   * With nothing translated, send the seed instead, which is what tells the
   * assistant which language to answer in. */
  const pickLanguage = useCallback(
    (i: number) => {
      const l = languages[i];
      if (!l) return;
      setLang(i);
      if (!l.starters?.length) void send(l.seed);
    },
    [languages, send],
  );

  /** Hands the qualified conversation to sales, so nobody repeats themselves. */
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
    setLang(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to do */
    }
  };

  if (!mounted) return null;

  // Only the newest assistant turn offers choices — older chips would let
  // someone answer a question three messages out of date.
  const live = messages[messages.length - 1];
  const chips =
    !busy && live?.role === "model" && live.suggestions?.length ? live.suggestions : null;

  const panel = (
    <AnimatePresence>
      {open && (
        <>
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
            aria-label={`${content.title} — chat with our sales engineer`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="lkc-panel"
          >
            <header className="lkc-head">
              <span className="lkc-head-mark">
                <img src={logoUrl} alt="" width={320} height={279} />
              </span>
              <span className="lkc-head-text">
                <span className="lkc-head-title">{content.title}</span>
                <span className="lkc-head-sub">
                  <i className="lkc-dot" aria-hidden /> {content.subtitle}
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
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="lkc-log" ref={logRef}>
              <div className="lkc-msg lkc-msg-bot">{greeting}</div>

              {messages.length === 0 && (
                <>
                  {starters.length > 0 && (
                    <div className="lkc-chips" role="group" aria-label="Common topics">
                      {starters.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => void send(s)}
                          className="lkc-chip lkc-chip-lg"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  {languages.length > 1 && (
                    <div className="lkc-lang">
                      <span className="lkc-lang-label">{content.languagePrompt}</span>
                      <span className="lkc-chips">
                        {languages.map((l, i) => (
                          <button
                            key={l.label}
                            type="button"
                            onClick={() => pickLanguage(i)}
                            aria-pressed={i === lang}
                            className={LANG_CHIP(i === lang)}
                          >
                            {l.label}
                          </button>
                        ))}
                      </span>
                    </div>
                  )}
                </>
              )}

              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={reduced ? undefined : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="lkc-turn"
                >
                  <div className={`lkc-msg ${m.role === "user" ? "lkc-msg-user" : "lkc-msg-bot"}`}>
                    {m.role === "user" ? m.text : plain(m.text)}
                  </div>

                  {m.products?.map((p) => (
                    <Link key={p.slug} to={p.url} className="lkc-card">
                      {p.image ? (
                        <img src={p.image} alt="" loading="lazy" className="lkc-card-img" />
                      ) : (
                        <span className="lkc-card-img lkc-card-img-empty" aria-hidden />
                      )}
                      <span className="lkc-card-body">
                        {p.category && <span className="lkc-card-cat">{p.category}</span>}
                        <span className="lkc-card-name">{p.name}</span>
                        {p.blurb && <span className="lkc-card-blurb">{p.blurb}</span>}
                        <span className="lkc-card-cta">
                          {content.productCta} <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </span>
                    </Link>
                  ))}
                </motion.div>
              ))}

              {busy && (
                <div className="lkc-msg lkc-msg-bot lkc-typing" aria-live="polite">
                  <span />
                  <span />
                  <span />
                </div>
              )}

              {error && (
                <div className="lkc-error" role="alert">
                  {error}
                </div>
              )}

              {chips && (
                <div className="lkc-chips" role="group" aria-label="Suggested replies">
                  {chips.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void send(s)}
                      className="lkc-chip lkc-chip-lg"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lkc-foot">
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
                  placeholder={content.placeholder}
                  aria-label={`Message ${content.title}`}
                  className="lkc-input"
                />
                <button
                  type="submit"
                  disabled={busy || !draft.trim()}
                  className="lkc-send"
                  aria-label="Send message"
                >
                  <Send className="h-[18px] w-[18px]" />
                </button>
              </form>

              {/* Below the composer, not above it: the conversation gets the
                  room, and the human handover stays one tap away throughout. */}
              <a
                href={handoffHref}
                target="_blank"
                rel="noopener noreferrer"
                className="lkc-sales"
                style={{ color: "#fff" }}
              >
                <WhatsAppIcon className="h-4 w-4" />
                {content.salesCta}
              </a>
            </div>
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
        aria-label={open ? `Close ${content.title}` : `Chat with ${content.title}`}
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
