// Sticky contact dock — WhatsApp · Call · Enquiry, on screen the whole time a
// visitor browses the product / service catalogs, so the moment a record
// sparks interest the conversation is one tap away.
//
// Phones: a full-width segmented bar pinned to the bottom edge (safe-area
// aware); desktop: a floating centred pill that stays clear of the contact
// cluster (bottom-right) and back-to-top (bottom-left). "Enquiry" opens the
// standard enquiry form in a spring dialog — same Firestore inbox, same spam
// guards — so no page jump is ever needed.
//
// While mounted it sets body[data-dock] (the same switch the detail pages
// use), which hides the floating contact cluster on phones and pads the page
// bottom so no content hides behind the bar.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MessageSquareText, Phone, X } from "lucide-react";
import { useSiteSettings } from "@/lib/content";
import { EnquiryForm } from "./EnquiryForm";
import { WhatsAppIcon } from "./WhatsApp";
import { waLink } from "./WaCluster";

export function ContactDock({
  source,
  message,
  productRef,
  label,
}: {
  /** enquiry source tag, e.g. "product:<slug>" */
  source: string;
  /** pre-filled WhatsApp message */
  message?: string;
  /** optional record name carried into the enquiry form */
  productRef?: string;
  /** optional context chip shown inside the pill on desktop, e.g. "Enquire · LK-1001" */
  label?: string;
}) {
  const { data: settings } = useSiteSettings();
  const reduced = useReducedMotion();
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const tel = `tel:${settings.phone.replace(/\s+/g, "")}`;
  // Portal target — rendered in-route the dock would sit inside <main>, and
  // any transformed ancestor (e.g. the page-rise animation) would turn
  // "fixed" into "pinned to main's bottom edge". (Client-only.)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.dataset.dock = "1";
    return () => {
      delete document.body.dataset.dock;
    };
  }, []);

  const segment =
    "flex-1 sm:flex-initial inline-flex min-h-12 items-center justify-center gap-2 rounded-xl sm:rounded-full px-4 sm:px-5 text-sm font-semibold transition-all duration-300 hover:brightness-110 active:scale-[0.97]";

  if (!mounted) return null;
  return createPortal(
    <>
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 72 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 240, damping: 26 }}
        className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:left-1/2 sm:bottom-5 sm:-translate-x-1/2 sm:px-0 sm:pb-0"
      >
        <div className="glass-dark flex items-stretch gap-1.5 rounded-2xl p-1.5 shadow-[0_24px_64px_-20px_rgba(0,0,0,0.6)] sm:rounded-full">
          {label && (
            <span className="hidden lg:flex items-center pl-4 pr-2">
              <span className="micro-label max-w-[16rem] truncate whitespace-nowrap">{label}</span>
            </span>
          )}
          <a
            href={waLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with LK Chemicals on WhatsApp"
            className={
              segment + " bg-[#25d366] text-white shadow-[0_10px_28px_-12px_rgba(37,211,102,0.9)]"
            }
          >
            <WhatsAppIcon className="h-[18px] w-[18px]" />
            WhatsApp
          </a>
          <a
            href={tel}
            aria-label={`Call LK Chemicals on ${settings.phone}`}
            className={
              segment +
              " border border-white/20 text-white/90 hover:border-cyan-hi hover:text-white"
            }
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
          <button
            type="button"
            onClick={() => setEnquiryOpen(true)}
            aria-label="Send an enquiry"
            className={segment + " bg-cyan-hi text-ink shadow-[0_10px_28px_-12px_var(--cyan-hi)]"}
          >
            <MessageSquareText className="h-4 w-4" />
            Enquiry
          </button>
        </div>
      </motion.div>

      <EnquiryDialog
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        source={source}
        productRef={productRef}
      />
    </>,
    document.body,
  );
}

/* ----------------------------------------------------------------- dialog */

function EnquiryDialog({
  open,
  onClose,
  source,
  productRef,
}: {
  open: boolean;
  onClose: () => void;
  source: string;
  productRef?: string;
}) {
  const reduced = useReducedMotion();
  // Portal target — the dock's fixed wrapper is transformed (centring), which
  // would trap another fixed overlay inside it. (Client-only.)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Scroll lock while open; Esc closes.
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", esc);
    return () => {
      document.documentElement.style.overflow = "";
      removeEventListener("keydown", esc);
    };
  }, [open, onClose]);

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
            aria-label="Send an enquiry"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 64, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="w-full sm:max-w-xl max-h-[92svh] overflow-y-auto p-4 sm:p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {/* Theme-aware header — the blurred backdrop is dark in dark mode
                and pale in light mode, so hard-coded white text would vanish
                in the light theme. */}
            <div className="mb-3 flex items-end justify-between gap-4 px-1">
              <div className="min-w-0">
                <div className="micro-label">Send enquiry</div>
                <h3 className="display-xl mt-1 text-2xl text-foreground truncate">
                  {productRef ? `About ${productRef}.` : "Tell us what you need."}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-foreground/20 text-foreground/70 hover:text-foreground hover:border-cyan-hi transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <EnquiryForm source={source} productRef={productRef} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
