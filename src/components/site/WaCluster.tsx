import { useEffect, useRef, useState } from "react";
import { Mail, Phone, PhoneCall } from "lucide-react";
import { useSiteSettings } from "@/lib/content";
import { RequestCallDialog } from "./RequestCall";
import { WhatsAppIcon } from "./WhatsApp";

// Module-level so plain call sites (waLink in route files) pick up admin
// changes once the settings query resolves anywhere in the app.
let WHATSAPP = "919866600699";

export function waLink(msg = "Hi LK Chemicals, I would like to enquire.") {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

/* ------------------------------------------------------------------ action */

// Every floating action carries a permanent text label, not just an icon.
// Two of these are phones ("Call now" dials, "Request a call" books a call-back)
// and an icon alone could never tell them apart — visitors were tapping the
// wrong one. The label is the affordance; the icon only decorates it.
function ClusterAction({
  label,
  hint,
  icon,
  tone = "glass",
  onClick,
  href,
  external,
  tabIndex,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  tone?: "glass" | "whatsapp" | "accent";
  onClick?: () => void;
  href?: string;
  external?: boolean;
  tabIndex?: number;
}) {
  const shell =
    "wa-action group flex items-center gap-2.5 rounded-full pl-3.5 pr-2 py-2 min-h-12 " +
    "transition-transform duration-300 hover:-translate-y-0.5 focus-visible:-translate-y-0.5";
  const skin =
    tone === "whatsapp"
      ? "wa-action-whatsapp"
      : tone === "accent"
        ? "wa-action-accent"
        : "wa-action-glass";
  const body = (
    <>
      <span className="wa-action-label text-[12px] font-semibold whitespace-nowrap">{label}</span>
      <span className="wa-action-icon grid h-9 w-9 shrink-0 place-items-center rounded-full">
        {icon}
      </span>
    </>
  );
  const cls = `${shell} ${skin}`;
  if (href) {
    return (
      <a
        href={href}
        aria-label={hint}
        title={hint}
        tabIndex={tabIndex}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={cls}
      >
        {body}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={hint}
      title={hint}
      tabIndex={tabIndex}
      className={cls}
    >
      {body}
    </button>
  );
}

/* ----------------------------------------------------------------- cluster */

// Floating contact cluster. At the top of the page all four channels show with
// their labels; once the visitor scrolls, the stack collapses to the two
// primary ones (Call now + WhatsApp) so it never crowds the content.
export function WaCluster() {
  const { data: settings } = useSiteSettings();
  WHATSAPP = settings.whatsapp || WHATSAPP;
  const phone = settings.phone.replace(/\s+/g, "");

  const [scrolled, setScrolled] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const rafRef = useRef(0);

  // rAF-coalesced: Lenis fires scroll at display refresh, and a setState per
  // event is wasted work on every frame of every scroll.
  useEffect(() => {
    const update = () => {
      rafRef.current = 0;
      setScrolled(window.scrollY > 160);
    };
    const onScroll = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <div className="wa-cluster fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2.5 sm:right-6 sm:bottom-6">
        {/* Secondary channels — retire on scroll */}
        <div
          aria-hidden={scrolled}
          className={
            "flex flex-col items-end gap-2.5 transition-all duration-500 " +
            (scrolled
              ? "pointer-events-none max-h-0 translate-y-3 opacity-0 overflow-hidden"
              : "max-h-40 opacity-100")
          }
        >
          <ClusterAction
            label="Request a call"
            hint="Request a call back — leave your number and a preferred time"
            icon={<PhoneCall className="h-[18px] w-[18px]" />}
            onClick={() => setCallOpen(true)}
            tabIndex={scrolled ? -1 : 0}
          />
          <ClusterAction
            label="Email"
            hint="Email LK Chemicals"
            icon={<Mail className="h-[18px] w-[18px]" />}
            href={`mailto:${settings.email}?subject=${encodeURIComponent("Enquiry — LK Chemicals")}`}
            tabIndex={scrolled ? -1 : 0}
          />
        </div>

        {/* Primary channels — always available */}
        <ClusterAction
          label="Call now"
          hint={`Call LK Chemicals on ${settings.phone}`}
          icon={<Phone className="h-[18px] w-[18px]" />}
          href={`tel:${phone}`}
          tone="accent"
        />
        <ClusterAction
          label="WhatsApp"
          hint="Chat with LK Chemicals on WhatsApp"
          icon={<WhatsAppIcon className="h-[19px] w-[19px]" />}
          href={waLink()}
          external
          tone="whatsapp"
        />
      </div>

      <RequestCallDialog
        open={callOpen}
        onClose={() => setCallOpen(false)}
        source="floating-cluster"
      />
    </>
  );
}
