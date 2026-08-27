// Editable page content — the built-in fallback used when Firestore has no
// override, and the source for the admin "Website content" editor.
//
// Mirrors the pattern in src/data/content.ts: every field here is a default
// that the public site renders instantly. The admin can override any of it by
// saving a matching Firestore doc under the `pages` collection (see
// src/lib/pages.ts). An empty/unreachable Firestore keeps these built-ins, so
// the public site can never go blank.
import plant from "@/assets/plant.jpg";
import lab from "@/assets/lab.jpg";
import droplet from "@/assets/droplet.jpg";
import ro from "@/assets/ro-membrane.jpg";
import boiler from "@/assets/boiler.jpg";
import ct from "@/assets/cooling-tower.jpg";
import drum from "@/assets/drum.jpg";
import resin from "@/assets/resin.jpg";
import hero from "@/assets/hero-depth.jpg";

/* ------------------------------------------------------------------ types */

export type Stat = { value: number; suffix: string; label: string };
export type Industry = { name: string; icon: string };
export type JourneyStep = { title: string; body: string; img: string };
export type WhyItem = { title: string; body: string; img?: string; highlight?: boolean };
export type Milestone = { year: string; title: string; body: string };
export type ValueItem = { title: string; body: string; img: string };
export type Facility = { title: string; body: string; img: string };
export type ProcessStep = { title: string; body: string };

export type GlobalContent = {
  brandName: string;
  brandLine: string;
  footerBlurb: string;
  footerNote: string;
};

export type HomeContent = {
  heroLabel: string;
  heroTitleTop: string;
  heroTitleBottom: string;
  heroSubtitle: string;
  heroImage: string;
  whoLabel: string;
  whoGhost: string;
  whoHeadingLead: string;
  whoHeadingAccent: string;
  whoBody: string;
  stats: Stat[];
  whoImages: string[];
  makeHeading: string;
  serviceHeadingLead: string;
  serviceHeadingAccent: string;
  serviceSubtitle: string;
  whereHeading: string;
  whereSubtitle: string;
  industries: Industry[];
  journeyHeading: string;
  journeySubtitle: string;
  journey: JourneyStep[];
  whyHeadingLead: string;
  whyHeadingAccent: string;
  whyItems: WhyItem[];
  certs: string[];
  plantHeading: string;
  plantImages: string[];
  plantCapacity: string;
  plantCapacityLabel: string;
  plantLocation: string;
  talkHeadingTop: string;
  talkHeadingBottom: string;
  talkBody: string;
};

/** A number worth putting on the wall — "12+ years", "150+ plants served". */
export type Achievement = { value: string; label: string; body?: string };

/** An ISO certificate, test report or approval, with a scan to enlarge. */
export type Credential = {
  title: string;
  issuer?: string;
  year?: string;
  body?: string;
  /** Scan or photo of the certificate / trophy. */
  img?: string;
  /** The certificate itself, uploaded from the dashboard. Renders View and
   * Download actions on the About page; nothing is hard-coded, so a document
   * added tomorrow appears without a deploy. */
  pdf?: string;
};

export type AboutContent = {
  heroLabel: string;
  heroHeading: string;
  heroBody: string;
  heroImage: string;
  milestones: Milestone[];
  missionLead: string;
  missionAccent: string;
  missionTail: string;
  visionText: string;
  facilities: Facility[];
  values: ValueItem[];
  /** Headline numbers — proof at a glance. */
  achievementsHeading?: string;
  achievements?: Achievement[];
  /** ISO certificates, approvals and test reports. */
  certificationsHeading?: string;
  certificationsBody?: string;
  certifications?: Credential[];
  /** Awards and recognitions. */
  awardsHeading?: string;
  awards?: Credential[];
  teamHeading: string;
  teamBody: string;
  ctaHeading: string;
  ctaBody: string;
};

export type ServicesContent = {
  heroTitleTop: string;
  heroTitleBottom: string;
  processHeading: string;
  processSteps: ProcessStep[];
};

