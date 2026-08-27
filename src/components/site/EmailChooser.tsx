// How to email us — a chooser, because `mailto:` is a coin toss on desktop.
//
// On a phone `mailto:` always resolves: there is a mail app and the OS opens
// it. On a laptop it only works if the machine has a mail client registered,
// and most people who live in Gmail or Outlook on the web have nothing
// registered at all — the link fires and absolutely nothing happens, which is
// exactly what was reported. The browser gives no way to detect that (no
// error, no event), so guessing is impossible.
//
// So desktop gets an explicit choice — webmail, the mail app, or just take the
// address — and every path ends with the visitor able to actually send. Phones
// keep the single-tap `mailto:` they already had.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, ExternalLink, Mail, X } from "lucide-react";
import { mailHref } from "@/lib/contact";

const SUBJECT = "Enquiry — LK Chemicals";

const webmail = (address: string) => [
  {
    key: "gmail",
    label: "Gmail",
    hint: "Opens in your browser",
    href: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(address)}&su=${encodeURIComponent(SUBJECT)}`,
  },
  {
    key: "outlook",
    label: "Outlook",
    hint: "Opens in your browser",
    href: `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(address)}&subject=${encodeURIComponent(SUBJECT)}`,
  },
];

export function EmailChooser({
  address,
  open,
  onClose,
}: {
  address: string;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", esc);
    const t = setTimeout(() => closeRef.current?.focus(), 120);
    return () => {
      removeEventListener("keydown", esc);
      clearTimeout(t);
    };
  }, [open, onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      // Clipboard blocked (insecure context, denied permission) — the address
      // is on screen and selectable, so there is still a way through.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lke-scrim"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Email LK Chemicals"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="lke-panel"
          >
            <header className="lke-head">
              <span className="lke-title">
                <Mail className="h-4 w-4" aria-hidden /> Email us
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="lke-x"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <p className="lke-address">{address}</p>

            <div className="lke-options">
              {webmail(address).map((o) => (
                <a
                  key={o.key}
                  href={o.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="lke-option"
                >
                  <span className="lke-option-label">{o.label}</span>
                  <span className="lke-option-hint">{o.hint}</span>
                  <ExternalLink className="lke-option-icon h-4 w-4" aria-hidden />
                </a>
              ))}

              <a href={mailHref(address, SUBJECT)} onClick={onClose} className="lke-option">
                <span className="lke-option-label">Mail app on this device</span>
                <span className="lke-option-hint">Outlook, Apple Mail, Thunderbird…</span>
                <Mail className="lke-option-icon h-4 w-4" aria-hidden />
              </a>

              <button type="button" onClick={copy} className="lke-option lke-option-copy">
                <span className="lke-option-label">{copied ? "Copied!" : "Copy address"}</span>
                <span className="lke-option-hint">Paste it wherever you like</span>
                {copied ? (
                  <Check className="lke-option-icon h-4 w-4" aria-hidden />
                ) : (
                  <Copy className="lke-option-icon h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** True when `mailto:` can be trusted to actually open something.
 *
 * Coarse pointer = phone or tablet, where the OS always has a mail handler.
 * Anywhere else, offer the chooser instead of firing a link that may silently
 * do nothing. */
export function mailtoIsReliable(): boolean {
  if (typeof matchMedia === "undefined") return true;
  return matchMedia("(pointer: coarse)").matches;
}
