import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock, User, Navigation, ArrowUpRight } from "lucide-react";
import { MicroLabel, GhostWord } from "@/components/site/GhostWord";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { RequestCallButton } from "@/components/site/RequestCall";
import { WhatsAppButton } from "@/components/site/WhatsApp";
import { LiquidButton } from "@/components/site/LiquidButton";
import { waLink } from "@/components/site/WaCluster";
import { Waterline } from "@/components/site/Waterline";
import { useSiteSettings } from "@/lib/content";
import { useContactContent } from "@/lib/pages";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — LK Chemicals, Hyderabad" },
      {
        name: "description",
        content:
          "Reach LK Chemicals Pvt. Ltd. — Plot No. 157, Officers Colony, Cherlapally, Hyderabad. Phone +91 98666 00699.",
      },
      { property: "og:title", content: "Contact LK Chemicals" },
      {
        property: "og:description",
        content: "Phone, WhatsApp, email and our Cherlapally address.",
      },
    ],
  }),
  component: ContactPage,
});

// Cosmetic variants of the same address ("Phase-2" / "Phase-II") shouldn't
// render twice.
const normAddr = (v: string) =>
  v
    .toLowerCase()
    .replace(/phase[\s-]*ii/g, "phase 2")
    .replace(/[^a-z0-9]/g, "");