export type ProductsContent = {
  heroHeading: string;
  heroSubtitle: string;
  heroImage: string;
};

export type GalleryContent = {
  heroHeading: string;
};

export type ContactContent = {
  heroHeading: string;
  heroBody: string;
  /** @deprecated The map heading now renders the address from Site settings.
   * Kept so existing `pages/contact` documents keep type-checking. */
  coordinates?: string;
  /** Google Maps embed — the Share → "Embed a map" URL (or full iframe HTML). */
  mapEmbed: string;
};

/* --------------------------------------------------------------- defaults */

export const globalContent: GlobalContent = {
  brandName: "LK Chemicals Pvt. Ltd.",
  brandLine: "Since 2013 · Hyderabad · An ISO 9001:2015 Company",
  footerBlurb:
    "Water treatment chemicals, plants and services engineered in Hyderabad and supplied across Telangana, Andhra Pradesh, Karnataka, Tamil Nadu and Maharashtra.",
  footerNote: "We provide the best water treatment solution.",
};

export const homeContent: HomeContent = {
  heroLabel: "The depth · Hyderabad · Since 2013",
  heroTitleTop: "WE ENGINEER",
  heroTitleBottom: "WATER.",
  heroSubtitle:
    "Industrial water treatment chemicals, plants and services — manufactured in Hyderabad since 2013 for power, pharma, steel, paper, sugar mills and beyond.",
  heroImage: hero,
  whoLabel: "Who we are",
  whoGhost: "SINCE 2013",
  whoHeadingLead: "Hyderabad's specialist in",
  whoHeadingAccent: "industrial water chemistry.",
  whoBody:
    "We formulate, manufacture and support the chemistry that keeps membranes clean, boilers efficient and cooling systems reliable. Every consignment leaves our Cherlapally plant with a certificate of analysis and a named technical contact.",
  stats: [
    { value: 13, suffix: "+ yrs", label: "In water treatment" },
    { value: 10, suffix: " T", label: "per month capacity" },
    { value: 12, suffix: "", label: "Industries served" },
    { value: 70, suffix: "+", label: "Products & formulations" },
  ],
  whoImages: [plant, lab, droplet],
  makeHeading: "Every category. One formulary.",
  serviceHeadingLead: "We don't just supply.",
  serviceHeadingAccent: "We service.",
  serviceSubtitle:
    "Every product we supply is backed by our own field team — qualified engineers, dedicated vehicles and documented procedures that keep your plant running to specification.",
  whereHeading: "Twelve industries. One chemistry.",
  whereSubtitle:
    "Supplying and servicing across Telangana, Andhra Pradesh, Karnataka, Tamil Nadu and Maharashtra.",
  industries: [
    { name: "Power Plants", icon: "Zap" },
    { name: "Pharmaceutical", icon: "FlaskConical" },
    { name: "Steel", icon: "Factory" },
    { name: "Aluminium", icon: "Layers" },
    { name: "Paper Mills", icon: "Scroll" },
    { name: "Sugar Mills", icon: "Wheat" },
    { name: "IT Parks & Offices", icon: "Laptop" },
    { name: "Hotels & Hospitality", icon: "Hotel" },
    { name: "Hospitals", icon: "Stethoscope" },
    { name: "Food & Beverage", icon: "Utensils" },
    { name: "Textile", icon: "Shirt" },
    { name: "Apartments & Communities", icon: "Building2" },
  ],
  journeyHeading: "Follow the drop.",
  journeySubtitle:
    "A single droplet's journey through an industrial water train — and the chemistry that keeps it moving.",
  journey: [
    {
      title: "Intake",
      body: "Raw water arrives — bore, municipal or process reject.",
      img: droplet,
    },
    { title: "Dosing", body: "Antiscalants and pH boosters injected in precise ppm.", img: lab },
    {
      title: "RO Membrane",
      body: "Salts and silica held in solution; permeate flows through.",
      img: ro,
    },
    {
      title: "Boiler / Loop",
      body: "Oxygen scavenged, alkalinity held, scale prevented.",
      img: boiler,
    },
    { title: "Pure Output", body: "Water fit for production. Cycles repeat.", img: hero },
  ],
  whyHeadingLead: "Chemistry you can",
  whyHeadingAccent: "standardise on.",
  whyItems: [
    {
      title: "Innovative solutions",
      body: "We develop formulations around each plant’s water chemistry and operating conditions, and test every batch against its technical data sheet before despatch.",
      img: lab,
      highlight: true,
    },
    {
      title: "Defined service standards",
      body: "Scope, dosing and acceptance criteria are agreed in writing, then measured against on every visit.",
    },
    {
      title: "Qualified technical teams",
      body: "Trained engineers dedicated to RO, DM, softener, boiler and descaling operations.",
    },
    {
      title: "Proven across industries",
      body: "Power, pharmaceutical, steel, aluminium, paper and sugar, IT campuses and hospitality — across Telangana, Andhra Pradesh, Karnataka, Tamil Nadu and Maharashtra.",
    },
    {
      title: "Competitive total cost",
      body: "We compete on chemistry, service response and total cost of treatment — reviewed with you contract by contract.",
      img: plant,
      highlight: true,
    },
    {
      title: "Long-term reliability",
      body: "Continuous supply and service contracts with pharmaceutical and power customers since 2014.",
    },
  ],
  certs: [
    "ISO 9001:2015",
    "GMP Certified",
    "Food-Grade Antiscalants",
    "Scale Master RO Antiscalants",
    "Minara",
    "Master Clean",
    "MSME Registered",
    "GST Compliant",
    "REACH Aware",
    "Batch Certified",
  ],
  plantHeading: "Inside Cherlapally.",
  plantImages: [plant, lab, droplet, hero],
  plantCapacity: "10 T",
  plantCapacityLabel: "Monthly capacity",
  plantLocation: "Phase-2, EC Nagar, Cherlapally",
  talkHeadingTop: "LET'S SOLVE",
  talkHeadingBottom: "YOUR WATER.",
  talkBody:
    "Share your water analysis or a short brief and our technical team will respond within one business day — by email, WhatsApp or phone.",
};

