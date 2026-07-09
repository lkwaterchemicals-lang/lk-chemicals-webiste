// "Request a call" — the site's call-back concierge.
//
// A trigger button (drop it anywhere) opens a spring-animated glass dialog:
// name + phone + a preferred time slot picked from tactile chips. Submissions
// land in the same Firestore `enquiries` inbox the admin already lives in,
// tagged kind:"call-request" so the dashboard badges them. Honeypot +
// time-trap + optional reCAPTCHA v3 keep the inbox clean. Works in both
// themes via the shared glass tokens.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Check, PhoneCall, X } from "lucide-react";
import { db } from "@/integrations/firebase/client";
import { getRecaptchaToken, honeypotProps, isLikelySpam } from "@/lib/spam";

const SLOTS = ["Morning 9–12", "Afternoon 12–4", "Evening 4–7", "Anytime"] as const;

export function RequestCallButton({
  source,
  variant = "primary",
  className = "",
  children,
}: {
  source: string;
  variant?: "primary" | "ghost";
  className?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const cls =
    variant === "primary"
      ? "bg-cyan-hi text-ink shadow-[0_10px_40px_-10px_var(--cyan-hi)] hover:shadow-[0_20px_60px_-10px_var(--cyan-hi)]"
      : "text-white border border-white/20 hover:border-cyan-hi hover:text-cyan-hi";
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          "group inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-medium transition-all duration-500 " +
          cls +
          " " +
          className
        }
      >
        <PhoneCall className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-12" />
        {children ?? "Request a call"}
      </button>
      <RequestCallDialog open={open} onClose={() => setOpen(false)} source={source} />
    </>
  );
}

/** Compact round trigger for the floating action cluster. */
export function RequestCallFab({ source }: { source: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Request a call back"
        title="Request a call back"
        className="grid h-12 w-12 place-items-center rounded-full glass-dark text-cyan-hi hover:text-white hover-lift"
      >
        <PhoneCall className="h-5 w-5" />
      </button>
      <RequestCallDialog open={open} onClose={() => setOpen(false)} source={source} />
    </>
  );
}

export function RequestCallDialog({
  open,
  onClose,
  source,
}: {
  open: boolean;
  onClose: () => void;
  source: string;
}) {
  const reduced = useReducedMotion();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [slot, setSlot] = useState<(typeof SLOTS)[number]>("Anytime");
  const [note, setNote] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const openedAt = useRef(Date.now());
  // Portal target — trigger buttons live inside hover-lift cards whose
  // transform would otherwise trap this fixed overlay. (Client-only.)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Fresh sheet + scroll lock while open; Esc closes.
  useEffect(() => {
    if (!open) return;
    openedAt.current = Date.now();
    setSent(false);
    setError(null);
    document.documentElement.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", esc);
    return () => {
      document.documentElement.style.overflow = "";
      removeEventListener("keydown", esc);
    };
  }, [open, onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || phone.replace(/\D/g, "").length < 10) {
      setError("Please share your name and a 10-digit phone number.");
      return;
    }
    // Bots get a polite fake success — nothing is written.
    if (isLikelySpam(honeypot, openedAt.current)) {
      setSent(true);
      return;
    }
    setBusy(true);
    try {
      const recaptcha = await getRecaptchaToken("request_call");
      await addDoc(collection(db, "enquiries"), {
        kind: "call-request",
        name: name.trim(),
        phone: phone.trim(),
        callSlot: slot,
        requirement: `📞 Call-back request · Preferred time: ${slot}${note.trim() ? `\nTopic: ${note.trim()}` : ""}`,
        source,
        recaptcha: recaptcha ?? null,
        createdAt: serverTimestamp(),
      });
      setSent(true);
      setName("");
      setPhone("");
      setNote("");
    } catch {
      setError("Couldn't send just now — please call or WhatsApp us instead.");
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full bg-transparent border-b border-white/15 focus:border-cyan-hi outline-none py-3 text-white placeholder:text-white/30 transition-colors";

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-ink-2/70 backdrop-blur-md p-0 sm:p-6"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Request a call back"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 64, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative w-full sm:max-w-md glass-dark rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-0 caustics opacity-25" aria-hidden />
            {/* z-10: the form container below is position:relative and would
                otherwise paint over this button and swallow its taps. */}
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 hover:text-white hover:border-cyan-hi transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {sent ? (
              <div className="relative py-8 text-center">
                <motion.div
                  initial={reduced ? undefined : { scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 16 }}
                  className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-leaf text-ink"
                >
                  <Check className="h-7 w-7" />
                </motion.div>
                <h3 className="display-xl mt-5 text-2xl text-white">We'll call you.</h3>
                <p className="mt-2 text-sm text-white/70">
                  Your request is with our team — expect a call {slot.toLowerCase()}.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-hi px-6 py-2.5 text-sm font-medium text-ink"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="relative">
                <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-cyan-hi/15 text-cyan-hi">
                  <PhoneCall className="h-6 w-6" />
                  <span
                    className="absolute inset-0 rounded-2xl border border-cyan-hi/30 animate-pulse-soft"
                    aria-hidden
                  />
                </span>
                <h3 className="display-xl mt-4 text-2xl sm:text-3xl text-white">
                  We'll call you back.
                </h3>
                <p className="mt-1.5 text-sm text-white/60">
                  Leave your number and a good time — a real engineer calls, not a bot.
                </p>

                <div className="mt-6 grid gap-1">
                  <input
                    required
                    className={input}
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    required
                    type="tel"
                    className={input}
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <input
                    className={input}
                    placeholder="Topic (optional) — e.g. RO antiscalant dosing"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <input
                    {...honeypotProps}
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div className="mt-5">
                  <div className="micro-label">Preferred time</div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {SLOTS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSlot(s)}
                        aria-pressed={slot === s}
                        className={
                          "rounded-full px-4 py-2 text-xs tracking-wide transition-all border " +
                          (slot === s
                            ? "bg-cyan-hi text-ink border-cyan-hi shadow-[0_8px_24px_-10px_var(--cyan-hi)]"
                            : "border-white/15 text-white/70 hover:border-cyan-hi")
                        }
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-6 w-full rounded-full bg-cyan-hi py-3.5 text-sm font-semibold text-ink shadow-[0_10px_40px_-10px_var(--cyan-hi)] transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {busy ? "Sending…" : "Request my call back"}
                </button>
                <p className="mt-3 text-center text-[11px] text-white/40">
                  Mon–Sat, 9:30 AM – 7:00 PM IST · no marketing calls, ever.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
