import { MessageCircle, Phone } from "lucide-react";
import { useSiteSettings } from "@/lib/content";

// Module-level so plain call sites (waLink in route files) pick up admin
// changes once the settings query resolves anywhere in the app.
let WHATSAPP = "919866600699";

export function waLink(msg = "Hi LK Chemicals, I would like to enquire.") {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

export function WaCluster() {
  const { data: settings } = useSiteSettings();
  WHATSAPP = settings.whatsapp || WHATSAPP;
  const phone = settings.phone.replace(/\s+/g, "");
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 print:hidden">
      <a
        href={`tel:${phone}`}
        aria-label="Call LK Chemicals"
        className="grid h-12 w-12 place-items-center rounded-full glass-dark text-cyan-hi hover:text-white hover-lift"
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href={waLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp LK Chemicals"
        className="relative grid h-14 w-14 place-items-center rounded-full bg-leaf text-ink shadow-[0_10px_40px_-10px_var(--leaf)] hover-lift"
      >
        <span className="absolute inset-0 rounded-full bg-leaf animate-pulse-soft opacity-40" aria-hidden />
        <MessageCircle className="relative h-6 w-6" />
      </a>
    </div>
  );
}