function ContactPage() {
  const { data: s } = useSiteSettings();
  const { data: c } = useContactContent();
  const showAddress2 = Boolean(s.address2 && normAddr(s.address2) !== normAddr(s.address));
  return (
    <>
      <section className="section-dark relative pt-32 sm:pt-40 pb-16 overflow-hidden">
        <div className="absolute inset-0 caustics opacity-40" />
        {/* Bottom-anchored and desktop-only: at the old top position it sat
            right on the section label and read as a broken overlap on phones. */}
        <GhostWord className="hidden md:block absolute bottom-0 right-0 !text-[11vw] opacity-60">
          CONTACT
        </GhostWord>
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="00">Open a channel</MicroLabel>
          <h1 className="display-xl mt-4 grad-text" style={{ fontSize: "clamp(3rem, 12vw, 9rem)" }}>
            {c.heroHeading}
          </h1>
          <p className="mt-6 max-w-xl text-white/70">{c.heroBody}</p>
        </div>
      </section>

      <Waterline />

      <section className="section-dark py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8 grid lg:grid-cols-2 gap-14">
          <div className="grid gap-4 content-start">
            <Card icon={<MapPin className="h-4 w-4" />} label="Address">
              {/* Every address opens Google Maps — the arrow makes that obvious
                  rather than leaving the text looking like plain copy. */}
              <AddressLink query={s.mapQuery} label={s.address} />
              {showAddress2 && (
                <div className="mt-2">
                  <span className="text-white/50">Unit: </span>
                  <AddressLink query={s.address2!} label={s.address2!} muted />
                </div>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.mapQuery)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-cyan-hi/30 bg-cyan-hi/10 px-4 py-2 text-xs font-medium text-cyan-hi transition-colors hover:bg-cyan-hi hover:text-ink"
              >
                <Navigation className="h-3.5 w-3.5" /> Get directions
              </a>
            </Card>
            <Card icon={<User className="h-4 w-4" />} label="Contact person">
              {s.contactPerson}
              <br />
              <span className="text-white/50">{s.contactRole}</span>
            </Card>
            <Card icon={<Phone className="h-4 w-4" />} label="Phone">
              {[s.phone, s.phone2, s.phone3].filter(Boolean).map((p, i) => (
                <span key={p}>
                  {i > 0 && <br />}
                  <a className="hover:text-cyan-hi" href={`tel:${p!.replace(/\s+/g, "")}`}>
                    {p}
                  </a>
                </span>
              ))}
            </Card>
            <Card icon={<Mail className="h-4 w-4" />} label="Email">
              {[s.email, s.email2].filter(Boolean).map((e, i) => (
                <span key={e}>
                  {i > 0 && <br />}
                  <a className="hover:text-cyan-hi" href={`mailto:${e}`}>
                    {e}
                  </a>
                </span>
              ))}
            </Card>
            <Card icon={<Clock className="h-4 w-4" />} label="Hours">
              {s.hours}
              <br />
              <span className="text-white/50">Emergency: 24/7 WhatsApp</span>
            </Card>
            <div className="glass-dark rounded-2xl p-5 flex items-center justify-between gap-4 hover-lift">
              <div>
                <div className="micro-label">WhatsApp direct</div>
                <div className="text-white mt-1">
                  Typically replies within minutes{" "}
                  <span className="inline-block h-2 w-2 rounded-full bg-leaf animate-pulse-soft ml-1 align-middle" />
                </div>
              </div>
              <WhatsAppButton href={waLink()}>WhatsApp</WhatsAppButton>
            </div>
            <div className="glass-dark rounded-2xl p-5 flex items-center justify-between gap-4 hover-lift">
              <div>
                <div className="micro-label">Prefer we call you?</div>
                <div className="text-white mt-1">Pick a time — an engineer calls back.</div>
              </div>
              <RequestCallButton source="contact-page" />
            </div>
          </div>
          <div>
            <EnquiryForm source="contact-page" />
          </div>
        </div>
      </section>

      {/* Signature map — custom branded coordinates */}
      <SignatureMap />
    </>
  );
}

/** An address that reads as a link and opens Google Maps in a new tab. */
function AddressLink({ query, label, muted }: { query: string; label: string; muted?: boolean }) {
  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
      target="_blank"
      rel="noreferrer"
      className={
        "group inline decoration-cyan-hi/40 underline-offset-4 hover:underline hover:text-cyan-hi transition-colors " +
        (muted ? "text-white/50" : "")
      }
    >
      {label}
      <ArrowUpRight className="ml-1 inline h-3.5 w-3.5 shrink-0 align-[-2px] text-cyan-hi opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

function Card({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-dark rounded-2xl p-5 hover-lift">
      <div className="micro-label flex items-center gap-2 text-cyan-hi">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-white/90 leading-relaxed">{children}</div>
    </div>
  );
}

/* =============== SIGNATURE MAP ===============
   Custom-styled cartographic canvas — deep-water aesthetic,
   pulsing droplet pin, glass info card, hard-linked to Google Maps.
*/
function MapInfoCard({
  address,
  directionsUrl,
  viewUrl,
  compact,
}: {
  address: string;
  directionsUrl: string;
  viewUrl: string;
  /** Mobile: the address is already shown in the cards above — buttons only. */
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex gap-2">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-cyan-hi text-ink px-4 py-2 text-sm font-medium hover:brightness-110 transition"
        >
          <Navigation className="h-4 w-4" /> Directions
        </a>
        <a
          href={viewUrl}
          target="_blank"
          rel="noreferrer"
          className="flex-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 text-white/85 px-4 py-2 text-sm hover:border-cyan-hi hover:text-white transition"
        >
          Google Maps
        </a>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-hi/15 text-cyan-hi shrink-0">
        <MapPin className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="micro-label">Cherlapally works</div>
        <div className="mt-1 text-white font-medium leading-snug">{address}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cyan-hi text-ink px-4 py-2 text-sm font-medium hover:brightness-110 transition"
          >
            <Navigation className="h-4 w-4" /> Directions
          </a>
          <a
            href={viewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 text-white/85 px-4 py-2 text-sm hover:border-cyan-hi hover:text-white transition"
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}

function SignatureMap() {
  const { data: s } = useSiteSettings();
  const { data: c } = useContactContent();
  const q = encodeURIComponent(s.mapQuery);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
  const viewUrl = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const embedUrl = `https://www.google.com/maps?q=${q}&output=embed`;
  return (
    <section className="section-dark pb-24">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <MicroLabel n="10">Reach us</MicroLabel>
            <h2
              className="display-xl mt-2 grad-text"
              style={{ fontSize: "clamp(1.75rem, 5vw, 3.5rem)" }}
            >
              {c.coordinates}
            </h2>
          </div>
          <div className="hidden md:block ghost-word text-[clamp(2rem,8vw,7rem)]">MAP</div>
        </div>

        {/* Mobile: card stacks below the map (never covers it). Desktop: glass
            card floats over the map's bottom-left. */}
        <div className="rounded-3xl overflow-hidden glass-dark">
          <div className="relative aspect-[4/3] sm:aspect-[16/8]">
            <iframe
              title="LK Chemicals location map"
              src={embedUrl}
              className="absolute inset-0 h-full w-full grayscale-[15%] contrast-[1.05]"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Glass info card — desktop overlay */}
            <div className="hidden sm:block absolute left-6 bottom-6 max-w-sm glass-dark rounded-2xl p-6">
              <MapInfoCard address={s.address} directionsUrl={directionsUrl} viewUrl={viewUrl} />
            </div>

            {/* Corner brand mark */}
            <div className="absolute top-4 right-4 glass rounded-full px-3 py-1.5 micro-label text-white/80">
              LKC · MAP
            </div>
          </div>

          {/* Mobile: just the two actions — the address cards above already
              carry the full address, repeating it here read as clutter. */}
          <div className="sm:hidden p-4 border-t border-white/10">
            <MapInfoCard
              address={s.address}
              directionsUrl={directionsUrl}
              viewUrl={viewUrl}
              compact
            />
          </div>
        </div>
      </div>
    </section>
  );
}
