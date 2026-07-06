import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock, User, Navigation } from "lucide-react";
import { MicroLabel, GhostWord } from "@/components/site/GhostWord";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { LiquidButton } from "@/components/site/LiquidButton";
import { waLink } from "@/components/site/WaCluster";
import { Waterline } from "@/components/site/Waterline";
import { useSiteSettings } from "@/lib/content";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — LK Chemicals, Hyderabad" },
      { name: "description", content: "Reach LK Chemicals Pvt. Ltd. — Plot No. 58, Phase-2, EC Nagar, Cherlapally, Hyderabad. Phone +91 98666 00699." },
      { property: "og:title", content: "Contact LK Chemicals" },
      { property: "og:description", content: "Phone, WhatsApp, email and our Cherlapally address." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: s } = useSiteSettings();
  return (
    <>
      <section className="section-dark relative pt-32 sm:pt-40 pb-16 overflow-hidden">
        <div className="absolute inset-0 caustics opacity-40" />
        <GhostWord className="absolute top-28 right-0 !text-[11vw] opacity-60">CONTACT</GhostWord>
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="00">Open a channel</MicroLabel>
          <h1 className="display-xl mt-4 grad-text" style={{ fontSize: "clamp(3rem, 12vw, 9rem)" }}>Let's talk.</h1>
          <p className="mt-6 max-w-xl text-white/70">Shiva Krishna picks up the phone himself. Or send a note — we reply within a business day.</p>
        </div>
      </section>

      <Waterline />

      <section className="section-dark py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8 grid lg:grid-cols-2 gap-14">
          <div className="grid gap-4 content-start">
            <Card icon={<MapPin className="h-4 w-4"/>} label="Address">
              {s.address}
            </Card>
            <Card icon={<User className="h-4 w-4"/>} label="Contact person">
              {s.contactPerson}<br />
              <span className="text-white/50">{s.contactRole}</span>
            </Card>
            <Card icon={<Phone className="h-4 w-4"/>} label="Phone">
              <a className="hover:text-cyan-hi" href={`tel:${s.phone.replace(/\s+/g, "")}`}>{s.phone}</a>
            </Card>
            <Card icon={<Mail className="h-4 w-4"/>} label="Email">
              <a className="hover:text-cyan-hi" href={`mailto:${s.email}`}>{s.email}</a>
            </Card>
            <Card icon={<Clock className="h-4 w-4"/>} label="Hours">
              {s.hours}<br />
              <span className="text-white/50">Emergency: 24/7 WhatsApp</span>
            </Card>
            <div className="glass-dark rounded-2xl p-5 flex items-center justify-between gap-4 hover-lift">
              <div>
                <div className="micro-label">WhatsApp direct</div>
                <div className="text-white mt-1">Typically replies within minutes <span className="inline-block h-2 w-2 rounded-full bg-leaf animate-pulse-soft ml-1 align-middle" /></div>
              </div>
              <LiquidButton href={waLink()} external variant="leaf">Chat now</LiquidButton>
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

function Card({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="glass-dark rounded-2xl p-5 hover-lift">
      <div className="micro-label flex items-center gap-2 text-cyan-hi">{icon}{label}</div>
      <div className="mt-2 text-white/90 leading-relaxed">{children}</div>
    </div>
  );
}

/* =============== SIGNATURE MAP ===============
   Custom-styled cartographic canvas — deep-water aesthetic,
   pulsing droplet pin, glass info card, hard-linked to Google Maps.
*/
function MapInfoCard({ address, directionsUrl, viewUrl }: { address: string; directionsUrl: string; viewUrl: string }) {
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
            <h2 className="display-xl mt-2 grad-text" style={{ fontSize: "clamp(1.75rem, 5vw, 3.5rem)" }}>
              17.4948° N · 78.5719° E
            </h2>
          </div>
          <div className="hidden md:block ghost-word text-[8vw]">MAP</div>
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

          {/* Info card — mobile, in normal flow under the map */}
          <div className="sm:hidden p-5 border-t border-white/10">
            <MapInfoCard address={s.address} directionsUrl={directionsUrl} viewUrl={viewUrl} />
          </div>
        </div>
      </div>
    </section>
  );
}