import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Clock, MapPin, Phone } from "lucide-react";
import { MicroLabel } from "@/components/site/GhostWord";
import { LiquidButton } from "@/components/site/LiquidButton";
import { WhatsAppButton } from "@/components/site/WhatsApp";
import { useSiteSettings, useWaLink } from "@/lib/content";
import { mapsDirectionsUrl } from "@/lib/maps";
import { telHref } from "@/lib/contact";
import { ORG_ID, breadcrumbLd, canonicalUrl, ldJson } from "@/lib/seo";

// Local landing page for "water treatment chemicals Hyderabad" searches.
// Every fact here already appears elsewhere on the site (home, about, contact,
// product and service pages); nothing is invented. Keep it that way.

const PATH = "/water-treatment-chemicals-hyderabad";
const TITLE = "Water Treatment Chemicals in Hyderabad | LK Chemicals";
const DESCRIPTION =
  "Buy water treatment chemicals in Hyderabad direct from the manufacturer: RO antiscalants, RO cleaners, boiler, cooling tower, descaling, ETP & STP chemicals. Own plant in Cherlapally, since 2013, ISO 9001:2015.";

export const Route = createFileRoute("/water-treatment-chemicals-hyderabad")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: HyderabadPage,
});

type Item = { name: string; to: string };

const PRODUCT_GROUPS: { title: string; body: string; items: Item[] }[] = [
  {
    title: "RO plant chemicals",
    body: "Antiscalants that keep salts and silica in solution, pH boosters, and low- and high-pH membrane cleaners for RO plants of every size.",
    items: [
      { name: "LK 1001 RO Antiscalant", to: "/products/lk-1001-ro-antiscalant" },
      { name: "LK Chem 1010 Antiscalant", to: "/products/lk-chem-1010-antiscalant" },
      { name: "Scale Master LK 5010", to: "/products/scale-master-lk-5010-antiscalant" },
      { name: "Scale Master LK 5020", to: "/products/scale-master-lk-5020-antiscalant" },
      { name: "LK 1044 RO pH Booster", to: "/products/lk-1044-ro-ph-booster" },
      {
        name: "LK Chem 1055 Low-pH RO Cleaner",
        to: "/products/lk-chem-1055-low-ph-ro-cleaning-chemicals",
      },
      {
        name: "LK Chem 1066 High-pH RO Cleaner",
        to: "/products/lk-chem-1066-high-ph-ro-cleaning-chemicals",
      },
    ],
  },
  {
    title: "Boiler water chemicals",
    body: "Oxygen scavengers, pH boosters and multi-functional treatments that protect boiler tubes from corrosion and scale.",
    items: [
      {
        name: "LK 2044 Catalyzed Oxygen Scavenger",
        to: "/products/lk-2044-boiler-catalyzed-oxygen-scavenger",
      },
      { name: "LK Chem 2011 Boiler pH Booster", to: "/products/lk-chem-2011-boiler-ph-booster" },
      {
        name: "LK Chem 2001 Multi-Functional Chemical",
        to: "/products/lk-chem-2001-multi-functional-chemical",
      },
      { name: "LK Chem 2022 Antiscalant", to: "/products/lk-chem-2022-antiscalant" },
    ],
  },
  {
    title: "Cooling tower, chiller & descaling",
    body: "Antiscalants for cooling and chiller circuits, pH boosters, and descaling compounds that remove hard scale from heat exchangers and lines.",
    items: [
      { name: "LK Chem 3001 Antiscalant", to: "/products/lk-chem-3001-antiscalant" },
      { name: "LK Chem 3033 Antiscalant", to: "/products/lk-chem-3033-antiscalant" },
      { name: "LK Chem 555 pH Booster", to: "/products/lk-chem-555-ph-booster" },
      { name: "LK Chem 99 De-scaling Compound", to: "/products/lk-chem-99-de-scaling-compound" },
    ],
  },
];

const SERVICES: Item[] = [
  { name: "Plant services", to: "/services/plant-services" },
  { name: "Cleaning services", to: "/services/cleaning-services" },
  { name: "Descaling services", to: "/services/descaling-services" },
  { name: "Boiler descaling", to: "/services/descaling-services/boiler-descaling" },
  { name: "Installation & upgradation", to: "/services/installation-upgradation-services" },
  { name: "AMC & technical support", to: "/services/amc-technical-support" },
];

