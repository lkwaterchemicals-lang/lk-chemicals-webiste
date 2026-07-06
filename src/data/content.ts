// Static site content — the built-in fallback used when Firestore has no data,
// and the source for the admin dashboard's "Seed from built-in data" action.
import plant from "@/assets/plant.jpg";
import lab from "@/assets/lab.jpg";
import droplet from "@/assets/droplet.jpg";
import ro from "@/assets/ro-membrane.jpg";
import boiler from "@/assets/boiler.jpg";
import ct from "@/assets/cooling-tower.jpg";
import drum from "@/assets/drum.jpg";
import resin from "@/assets/resin.jpg";
import desc from "@/assets/descaling.jpg";
import hero from "@/assets/hero-depth.jpg";

export type Service = {
  n: string;
  t: string;
  img: string;
  body: string;
  inc: string[];
};

export type GalleryItem = {
  src: string;
  alt: string;
  cat: string;
  tall?: boolean;
  wide?: boolean;
};

export type Testimonial = {
  q: string;
  who: string;
};

export type SiteSettings = {
  phone: string;
  whatsapp: string; // digits only, with country code
  email: string;
  address: string;
  contactPerson: string;
  contactRole: string;
  hours: string;
  mapQuery: string;
};

export const staticServices: Service[] = [
  { n: "01", t: "RO Plant Repairing", img: ro, body: "On-site diagnosis and mechanical repair of RO plants of any make.", inc: ["Pump and motor repair", "High-pressure line fabrication", "Pressure vessel end-cap replacement"] },
  { n: "02", t: "RO Membrane Plant Services", img: ro, body: "Full-service programme covering membranes, cartridges and dosing skid.", inc: ["Membrane replacement", "Cartridge scheduling", "Dosing calibration"] },
  { n: "03", t: "RO Plant Maintenance", img: ro, body: "Annual maintenance contracts with defined SLA and spares stocking.", inc: ["Quarterly visits", "Emergency response", "Spare parts kit"] },
  { n: "04", t: "RO Descaling", img: desc, body: "Off-line acid/alkaline CIP that restores membrane flux to design.", inc: ["Two-step CIP", "Flux measurement pre/post", "Waste chemical neutralisation"] },
  { n: "05", t: "Boiler Descaling", img: boiler, body: "Inhibited-acid descaling for fire tube and water tube boilers.", inc: ["Boiler inspection", "Scale removal", "Passivation"] },
  { n: "06", t: "Chiller Descaling", img: ct, body: "Water-cooled chiller descaling with copper-safe chemistry.", inc: ["Condenser tube cleaning", "Endpoint indicator", "COP verification"] },
  { n: "07", t: "Condenser Cleaning", img: ct, body: "Mechanical + chemical cleaning of shell-and-tube condensers.", inc: ["Tube brushing", "Chemical soak", "Flow testing"] },
  { n: "08", t: "Water Treatment Plant Services", img: plant, body: "End-to-end services for WTP, ETP and STP installations.", inc: ["Operator support", "Chemistry optimisation", "Compliance reporting"] },
  { n: "09", t: "Water Softening", img: plant, body: "Softener design, resin change-out and regeneration troubleshooting.", inc: ["Hardness monitoring", "Resin change-out", "Brine tank service"] },
  { n: "10", t: "Cooling Tower Water Treatment", img: ct, body: "Cycles of concentration optimisation, biocide programme, dosing.", inc: ["CoC study", "Biocide rotation", "Corrosion coupon monitoring"] },
  { n: "11", t: "Industrial Water Treatment Consultation", img: plant, body: "Advisory for greenfield plants and retrofit projects.", inc: ["Feed water analysis", "Scheme selection", "OPEX modelling"] },
];

export const staticGallery: GalleryItem[] = [
  { src: plant, alt: "Manufacturing plant floor", cat: "Factory", wide: true },
  { src: lab, alt: "QC laboratory", cat: "Laboratory", tall: true },
  { src: drum, alt: "Product drum packaging", cat: "Products" },
  { src: ro, alt: "RO membrane element", cat: "Products" },
  { src: boiler, alt: "Boiler service", cat: "Services", wide: true },
  { src: ct, alt: "Cooling tower service", cat: "Services" },
  { src: desc, alt: "Descaling before and after", cat: "Services", tall: true },
  { src: resin, alt: "Ion exchange resin beads", cat: "Products" },
  { src: droplet, alt: "Purified water droplet", cat: "Team" },
  { src: hero, alt: "RO membrane close-up", cat: "Factory", wide: true },
  { src: plant, alt: "Warehouse", cat: "Factory" },
  { src: lab, alt: "Sample analysis", cat: "Laboratory" },
];

export const staticTestimonials: Testimonial[] = [
  {
    q: "LK's RO antiscalant let us run our brackish water plant at 78% recovery for 18 months without a CIP. That's real money saved.",
    who: "Plant Head, API pharma manufacturer",
  },
  {
    q: "They diagnosed a silica scaling issue in one visit that two other suppliers missed for a year.",
    who: "Utilities Manager, thermal power station",
  },
  {
    q: "Their team picks up the phone at 11 PM when a cooling loop crashes. That is why we stay.",
    who: "Maintenance Lead, food & beverage plant",
  },
];

export const staticSettings: SiteSettings = {
  phone: "+91 98666 00699",
  whatsapp: "919866600699",
  email: "shiva.lkchemicals@gmail.com",
  address: "Plot No. 58, Phase-2, EC Nagar, Cherlapally, Hyderabad – 500051",
  contactPerson: "Shiva Krishna Kangadekar",
  contactRole: "Founder & Director",
  hours: "Monday – Saturday · 9:30 AM – 7:00 PM",
  mapQuery: "LK Chemicals Cherlapally Hyderabad 500051",
};
