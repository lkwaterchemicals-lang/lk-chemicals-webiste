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
import bLk1001 from "@/assets/b-lk1001.jpg";
import bLk1044 from "@/assets/b-lk1044.jpg";
import bLk1055 from "@/assets/b-lk1055.jpg";
import bLk5010 from "@/assets/b-lk5010.jpg";
import bTubeScale from "@/assets/b-tube-scale.jpg";
import bEtpBeakers from "@/assets/b-etp-beakers.jpg";
import bRoPlantSkid from "@/assets/b-ro-plant-skid.jpg";
import bDmPlant from "@/assets/b-dm-plant.jpg";
import bSoftener from "@/assets/b-softener.jpg";

// Services are now a hierarchical, fully admin-managed module (Service
// Categories → Services). Their types live alongside the catalog in
// src/data/products.ts; there is intentionally no built-in service seed here.

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
  company?: string;
  rating?: string; // "3"–"5" — optional gold stars
  image?: string; // optional headshot / logo
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