export const aboutContent: AboutContent = {
  heroLabel: "About · Est. 2013 · An ISO 9001:2015 Company",
  heroHeading: "The story of a formula.",
  heroBody:
    "LK Chemicals began in 2013 with a single plant and one water problem to solve. More than a decade on, the same engineering discipline supports over a hundred plants across five states.",
  heroImage: plant,
  milestones: [
    {
      year: "2013",
      title: "Founded in Hyderabad",
      body: "Shiva Krishna Kangadekar starts LK Chemicals, supplying water treatment chemicals to local industry.",
    },
    {
      year: "2015",
      title: "Scale Master RO range",
      body: "Food-grade Scale Master RO antiscalants — LK 1001, LK 1010, LK 5001 — enter series manufacturing.",
    },
    {
      year: "2017",
      title: "Cherlapally facility",
      body: "EC Nagar plant commissioned; the boiler (LK 2000) and cooling tower (LK 3000) formularies are added.",
    },
    {
      year: "2019",
      title: "Service arm launched",
      body: "In-house descaling, CIP and plant maintenance crews for RO, boiler, cooling tower, softener and DM plants.",
    },
    {
      year: "2022",
      title: "Plants & projects",
      body: "RO, DM, softener, ETP and STP plant installations grow across Telangana, AP, Karnataka, Tamil Nadu and Maharashtra.",
    },
    {
      year: "2024",
      title: "LK Chemicals Pvt. Ltd.",
      body: "Incorporated as LK Chemicals Pvt. Ltd. (formerly LK Chemicals) — ISO 9001:2015, 70+ products, 10 tons a month.",
    },
  ],
  missionLead: "To make Indian industry's water",
  missionAccent: "cleaner, safer and cheaper to treat",
  missionTail: "— one formulated drum at a time.",
  visionText: "To become South India's most trusted name in industrial water chemistry.",
  facilities: [
    {
      title: "Manufacturing",
      img: plant,
      body: "Blending, reactor and dosing lines under a single roof at Cherlapally.",
    },
    {
      title: "Quality Control",
      img: lab,
      body: "Every batch tested for pH, density, active content and appearance.",
    },
    {
      title: "Packaging",
      img: drum,
      body: "25 kg jerry cans to 1 ton IBCs — food-grade, UN-approved drums.",
    },
    {
      title: "Warehouse",
      img: plant,
      body: "Racked bulk storage, FIFO despatch, transporter-agnostic loading bay.",
    },
    {
      title: "Technical Support",
      img: lab,
      body: "In-house chemists for formulation and dosing queries; field engineers for on-site support.",
    },
  ],
  values: [
    { title: "Integrity", body: "Published specifications we are accountable to.", img: lab },
    { title: "Chemistry", body: "Formulations proven in service, not on paper.", img: drum },
    { title: "Response", body: "A named contact, reachable through the working day.", img: plant },
    {
      title: "Safety",
      body: "Documented handling, storage and transport at every step.",
      img: boiler,
    },
    {
      title: "Consistency",
      body: "Every batch manufactured to the same validated specification.",
      img: resin,
    },
    { title: "Partnership", body: "On site when an unplanned shutdown needs resolving.", img: ct },
  ],
  // Achievements / certifications / awards ship empty on purpose: these are
  // claims about the company, and a placeholder certificate is worse than no
  // certificate. Each section hides itself until the dashboard fills it in.
  achievementsHeading: "By the numbers.",
  achievements: [],
  certificationsHeading: "Certified, audited, on file.",
  certificationsBody:
    "Every batch ships with a certificate of analysis. Tap any certificate to see the full document.",
  certifications: [],
  awardsHeading: "Recognition.",
  awards: [],
  teamHeading: "The people behind the chemistry.",
  teamBody:
    "Chemists in the laboratory, engineers in the field and a leadership team close to the work — the people who keep a hundred plants running to specification.",
  ctaHeading: "Want to see it for yourself?",
  ctaBody: "Arrange a plant visit or request an on-site water survey.",
};

