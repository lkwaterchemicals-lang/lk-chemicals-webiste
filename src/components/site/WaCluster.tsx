// Floating contact cluster — a compact speed-dial.
//
// Four permanent labelled pills dominated every page and collided with the
// hero's category chips on phones. At rest this is now a SINGLE 56px trigger;
// tapping it fans the channels out with their labels attached, so the two
// telephone actions ("Call now" dials, "Request a call" books a call-back) are
// still impossible to confuse — the clarity lives in the expanded state, not
// in permanent furniture.
import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Headset, Mail, Phone, PhoneCall, X } from "lucide-react";
import { useSiteSettings } from "@/lib/content";
import { RequestCallDialog } from "./RequestCall";
import { WhatsAppIcon } from "./WhatsApp";

// Module-level so plain call sites (waLink in route files) pick up admin
// changes once the settings query resolves anywhere in the app.
let WHATSAPP = "919866600699";

export function waLink(msg = "Hi LK Chemicals, I would like to enquire.") {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

type Tone = "glass" | "accent" | "whatsapp";

/* ------------------------------------------------------------------ action */

function ClusterItem({
  label,
  hint,
  icon,
  tone,
  href,
  external,
  onClick,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  tone: Tone;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}) {
  const body = (
    <>
      <span className="wa-chip">{label}</span>
      <span className={`wa-item wa-item-${tone}`}>{icon}</span>
    </>
  );
  const cls = "group flex items-center justify-end gap-2.5";
  if (href) {
    return (
      <a
        href={href}
        aria-label={hint}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        onClick={onClick}
        className={cls}
      >
        {body}
      </a>
    );
  }
  return (
    <button type="button" aria-label={hint} onClick={onClick} className={cls}>
      {body}
    </button>
  );
}

/* ----------------------------------------------------------------- cluster */

export function WaCluster() {
  const { data: settings } = useSiteSettings();
  WHATSAPP = settings.whatsapp || WHATSAPP;
  const phone = settings.phone.replace(/\s+/g, "");

  const [open, setOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Collapse whenever the visitor's attention moves elsewhere.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    // Scrolling away is an implicit dismissal — but only on a deliberate move.
    // Lenis keeps emitting scroll events while the page coasts, so opening the
    // menu mid-inertia would otherwise slam it shut instantly. rAF-coalesced so
    // a scroll frame never costs a state update it doesn't need.
    const openY = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (Math.abs(window.scrollY - openY) > 48) setOpen(false);
      });
    };
    addEventListener("keydown", onKey);
    addEventListener("pointerdown", onPointer, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("keydown", onKey);
      removeEventListener("pointerdown", onPointer);
      removeEventListener("scroll", onScroll);
    };
  }, [open]);

  const close = () => setOpen(false);

  // Rendered top→bottom; WhatsApp sits closest to the trigger (shortest thumb
  // travel) because it's the channel most visitors reach for.
  const items = [
    {
      key: "email",
      label: "Email",
      hint: "Email LK Chemicals",
      icon: <Mail className="h-[18px] w-[18px]" />,
      tone: "glass" as Tone,
      href: `mailto:${settings.email}?subject=${encodeURIComponent("Enquiry — LK Chemicals")}`,
      onClick: close,
    },
    {
      key: "request",
      label: "Request a call",
      hint: "Request a call back — leave your number and a preferred time",
      icon: <PhoneCall className="h-[18px] w-[18px]" />,
      tone: "glass" as Tone,
      onClick: () => {
        setOpen(false);
        setCallOpen(true);
      },
    },
    {
      key: "call",
      label: "Call now",
      hint: `Call LK Chemicals on ${settings.phone}`,
      icon: <Phone className="h-[18px] w-[18px]" />,
      tone: "accent" as Tone,
      href: `tel:${phone}`,
      onClick: close,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      hint: "Chat with LK Chemicals on WhatsApp",
      icon: <WhatsAppIcon className="h-[19px] w-[19px]" />,
      tone: "whatsapp" as Tone,
      href: waLink(),
      external: true,
      onClick: close,
    },
  ];

  return (
    <>
      <div
        ref={rootRef}
        className="wa-cluster fixed right-4 bottom-4 z-50 flex flex-col items-end sm:right-6 sm:bottom-6"
      >
        <AnimatePresence>
          {open && (
            <motion.div
              id="contact-actions"
              aria-label="Contact channels"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="mb-3 flex flex-col items-end gap-2.5"
            >
              {items.map((it, i) => (
                <motion.div
                  key={it.key}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.86 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: reduced
                      ? { duration: 0.12 }
                      : {
                          type: "spring",
                          stiffness: 420,
                          damping: 28,
                          delay: (items.length - 1 - i) * 0.035,
                        },
                  }}
                  exit={
                    reduced
                      ? { opacity: 0, transition: { duration: 0.1 } }
                      : { opacity: 0, y: 10, scale: 0.9, transition: { duration: 0.12 } }
                  }
                >
                  <ClusterItem {...it} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="contact-actions"
          aria-label={open ? "Close contact menu" : "Contact LK Chemicals"}
          title={open ? "Close" : "Contact us"}
          className="wa-fab grid h-14 w-14 place-items-center rounded-full"
        >
          {!open && <span aria-hidden className="wa-fab-ping" />}
          <motion.span
            aria-hidden
            animate={reduced ? undefined : { rotate: open ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 24 }}
            className="relative grid place-items-center"
          >
            {open ? <X className="h-6 w-6" /> : <Headset className="h-6 w-6" />}
          </motion.span>
        </button>
      </div>

      <RequestCallDialog
        open={callOpen}
        onClose={() => setCallOpen(false)}
        source="floating-cluster"
      />
    </>
  );
}