const INDUSTRIES = [
  "Power plants",
  "Pharmaceutical",
  "Steel",
  "Aluminium",
  "Paper mills",
  "Sugar mills",
  "IT parks & offices",
  "Hotels & hospitality",
  "Hospitals",
  "Food & beverage",
  "Textile",
  "Apartments & communities",
];

function faqs(phone: string) {
  return [
    {
      q: "Can I collect water treatment chemicals from your Hyderabad plant?",
      a: `Yes. The plant and office are at Plot No. 157, Officers Colony, Cherlapally, Hyderabad 500 051, open Monday to Saturday, 9:30 am to 6:00 pm. Call or WhatsApp ${phone} before you come so the order is ready.`,
    },
    {
      q: "What do I need to share to get the right chemical and dosage?",
      a: "A recent water analysis (or a photo of it), the type of system (RO, boiler, cooling tower or chiller) and its capacity. The technical team replies within one business day with the product and dosage.",
    },
    {
      q: "Do you deliver across Telangana and to other states?",
      a: "Yes. LK Chemicals supplies and services plants across Telangana, Andhra Pradesh, Karnataka, Tamil Nadu and Maharashtra.",
    },
    {
      q: "Can your team clean or descale our plant on site?",
      a: "Yes. LK Chemicals provides RO membrane cleaning, boiler and heat-exchanger descaling, plant installation and upgradation, and annual maintenance contracts.",
    },
  ];
}

