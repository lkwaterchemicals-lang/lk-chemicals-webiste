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
// Photos taken from the client's printed brochures
import bScaleMaster from "@/assets/b-scale-master.jpg";
import bMembrane from "@/assets/b-membrane.jpg";
import bLk1001 from "@/assets/b-lk1001.jpg";
import bLk1044 from "@/assets/b-lk1044.jpg";
import bLk1055 from "@/assets/b-lk1055.jpg";
import bLk5010 from "@/assets/b-lk5010.jpg";
import bBoiler from "@/assets/b-boiler.jpg";
import bCoolingTowers from "@/assets/b-cooling-towers.jpg";
import bTubeScale from "@/assets/b-tube-scale.jpg";
import bEtpBeakers from "@/assets/b-etp-beakers.jpg";
import bRoPlantSkid from "@/assets/b-ro-plant-skid.jpg";
import bDmPlant from "@/assets/b-dm-plant.jpg";
import bSoftener from "@/assets/b-softener.jpg";
import bVessels from "@/assets/b-vessels.jpg";

export type Service = {
  n: string;
  t: string;
  img: string;
  body: string;
  inc: string[];
  status?: string; // published | draft | archived (admin-managed)
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
  phone2?: string;
  phone3?: string;
  whatsapp: string; // digits only, with country code
  email: string;
  email2?: string;
  address: string;
  address2?: string;
  contactPerson: string;
  contactRole: string;
  hours: string;
  mapQuery: string;
};