export const servicesContent: ServicesContent = {
  heroTitleTop: "We don't just supply.",
  heroTitleBottom: "We service.",
  processHeading: "Six steps. Every job.",
  processSteps: [
    { title: "Assessment", body: "Site walk-through and water sampling" },
    { title: "Diagnosis", body: "Lab analysis pinpoints the problem" },
    { title: "Plan", body: "Chemistry, dosage and schedule agreed" },
    { title: "Execution", body: "Our own crew does the work" },
    { title: "Quality Check", body: "Post-job measurement vs. baseline" },
    { title: "Support", body: "Follow-up visits and a direct line" },
  ],
};

export const productsContent: ProductsContent = {
  heroHeading: "Every drum. Every dose.",
  heroSubtitle: "Browse by category, or search the full catalogue.",
  heroImage: resin,
};

export const galleryContent: GalleryContent = {
  heroHeading: "Inside LK.",
};

/** The client's own "Embed a map" URL for LK CHEMICALS PRIVATE LIMITED.
 * Overridable from the dashboard (Content -> Contact page). */
const MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d21529.05502676479!2d78.58826863784525!3d17.467600131164417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x64eb06a0bcfb0a29%3A0x275f39d2bc582ad4!2sLK%20CHEMICALS%20PRIVATE%20LIMITED!5e0!3m2!1sen!2sin!4v1787807121412!5m2!1sen!2sin";

export const contactContent: ContactContent = {
  heroHeading: "Let's talk.",
  heroBody:
    "Speak to our technical team about chemistry, dosing or a site survey. Every enquiry is answered within one business day.",
  mapEmbed: MAP_EMBED,
};