function HyderabadPage() {
  const { data: s } = useSiteSettings();
  const waHref = useWaLink();
  const list = faqs(s.phone);

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${canonicalUrl(PATH)}#service`,
        name: "Water treatment chemicals in Hyderabad",
        serviceType: "Water treatment chemicals manufacturing and supply",
        url: canonicalUrl(PATH),
        description: DESCRIPTION,
        provider: { "@id": ORG_ID },
        areaServed: [
          { "@type": "City", name: "Hyderabad" },
          { "@type": "State", name: "Telangana" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: list.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      (({ "@context": _ctx, ...crumbs }) => crumbs)(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Water treatment chemicals in Hyderabad", path: PATH },
        ]),
      ),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(ld) }} />

      {/* Hero */}
      <section className="section-dark relative pt-32 sm:pt-40 pb-16 overflow-hidden">
        <div className="absolute inset-0 caustics opacity-40" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-white/50 mb-6">
            <Link to="/" className="hover:text-cyan-hi">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/70">Water treatment chemicals in Hyderabad</span>
          </nav>
          <MicroLabel n="01">Hyderabad · Cherlapally plant</MicroLabel>
          <h1
            className="display-xl mt-6 text-white text-balance max-w-4xl"
            style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)" }}
          >
            Water treatment chemicals in Hyderabad
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/75 leading-relaxed">
            LK Chemicals Pvt. Ltd. manufactures and supplies water treatment chemicals from its own
            plant in Cherlapally, Hyderabad. Since 2013 we have made RO antiscalants and membrane
            cleaners, boiler, cooling tower, chiller and descaling chemicals, and ETP and STP
            chemicals, under an ISO 9001:2015 quality system.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppButton href={waHref()}>WhatsApp us</WhatsAppButton>
            <LiquidButton href={telHref(s.phone)} variant="ghost">
              Call {s.phone}
            </LiquidButton>
          </div>
        </div>
      </section>

      {/* Why buy from the manufacturer */}
      <section className="section-light py-20 md:py-24" aria-labelledby="why-local">
        <div className="mx-auto max-w-7xl px-6 md:px-8 grid lg:grid-cols-[2fr_3fr] gap-10 lg:gap-16">
          <div>
            <MicroLabel n="02" className="!text-royal">
              Direct from the plant
            </MicroLabel>
            <h2
              id="why-local"
              className="display-xl mt-6 text-balance"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
            >
              A Hyderabad manufacturer, not a trader
            </h2>
          </div>
          <ul className="grid sm:grid-cols-2 gap-6 text-foreground/80 leading-relaxed">
            <li>
              <strong className="block text-foreground">Own plant in Cherlapally</strong>
              Chemicals are made in Hyderabad at about 10 tons a month, with a batch record for
              every batch.
            </li>
            <li>
              <strong className="block text-foreground">More than 70 products</strong>
              RO, boiler, cooling tower, chiller, descaling, resin cleaning, AHU coil cleaning, ETP
              and STP chemicals.
            </li>
            <li>
              <strong className="block text-foreground">Chemistry matched to your water</strong>
              Send a water analysis and the technical team replies within one business day with the
              product and dosage.
            </li>
            <li>
              <strong className="block text-foreground">Chemicals plus on-site service</strong>
              Membrane cleaning, descaling, plant installation and AMC from the same team.
            </li>
          </ul>
        </div>
      </section>

      {/* Products */}
      <section
        className="section-light py-20 md:py-24 border-t border-foreground/10"
        aria-labelledby="products-hyd"
      >
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="03" className="!text-royal">
            Products
          </MicroLabel>
          <h2
            id="products-hyd"
            className="display-xl mt-6 text-balance"
            style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
          >
            Water chemicals we supply in Hyderabad
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-8">
            {PRODUCT_GROUPS.map((g) => (
              <div key={g.title} className="rounded-2xl border border-foreground/10 p-6">
                <h3 className="text-xl font-semibold text-foreground">{g.title}</h3>
                <p className="mt-2 text-foreground/70 leading-relaxed">{g.body}</p>
                <ul className="mt-4 space-y-2">
                  {g.items.map((it) => (
                    <li key={it.to}>
                      <Link
                        to={it.to}
                        className="inline-flex items-center gap-1 text-royal hover:underline underline-offset-4"
                      >
                        {it.name}
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-8">
            <Link
              to="/products"
              className="text-royal font-medium hover:underline underline-offset-4"
            >
              See the full product catalogue, including ETP and STP chemicals →
            </Link>
          </p>
        </div>
      </section>

      {/* Services + industries */}
      <section className="section-dark py-20 md:py-24" aria-labelledby="services-hyd">
        <div className="mx-auto max-w-7xl px-6 md:px-8 grid lg:grid-cols-2 gap-12">
          <div>
            <MicroLabel n="04">Services</MicroLabel>
            <h2
              id="services-hyd"
              className="display-xl mt-6 text-white text-balance"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
            >
              On-site water treatment services
            </h2>
            <ul className="mt-8 grid sm:grid-cols-2 gap-3">
              {SERVICES.map((sv) => (
                <li key={sv.to}>
                  <Link
                    to={sv.to}
                    className="flex items-center justify-between gap-2 rounded-xl border border-white/10 px-4 py-3 text-white/85 hover:border-cyan-hi hover:text-cyan-hi transition-colors"
                  >
                    {sv.name}
                    <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <MicroLabel n="05">Industries</MicroLabel>
            <h2
              className="display-xl mt-6 text-white text-balance"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
            >
              Who buys from us
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed">
              More than a hundred plants across Telangana, Andhra Pradesh, Karnataka, Tamil Nadu and
              Maharashtra.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {INDUSTRIES.map((n) => (
                <li
                  key={n}
                  className="rounded-full border border-white/15 px-3 py-1 text-sm text-white/80"
                >
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ + visit */}
      <section className="section-light py-20 md:py-24" aria-labelledby="faq-hyd">
        <div className="mx-auto max-w-7xl px-6 md:px-8 grid lg:grid-cols-[3fr_2fr] gap-12">
          <div>
            <MicroLabel n="06" className="!text-royal">
              Questions
            </MicroLabel>
            <h2
              id="faq-hyd"
              className="display-xl mt-6 text-balance"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
            >
              Buying water chemicals in Hyderabad
            </h2>
            <div className="mt-8 divide-y divide-foreground/10 border-y border-foreground/10">
              {list.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-royal [&::-webkit-details-marker]:hidden">
                    <span className="text-base md:text-lg">{f.q}</span>
                    <ArrowDown className="mt-1 h-4 w-4 shrink-0 text-royal transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                  </summary>
                  <p className="mt-3 max-w-2xl text-foreground/75 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <aside className="rounded-2xl border border-foreground/10 p-6 self-start">
            <h2 className="text-xl font-semibold text-foreground">Visit or call</h2>
            <ul className="mt-4 space-y-4 text-foreground/80">
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-royal" aria-hidden />
                <span>{s.address}</span>
              </li>
              <li className="flex gap-3">
                <Clock className="h-5 w-5 shrink-0 text-royal" aria-hidden />
                <span>{s.hours}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-5 w-5 shrink-0 text-royal" aria-hidden />
                <a href={telHref(s.phone)} className="hover:text-royal">
                  {s.phone}
                </a>
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={mapsDirectionsUrl(s)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-royal font-medium hover:underline underline-offset-4"
              >
                Get directions <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
              <Link
                to="/contact"
                className="text-royal font-medium hover:underline underline-offset-4"
              >
                Send an enquiry →
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