export const staticServices: Service[] = [
  {
    n: "01",
    t: "RO Plant Servicing & Repair",
    img: bRoPlantSkid,
    body: "On-site diagnosis, mechanical repair and annual maintenance of RO plants of any make — membranes, cartridges, dosing skid and all.",
    inc: [
      "Pump and motor repair",
      "Membrane & cartridge replacement",
      "High-pressure line fabrication",
      "AMC with defined SLA and spares stocking",
    ],
  },
  {
    n: "02",
    t: "RO Descaling & Membrane CIP",
    img: bMembrane,
    body: "Off-line acid/alkaline CIP with LK 1055 + LK 1066 that restores membrane flux to design.",
    inc: ["Two-step CIP", "Flux measurement pre/post", "Waste chemical neutralisation"],
  },
  {
    n: "03",
    t: "Boiler Descaling",
    img: bBoiler,
    body: "Inhibited-acid descaling for fire tube and water tube boilers across all pressure classes.",
    inc: ["Boiler inspection", "Scale removal", "Passivation"],
  },
  {
    n: "04",
    t: "Chiller Descaling",
    img: ct,
    body: "Water-cooled chiller descaling with copper-safe chemistry.",
    inc: ["Condenser tube cleaning", "Endpoint indicator", "COP verification"],
  },
  {
    n: "05",
    t: "Condenser Descaling",
    img: ct,
    body: "Mechanical + chemical cleaning of shell-and-tube condensers.",
    inc: ["Tube brushing", "Chemical soak", "Flow testing"],
  },
  {
    n: "06",
    t: "Heat Exchanger Descaling",
    img: bTubeScale,
    body: "Plate and shell-and-tube heat exchanger descaling that brings approach temperatures back to design.",
    inc: ["Plate pack / tube bundle cleaning", "Gasket inspection", "Performance verification"],
  },
  {
    n: "07",
    t: "Cooling Tower Descaling & Treatment",
    img: bCoolingTowers,
    body: "Tower descaling plus cycles of concentration optimisation, biocide programme and dosing.",
    inc: [
      "Fill & basin descaling",
      "CoC study and biocide rotation",
      "Corrosion coupon monitoring",
    ],
  },
  {
    n: "08",
    t: "Moulds Descaling",
    img: desc,
    body: "Descaling of mould cooling channels in injection moulding and die casting — cycle times back to spec.",
    inc: ["Channel-by-channel flushing", "Copper-safe chemistry", "Flow verification"],
  },
  {
    n: "09",
    t: "AHU Descaling & Coil Cleaning",
    img: plant,
    body: "AHU and FCU coil cleaning and cooling-coil descaling for HVAC systems — done without damaging aluminium fins.",
    inc: ["Coil foam cleaning", "Drain pan sanitisation", "Fin-safe chemistry"],
  },
  {
    n: "10",
    t: "Pipe Line Descaling",
    img: desc,
    body: "Descaling of process and utility pipelines — flow rates and pressure drops restored without cutting pipe.",
    inc: ["Circulation descaling", "Before/after flow measurement", "Neutralisation & disposal"],
  },
  {
    n: "11",
    t: "Softener Plant Servicing",
    img: bSoftener,
    body: "Softener design, resin change-out and regeneration troubleshooting.",
    inc: ["Hardness monitoring", "Resin change-out", "Brine tank service"],
  },
  {
    n: "12",
    t: "DM Plant Servicing",
    img: bDmPlant,
    body: "DM plant service — resin replacement, regeneration chemistry and output quality troubleshooting.",
    inc: [
      "Resin replacement (all types)",
      "Regeneration optimisation",
      "Conductivity & silica monitoring",
    ],
  },
  {
    n: "13",
    t: "Resin Cleaning Service",
    img: resin,
    body: "On-site chemical cleaning of fouled softener and DM resin beds — capacity recharged without a full change-out.",
    inc: ["Iron & organic fouling removal", "Capacity test pre/post", "Bed inspection report"],
  },
  {
    n: "14",
    t: "ETP & STP Plant Services",
    img: bVessels,
    body: "Operation, maintenance and revival of effluent and sewage treatment plants — aerobic, anaerobic, MBBR and SBR.",
    inc: ["Operator support & O&M contracts", "Bio culture re-seeding", "Compliance reporting"],
  },
  {
    n: "15",
    t: "HVAC & AMC Services",
    img: hero,
    body: "Annual maintenance contracts and allied works around your utilities — HVAC servicing, plumbing, insulation and fire-fighting systems.",
    inc: [
      "Comprehensive & non-comprehensive AMCs",
      "HVAC servicing",
      "Plumbing & insulation works",
      "Fire-fighting system support",
    ],
  },
  {
    n: "16",
    t: "Industrial Water Treatment Consultation",
    img: lab,
    body: "Advisory for greenfield plants and retrofit projects.",
    inc: ["Feed water analysis", "Scheme selection", "OPEX modelling"],
  },
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
  {
    src: bScaleMaster,
    alt: "Scale Master food-grade RO antiscalants",
    cat: "Products",
    wide: true,
  },
  { src: bLk1055, alt: "LK 1055 RO low pH cleaning chemical", cat: "Products" },
  { src: bLk1044, alt: "LK 1044 RO pH booster", cat: "Products" },
  {
    src: bLk1001,
    alt: "LK 1001 high silica & high TDS RO antiscalant",
    cat: "Products",
    tall: true,
  },
  { src: bLk5010, alt: "LK 5010 RO antiscalant", cat: "Products" },
  { src: bRoPlantSkid, alt: "Industrial RO plant skid", cat: "Factory", wide: true },
  { src: bDmPlant, alt: "DM plant installation", cat: "Services" },
  { src: bSoftener, alt: "MS & FRP softener plant", cat: "Services" },
  { src: bTubeScale, alt: "Condenser tube sheet — before and after descaling", cat: "Services" },
  { src: bEtpBeakers, alt: "ETP jar testing", cat: "Laboratory", wide: true },
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
  phone2: "+91 73311 34031",
  phone3: "+91 88867 99941",
  whatsapp: "919866600699",
  email: "shiva.lkchemicals@gmail.com",
  email2: "lk.waterchemicals@gmail.com",
  address: "Plot No. 157, Officers Colony, Cherlapally, Hyderabad – 500051",
  address2: "Plot No. 58, Phase-II, EC Nagar, Cherlapally, Hyderabad – 500051",
  contactPerson: "Shiva Krishna Kangadekar",
  contactRole: "Founder & Director",
  hours: "Monday – Saturday · 9:30 AM – 7:00 PM",
  mapQuery: "LK Chemicals Cherlapally Hyderabad 500051",
};
