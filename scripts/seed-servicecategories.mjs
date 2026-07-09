// Adds service categories 2–5 to the `serviceCategories` collection, matching
// category 1 (descaling-services): clean slug, zero-padded number, empty parent.
// Image fields left empty — added later from the dashboard.
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
    slug: "plant-services",
    number: "02",
    name: "Plant Services",
    iconName: "Cog",
    featured: true,
    tagline: "Servicing, repair and O&M for RO, DM, softener and ETP/STP plants.",
    description:
      "Keep every plant on your site running to spec. Our engineers service, repair and run RO, DM, softener and effluent plants of any make — pump and membrane replacement, resin change-outs, regeneration troubleshooting and full O&M contracts. On-site diagnosis, genuine spares and defined SLAs.",
    metaTitle: "Plant Services — RO, DM, Softener & ETP/STP Servicing | LK Chemicals",
    metaDescription:
      "On-site servicing, repair and O&M for RO, DM, softener and ETP/STP plants of any make in Hyderabad. Membranes, resin, pumps and AMC — by LK Chemicals.",
    keywords:
      "plant services, RO plant service, DM plant servicing, softener plant service, ETP STP O&M, water treatment plant repair, resin change out, membrane replacement, plant maintenance Hyderabad",
  },
  {
    slug: "cleaning-services",
    number: "03",
    name: "Cleaning Services",
    iconName: "Droplets",
    featured: true,
    tagline: "Membrane CIP, resin cleaning and coil cleaning that restore performance.",
    description:
      "Chemical cleaning that brings fouled equipment back to design. Off-line RO membrane CIP, ion-exchange resin cleaning, AHU coil and heat-exchanger cleaning — with flux and capacity measured before and after, and spent chemicals neutralised on site. Performance restored without premature replacement.",
    metaTitle: "Cleaning Services — RO Membrane CIP, Resin & Coil Cleaning | LK Chemicals",
    metaDescription:
      "On-site chemical cleaning in Hyderabad: RO membrane CIP, ion-exchange resin cleaning and AHU coil cleaning. Flux and capacity restored by LK Chemicals.",
    keywords:
      "cleaning services, RO membrane CIP, membrane cleaning, resin cleaning, AHU coil cleaning, chemical cleaning, CIP service, flux restoration, water plant cleaning",
  },
  {
    slug: "installation-upgradation-services",
    number: "04",
    name: "Installation & Upgradation Services",
    iconName: "Factory",
    featured: false,
    tagline: "New plant installation, commissioning, retrofits and capacity upgrades.",
    description:
      "From a new skid to a full plant upgrade. We design, install and commission RO, DM, softener and ETP/STP systems, and retrofit or expand existing plants for higher capacity, better recovery or lower running cost. Turnkey supply, erection and start-up — sized to your water and your load.",
    metaTitle: "Installation & Upgradation Services — Water Plant Setup & Retrofits | LK Chemicals",
    metaDescription:
      "Turnkey installation, commissioning and upgrades of RO, DM, softener and ETP/STP plants in Hyderabad. Retrofits and capacity expansion by LK Chemicals.",
    keywords:
      "plant installation, water treatment plant commissioning, RO plant installation, plant upgradation, retrofit, capacity expansion, turnkey water plant, plant erection Hyderabad",
  },
  {
    slug: "amc-technical-support",
    number: "05",
    name: "AMC & Technical Support",
    iconName: "Scroll",
    featured: false,
    tagline: "Annual maintenance contracts and expert support that pick up the phone.",
    description:
      "Keep your utilities covered all year. Comprehensive and non-comprehensive AMCs for RO, DM, softener, cooling and HVAC systems — with scheduled servicing, priority breakdown response, spares stocking and defined SLAs. Backed by feed-water analysis, scheme advice and a chemist on call when a loop crashes at 11 PM.",
    metaTitle: "AMC & Technical Support — Water Treatment Maintenance Contracts | LK Chemicals",
    metaDescription:
      "Comprehensive and non-comprehensive AMCs plus technical support for RO, DM, softener and HVAC systems in Hyderabad. Priority response from LK Chemicals.",
    keywords:
      "AMC, annual maintenance contract, water treatment AMC, technical support, RO AMC, HVAC AMC, plant maintenance contract, breakdown support, water treatment consultation Hyderabad",
  },
];

if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  await signInWithEmailAndPassword(auth, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  console.log("signed in as", process.env.ADMIN_EMAIL);
}

for (const c of cats) {
  const data = { ...c, status: "published", parent: "", _updatedAt: serverTimestamp() };
  await setDoc(doc(db, "serviceCategories", c.slug), data, { merge: true });
  console.log("wrote", c.slug);
}
console.log("done:", cats.length, "service categories");
process.exit(0);
