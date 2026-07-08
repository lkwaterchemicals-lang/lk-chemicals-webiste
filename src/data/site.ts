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
  coordinates: string;
};

/* --------------------------------------------------------------- defaults */

export const globalContent: GlobalContent = {
  brandName: "LK Chemicals Pvt. Ltd.",
  brandLine: "Since 2013 · Hyderabad · An ISO 9001:2015 Company",
  footerBlurb:
    "We provide the best water treatment solution — chemicals, plants and services engineered in Hyderabad, trusted across Telangana, AP, Karnataka, Tamil Nadu and Maharashtra.",
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
    "We formulate, manufacture and support the chemistry that keeps membranes clean, boilers efficient and cooling loops alive. Every drum leaves our Cherlapally plant with a batch certificate and a phone number that answers.",
  stats: [
    { value: 13, suffix: "+ yrs", label: "In water treatment" },
    { value: 10, suffix: " T", label: "per month capacity" },
    { value: 12, suffix: "", label: "Industries served" },
    { value: 70, suffix: "+", label: "Products & formulations" },
  ],
  whoImages: [plant, lab, droplet],
  makeHeading: "Nine categories. One formulary.",
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
  whyHeadingLead: "Chemistry",
  whyHeadingAccent: "with a spine.",
  whyItems: [
    {
      title: "Innovative solutions",
      body: "Our focus is on providing innovative solutions to the changing needs and requirements of our customers — every batch tested against a technical datasheet before it ships.",
      img: lab,
      highlight: true,
    },
    {
      title: "Quality services",
      body: "Quality services up to the expectations and satisfaction of our customers.",
    },
    {
      title: "Technical service manpower",
      body: "Trained crews dedicated to the R.O., D.M., softener and descaling departments.",
    },
    {
      title: "Broad customer network",
      body: "Power, pharma, steel, aluminium, paper & sugar mills, IT and hotels — across Telangana, Andhra Pradesh, Karnataka, Tamil Nadu and Maharashtra.",
    },
    {
      title: "Competitive on all fronts",
      body: "We always endeavour to be competitive on all fronts — chemistry, service and price.",
      img: plant,
      highlight: true,
    },
    {
      title: "Reliability",
      body: "Long-term contracts with pharma and power customers since 2014.",
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
    "Send us a note, or reach out on WhatsApp or call. Shiva Krishna answers the phone himself.",
};

export const aboutContent: AboutContent = {
  heroLabel: "About · Est. 2013 · An ISO 9001:2015 Company",
  heroHeading: "The story of a formula.",
  heroBody:
    "LK Chemicals began with one plant, one bore well and one problem to solve. More than a decade on, we're still solving problems — just for a hundred more plants across five states.",
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
      body: "A chemist on the phone, a service crew on the road.",
    },
  ],
  values: [
    { title: "Integrity", body: "A datasheet you can hold us to.", img: lab },
    { title: "Chemistry", body: "Formulations that work, not slogans.", img: drum },
    { title: "Response", body: "The phone answers. Every time.", img: plant },
    { title: "Safety", body: "Handling, storage and transport — no shortcuts.", img: boiler },
    { title: "Consistency", body: "Batch #4501 is identical to #0001.", img: resin },
    { title: "Partnership", body: "We show up when the plant is down.", img: ct },
  ],
  ctaHeading: "Want to see it for yourself?",
  ctaBody: "Schedule a plant visit or an on-site water survey.",
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
  heroSubtitle: "Pick a category below, or search the whole catalog.",
  heroImage: resin,
};

export const galleryContent: GalleryContent = {
  heroHeading: "Inside LK.",
};

export const contactContent: ContactContent = {
  heroHeading: "Let's talk.",
  heroBody:
    "Shiva Krishna picks up the phone himself. Or send a note — we reply within a business day.",
  coordinates: "17.4948° N · 78.5719° E",
};
