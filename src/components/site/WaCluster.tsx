import { useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";
import { useSiteSettings } from "@/lib/content";
import { RequestCallFab } from "./RequestCall";
import { WhatsAppIcon } from "./WhatsApp";

// Module-level so plain call sites (waLink in route files) pick up admin
// changes once the settings query resolves anywhere in the app.
let WHATSAPP = "919866600699";

export function waLink(msg = "Hi LK Chemicals, I would like to enquire.") {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

// Floating contact cluster. At the top of the page all four channels show
// (request-a-call-back, email, call, WhatsApp); once the visitor scrolls,
// the stack collapses to just call + WhatsApp so it never crowds the content.
export function WaCluster() {
  const { data: settings } = useSiteSettings();
  WHATSAPP = settings.whatsapp || WHATSAPP;
  const phone = settings.phone.replace(/\s+/g, "");

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 160);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="wa-cluster fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 print:hidden">
      <div
        aria-hidden={scrolled}
        className={
          "flex flex-col items-end gap-3 transition-all duration-500 " +
          (scrolled
            ? "pointer-events-none max-h-0 translate-y-3 opacity-0 overflow-hidden"
            : "max-h-40 opacity-100")
        }
      >
        <RequestCallFab source="floating-cluster" />
        <a
          href={`mailto:${settings.email}?subject=${encodeURIComponent("Enquiry — LK Chemicals")}`}
          aria-label="Email LK Chemicals"
          title="Email us"
          tabIndex={scrolled ? -1 : 0}
          className="grid h-12 w-12 place-items-center rounded-full glass-dark text-cyan-hi hover:text-white hover-lift"
        >
          <Mail className="h-5 w-5" />
        </a>
      </div>
      <a
        href={`tel:${phone}`}
        aria-label="Call LK Chemicals"
        title="Call us"
        className="grid h-12 w-12 place-items-center rounded-full glass-dark text-cyan-hi hover:text-white hover-lift"
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href={waLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp LK Chemicals"
        title="WhatsApp us"
        style={{ color: "#fff", background: "#25D366" }}
        className="relative grid h-14 w-14 place-items-center rounded-full shadow-[0_10px_40px_-10px_rgba(37,211,102,0.8)] hover-lift"
      >
        <span
          className="absolute inset-0 rounded-full animate-pulse-soft opacity-40"
          style={{ background: "#25D366" }}
          aria-hidden
        />
        <WhatsAppIcon className="relative h-7 w-7" />
      </a>
    </div>
  );
}
