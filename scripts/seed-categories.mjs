// Adds categories 4–12 to the LK Chemicals Firestore `categories` collection,
// matching the convention already used for 1–3 (number-prefixed slug, zero-padded
// number, empty parent). Image fields (image/banner/ogImage) are intentionally
// left empty — added later from the dashboard.
//
// Run: node scripts/seed-categories.mjs
// If writes are locked to admins, run with credentials:
//   ADMIN_EMAIL=you@x.com ADMIN_PASSWORD=... node scripts/seed-categories.mjs
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC75KOofn4DBajf_zkESH7f8bft65EDsxs",
  authDomain: "lk-chemicals-webiste.firebaseapp.com",
  projectId: "lk-chemicals-webiste",
  storageBucket: "lk-chemicals-webiste.firebasestorage.app",
  messagingSenderId: "1005832126462",
  appId: "1:1005832126462:web:aa260afa3cabfcf1dccaaf",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const cats = [
  {
    slug: "4-water-treatment-chemicals",
    number: "04",
    name: "Water Treatment Chemicals",
    iconName: "Beaker",
    featured: true,
    tagline: "Coagulants, flocculants and pH chemistry for every stage of the train.",
    description:
      "The everyday chemistry that clarifies, softens and balances process and drinking water. Coagulants and flocculants drop turbidity, pH boosters and correctors hold the set point, and softener and DM-plant chemicals keep resins performing. General-purpose, industry-proven and batch-certified.",
    metaTitle: "Water Treatment Chemicals — Coagulants, Flocculants & pH Boosters | LK Chemicals",
    metaDescription:
      "Industrial water treatment chemicals from Hyderabad: coagulants, flocculants, pH boosters, softener and DM-plant chemistry. Batch-certified by LK Chemicals.",
    keywords:
      "water treatment chemicals, coagulant, flocculant, polyelectrolyte, pH booster, water clarifier, softener chemicals, DM plant chemicals, turbidity removal, industrial water chemistry",
  },
  {
    slug: "5-etp-stp-chemicals",
    number: "05",
    name: "ETP & STP Chemicals",
    iconName: "Leaf",
    featured: true,
    tagline: "Coagulants, defoamers and bio-cultures that meet the discharge norm.",
    description:
      "Chemistry for effluent and sewage treatment plants that has to hit a number. Coagulants and flocculants settle solids, defoamers and decolorants clean up the surface and shade, and bio-cultures, nutrients and DO enhancers keep the biology working. Odour control included — engineered to your consent limits and batch-certified.",
    metaTitle: "ETP & STP Chemicals — Coagulants, Defoamers & Bio-Cultures | LK Chemicals",
    metaDescription:
      "ETP and STP treatment chemicals from Hyderabad: coagulants, flocculants, defoamers, decolorants, bio-cultures and odour control. Meet discharge norms with LK Chemicals.",
    keywords:
      "ETP chemicals, STP chemicals, effluent treatment chemicals, sewage treatment chemicals, coagulant, flocculant, defoamer, decolorant, bio culture, odour control, wastewater treatment",
  },
  {
    slug: "6-descaling-compounds",
    number: "06",
    name: "Descaling Compounds",
    iconName: "Wrench",
    featured: true,
    tagline: "Inhibited acid descalers that strip scale without eating metal.",
    description:
      "Fast, inhibited descaling chemistry for heat exchangers, condensers, RO membranes, boilers and cooling coils. Our acidic and CIP compounds dissolve calcium, silica and iron scale while corrosion inhibitors protect the base metal, followed by neutralization and passivation. The same chemistry our own service crews use on site.",
    metaTitle: "Descaling Compounds — Inhibited Acid & CIP Cleaners | LK Chemicals",
    metaDescription:
      "Inhibited acid descaling compounds and CIP cleaners from Hyderabad for heat exchangers, condensers, boilers and RO. Removes scale, protects metal. LK Chemicals.",
    keywords:
      "descaling compound, descaling chemical, inhibited acid, CIP cleaner, heat exchanger cleaning, condenser descaling, boiler descaling, RO membrane cleaning, scale remover, passivation chemical",
  },
  {
    slug: "7-resin-cleaning-chemicals",
    number: "07",
    name: "Resin Cleaning Chemicals",
    iconName: "FlaskConical",
    featured: true,
    tagline: "Restore capacity to fouled cation and anion resin.",
    description:
      "Targeted cleaning chemistry for ion-exchange resin in softeners, DM plants and mixed beds. Acid and alkali regenerant cleaners strip iron, organic and biological fouling, break down oil and restore exchange capacity — bringing tired resin beds back to rated throughput. Batch-certified and dosage-guided.",
    metaTitle: "Resin Cleaning Chemicals — Iron & Organic Foulant Removers | LK Chemicals",
    metaDescription:
      "Ion-exchange resin cleaning chemicals from Hyderabad: iron, organic and biological foulant removers for softeners, DM plants and mixed beds. LK Chemicals.",
    keywords:
      "resin cleaning chemicals, resin cleaner, ion exchange resin cleaning, iron fouling removal, organic foulant remover, resin regeneration, softener resin cleaner, DM plant resin, mixed bed cleaning",
  },
  {
    slug: "8-ahu-cleaning-compounds",
    number: "08",
    name: "AHU Cleaning Compounds",
    iconName: "Building2",
    featured: true,
    tagline: "Coil cleaners and foaming degreasers for air-handling units.",
    description:
      "Cleaning chemistry for HVAC air-handling units and their coils. Foaming alkaline and acidic coil cleaners lift grease, dust and biofilm from evaporator and condenser fins, while sanitizers and deodorizers leave the air side fresh — restoring heat transfer and airflow. Safe on fins, tough on fouling.",
    metaTitle: "AHU Cleaning Compounds — Coil Cleaners & Foaming Degreasers | LK Chemicals",
    metaDescription:
      "AHU and HVAC coil cleaning compounds from Hyderabad: foaming coil cleaners, degreasers, sanitizers and deodorizers. Restore heat transfer with LK Chemicals.",
    keywords:
      "AHU cleaning compound, coil cleaner, HVAC coil cleaning chemical, foaming coil cleaner, evaporator coil cleaner, condenser coil cleaner, air handling unit cleaning, fin cleaner, coil degreaser",
  },
  {
    slug: "9-ro-plants",
    number: "09",
    name: "RO Plants",
    iconName: "Layers",
    featured: false,
    tagline: "Skid-mounted reverse-osmosis systems, built to your water.",
    description:
      "Custom-engineered reverse-osmosis plants from a few hundred litres to high-flow industrial trains. Skid-mounted, pre-plumbed and factory-tested, with quality membranes, high-pressure pumps, dosing and PLC controls — designed around your feed-water analysis and permeate target. Supplied, installed and serviced.",
    metaTitle: "RO Plants — Industrial Reverse Osmosis Systems | LK Chemicals",
    metaDescription:
      "Custom industrial RO plants from Hyderabad: skid-mounted reverse osmosis systems engineered to your feed water, supplied, installed and serviced by LK Chemicals.",
    keywords:
      "RO plant, reverse osmosis plant, industrial RO system, RO plant manufacturer, water purification plant, RO plant Hyderabad, skid mounted RO, RO plant supplier, membrane system",
  },
  {
    slug: "10-dm-plants",
    number: "10",
    name: "DM Plants",
    iconName: "Cog",
    featured: false,
    tagline: "Two-bed and mixed-bed demineralisation to ultrapure spec.",
    description:
      "Demineralisation plants that strip dissolved salts to boiler-feed and process-grade purity. Two-bed, mixed-bed and degasser configurations with quality ion-exchange resin, FRP or MS-rubber-lined vessels and regeneration skids — engineered to your conductivity and silica targets. Supplied, commissioned and backed by resin and regenerant supply.",
    metaTitle: "DM Plants — Demineralisation & Ion Exchange Systems | LK Chemicals",
    metaDescription:
      "Demineralisation (DM) plants from Hyderabad: two-bed, mixed-bed and degasser systems engineered to your purity target. Supplied and commissioned by LK Chemicals.",
    keywords:
      "DM plant, demineralisation plant, demineralization water plant, ion exchange plant, two bed DM plant, mixed bed unit, DM plant manufacturer, boiler feed water plant, ultrapure water system",
  },
  {
    slug: "11-softener-plants",
    number: "11",
    name: "Softener Plants",
    iconName: "Droplets",
    featured: false,
    tagline: "Automatic water softeners that kill hardness for good.",
    description:
      "Water-softening plants that remove calcium and hardness before it ever reaches your boiler, RO or process line. Manual and fully-automatic softeners with quality cation resin, FRP or MS vessels and multiport valves — sized to your flow and hardness load. Zero soft-water downtime with twin-stream options.",
    metaTitle: "Softener Plants — Automatic Water Softening Systems | LK Chemicals",
    metaDescription:
      "Water softener plants from Hyderabad: manual and automatic softening systems that remove hardness for boilers, RO and process water. Supplied by LK Chemicals.",
    keywords:
      "water softener plant, softening plant, automatic water softener, hardness removal, cation resin softener, industrial water softener, softener plant manufacturer, softener Hyderabad, twin softener",
  },
  {
    slug: "12-cooling-tower-frp-fills",
    number: "12",
    name: "Cooling Tower FRP Fills",
    iconName: "Layers",
    featured: false,
    tagline: "Film and splash fill media that rebuilds cooling-tower efficiency.",
    description:
      "Replacement fill media and FRP internals that bring an ageing cooling tower back to rated approach. PVC film fills, splash fills, drift eliminators and nozzles cut in for every major tower make and size — restoring heat rejection and airflow. Supplied to size, with fitment on request.",
    metaTitle: "Cooling Tower FRP Fills — Film & Splash Fill Media | LK Chemicals",
    metaDescription:
      "Cooling tower fill media and FRP internals from Hyderabad: PVC film fills, splash fills, drift eliminators and nozzles for all tower makes. Supplied by LK Chemicals.",
    keywords:
      "cooling tower fills, FRP fills, cooling tower fill media, PVC film fill, splash fill, drift eliminator, cooling tower spares, fill replacement, cooling tower internals",
  },
];

if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  await signInWithEmailAndPassword(auth, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  console.log("signed in as", process.env.ADMIN_EMAIL);
}

for (const c of cats) {
  const data = { ...c, status: "published", parent: "", _updatedAt: serverTimestamp() };
  await setDoc(doc(db, "categories", c.slug), data, { merge: true });
  console.log("wrote", c.slug);
}
console.log("done:", cats.length, "categories");
process.exit(0);
