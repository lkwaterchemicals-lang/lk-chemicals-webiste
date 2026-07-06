export type Category = {
  slug: string;
  number: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  applications: string[];
  packing: string[];
};

import ro from "@/assets/ro-membrane.jpg";
import boiler from "@/assets/boiler.jpg";
import ct from "@/assets/cooling-tower.jpg";
import desc from "@/assets/descaling.jpg";
import resin from "@/assets/resin.jpg";
import drum from "@/assets/drum.jpg";

export const categories: Category[] = [
  {
    slug: "ro-chemicals",
    number: "01",
    name: "RO Chemicals",
    tagline: "Protect the membrane. Preserve the flow.",
    description:
      "Antiscalants, cleaners and pH boosters engineered for reverse osmosis systems handling every feed water condition — from low TDS municipal to high silica industrial.",
    image: ro,
  },
  {
    slug: "boiler-chemicals",
    number: "02",
    name: "Boiler Chemicals",
    tagline: "Zero scale. Zero corrosion. Full pressure.",
    description:
      "A complete internal treatment programme for low, medium and high pressure boilers — scale control, oxygen scavenging and alkalinity management in one formulary.",
    image: boiler,
  },
  {
    slug: "cooling-tower-chemicals",
    number: "03",
    name: "Cooling Tower Chemicals",
    tagline: "Clean loops. Cold water. Long life.",
    description:
      "Biocides, dispersants, corrosion inhibitors and antiscalants tuned to your make-up water and cycles of concentration.",
    image: ct,
  },
  {
    slug: "descaling-chemicals",
    number: "04",
    name: "Descaling Chemicals",
    tagline: "Bring old iron back to new.",
    description:
      "Fast-acting, controlled-corrosion descalers for condensers, chillers, AHUs, FCUs and process pipelines — with visual endpoint indicators.",
    image: desc,
  },
  {
    slug: "resins-and-others",
    number: "05",
    name: "Resins & Others",
    tagline: "Everything else your plant needs.",
    description:
      "Ion exchange resins, dosing hardware, filtration media and process chemicals — one supplier for the whole water train.",
    image: resin,
  },
];

const packStandard = ["25 kg jerry can", "50 kg drum", "200 kg drum", "1000 kg IBC"];

export const products: Product[] = [
  // RO Chemicals
  {
    slug: "scale-master-ro-antiscalant",
    name: "Scale Master RO Antiscalant",
    category: "ro-chemicals",
    description:
      "Our flagship broad-spectrum antiscalant. A liquid, low-dose scale inhibitor that keeps calcium carbonate, calcium sulphate, barium and strontium in solution across polyamide RO membranes.",
    features: ["Effective 2–5 ppm dosing", "Wide pH range 5–10", "NSF-grade raw materials", "Compatible with all thin film composite membranes"],
    applications: ["Municipal RO plants", "Industrial process RO", "Two-pass RO trains"],
    packing: packStandard,
  },
  {
    slug: "lk-5010-ro-antiscalant",
    name: "LK-5010 RO Antiscalant",
    category: "ro-chemicals",
    description:
      "Concentrated phosphonate blend engineered for high hardness bore water. Extends membrane cleaning cycles by up to 3x.",
    features: ["High recovery >75%", "Iron and manganese tolerant", "Non-oxidising", "Cold storage stable"],
    applications: ["Bore well RO", "Brackish water plants", "Beverage industry"],
    packing: packStandard,
  },
  {
    slug: "lk-1001-high-silica-ro-antiscalant",
    name: "LK-1001 High Silica RO Antiscalant",
    category: "ro-chemicals",
    description:
      "Silica-specific antiscalant that keeps reactive silica dispersed up to 240 ppm in the reject stream. Ideal for power and semiconductor pre-treatment RO.",
    features: ["Silica up to 240 ppm", "Low chlorine tolerance", "Zero phosphate", "Neutral pH"],
    applications: ["Power plant DM plants", "Electronics grade water", "High recovery RO"],
    packing: packStandard,
  },
  {
    slug: "ro-low-silica-antiscalant",
    name: "RO Low Silica Antiscalant",
    category: "ro-chemicals",
    description:
      "Everyday antiscalant for feed water with silica below 90 ppm. Balanced formulation for reliable performance at economical dosing.",
    features: ["Cost-effective baseline", "Stable at high recovery", "Long shelf life"],
    applications: ["Commercial RO", "Small industrial RO", "Housing societies"],
    packing: packStandard,
  },
  {
    slug: "ro-high-silica-high-tds-antiscalant",
    name: "RO High Silica & High TDS Antiscalant",
    category: "ro-chemicals",
    description:
      "Dual-action inhibitor for the hardest feed water — high silica together with high TDS. Prevents both carbonate and silicate scaling simultaneously.",
    features: ["Silica >180 ppm control", "TDS up to 30,000 ppm", "Concentrated liquid"],
    applications: ["Sea water RO pre-treatment", "Effluent recovery RO", "ZLD systems"],
    packing: packStandard,
  },
  {
    slug: "ro-ph-booster",
    name: "RO pH Booster",
    category: "ro-chemicals",
    description:
      "Alkaline booster for permeate re-mineralisation. Raises pH gently without spikes for stable downstream chemistry.",
    features: ["Food-grade blend", "No hardness contribution", "Easy dosing"],
    applications: ["Post RO conditioning", "Bottled water", "Boiler make-up"],
    packing: packStandard,
  },
  {
    slug: "ro-cleaner-chemical-minerals",
    name: "RO Cleaner (Mineral Foulant)",
    category: "ro-chemicals",
    description:
      "Off-line cleaner formulated to strip calcium carbonate, iron oxide and general mineral scaling from RO membrane surfaces.",
    features: ["Chelation and dispersion", "Powder concentrate", "Membrane safe"],
    applications: ["Scheduled CIP", "Flux recovery", "Reject flow restoration"],
    packing: ["25 kg bag", "50 kg drum"],
  },
  {
    slug: "ro-high-ph-cleaning-chemical",
    name: "RO High pH Cleaning Chemical",
    category: "ro-chemicals",
    description:
      "Alkaline (pH 11–12) cleaner for organic, biological and colloidal fouling on RO membranes.",
    features: ["Surfactant fortified", "Fast contact time", "Rinse clean"],
    applications: ["Bio-fouling removal", "Colloidal iron cleaning", "Oil traces"],
    packing: packStandard,
  },
  {
    slug: "ro-low-ph-cleaning-chemical",
    name: "RO Low pH Cleaning Chemical",
    category: "ro-chemicals",
    description:
      "Acidic (pH 2–3) cleaner for inorganic scale — carbonates, sulphates and metal oxides.",
    features: ["Non-oxidising acid blend", "Foam-controlled", "Corrosion inhibited"],
    applications: ["Carbonate scale", "Metal oxide removal", "Restart cleaning"],
    packing: packStandard,
  },
  {
    slug: "ro-membrane-cleaning-chemical",
    name: "RO Membrane Cleaning Chemical",
    category: "ro-chemicals",
    description:
      "Two-step (acid + alkaline) CIP kit supplied as a matched pair with full application instructions.",
    features: ["Matched CIP pair", "Colour indicator", "Application datasheet"],
    applications: ["Scheduled maintenance", "Restart after long shutdown"],
    packing: ["25 kg × 2 pair kit", "50 kg × 2 pair kit"],
  },
  {
    slug: "ro-mineral-chemicals",
    name: "RO Mineral Chemicals",
    category: "ro-chemicals",
    description:
      "Post-treatment mineral blend to add taste, hardness and stability to permeate for potable and packaged water.",
    features: ["Balanced mineral profile", "Food-grade", "Dissolves clean"],
    applications: ["Packaged drinking water", "Beverage bases"],
    packing: ["25 kg bag"],
  },

  // Boiler
  { slug: "boiler-antiscalant", name: "Boiler Antiscalant", category: "boiler-chemicals",
    description: "Polymer dispersant that keeps hardness salts suspended for blow-down removal — protects tubes across all pressure ranges.",
    features: ["All pressure classes", "Sludge conditioning", "No boiler acid"],
    applications: ["Industrial steam boilers", "Package boilers", "Waste heat boilers"],
    packing: packStandard },
  { slug: "boiler-water-treatment-chemical", name: "Boiler Water Treatment Chemical", category: "boiler-chemicals",
    description: "All-in-one internal treatment combining scale, corrosion and pH management in a single dose stream.",
    features: ["Single-drum programme", "Reduces monitoring load", "Cost-optimised"],
    applications: ["Small to mid boilers", "Textile and food industry"],
    packing: packStandard },
  { slug: "boiler-ph-booster", name: "Boiler pH Booster", category: "boiler-chemicals",
    description: "Alkalinity builder to hold boiler water pH in the protective 10.5–11.5 range.",
    features: ["Neutralising amines optional", "Steady release", "Compatible with condensate"],
    applications: ["Boiler drum dosing", "Condensate line protection"],
    packing: packStandard },
  { slug: "boiler-oxygen-scavenger", name: "Boiler Oxygen Scavenger", category: "boiler-chemicals",
    description: "Hydrazine-free scavenger that removes dissolved oxygen instantly — protects the pre-boiler section and economiser.",
    features: ["Volatile, no TDS build-up", "Fast reaction", "Food-safe grade available"],
    applications: ["Deaerator dosing", "Feed water lines"],
    packing: packStandard },
  { slug: "boiler-descaling-chemical", name: "Boiler Descaling Chemical", category: "boiler-chemicals",
    description: "Off-line acid descaler with corrosion inhibitor for reviving hard-scaled boilers to design efficiency.",
    features: ["Inhibited hydrochloric blend", "Endpoint indicator", "Safe on carbon steel"],
    applications: ["Boiler shutdown cleaning", "Scale removal restarts"],
    packing: packStandard },
  { slug: "scale-remover", name: "Scale Remover", category: "boiler-chemicals",
    description: "General-purpose acidic scale remover for hard-water deposits across small equipment.",
    features: ["Fast-acting", "Low fumes", "Buffered"],
    applications: ["Heat exchangers", "Auxiliary equipment"],
    packing: packStandard },

  // Cooling tower
  { slug: "cooling-tower-antiscalant", name: "Cooling Tower Antiscalant", category: "cooling-tower-chemicals",
    description: "Threshold antiscalant that lets you run higher cycles of concentration without carbonate scale.",
    features: ["High CoC operation", "Polymer/phosphonate blend", "Stable at 50 °C"],
    applications: ["HVAC towers", "Process cooling loops"],
    packing: packStandard },
  { slug: "cooling-tower-biocide", name: "Cooling Tower Biocide", category: "cooling-tower-chemicals",
    description: "Broad-spectrum non-oxidising biocide controlling algae, bacteria and Legionella in open recirculating systems.",
    features: ["Alternate with oxidising biocide", "Rapid kill", "Low foaming"],
    applications: ["Comfort cooling", "Industrial towers"],
    packing: packStandard },
  { slug: "cooling-tower-biodispersant", name: "Cooling Tower Biodispersant", category: "cooling-tower-chemicals",
    description: "Penetrates and disperses established biofilm so biocides can reach the microbes underneath.",
    features: ["Biofilm penetration", "Non-ionic", "Chlorine compatible"],
    applications: ["Biofilm-prone systems", "Restart after shutdown"],
    packing: packStandard },
  { slug: "cooling-tower-anti-corrosion-chemical", name: "Cooling Tower Anti-Corrosion Chemical", category: "cooling-tower-chemicals",
    description: "Film-forming inhibitor protecting mild steel, copper and galvanised surfaces from oxygen corrosion.",
    features: ["Multi-metal protection", "Tolyltriazole for yellow metals", "Low phosphorus options"],
    applications: ["Mixed-metallurgy loops", "Chilled water systems"],
    packing: packStandard },
  { slug: "cooling-tower-dealkalizer", name: "Cooling Tower Dealkalizer", category: "cooling-tower-chemicals",
    description: "Controlled acid feed to reduce M-alkalinity and stabilise the Langelier saturation index.",
    features: ["Concentrated liquid", "Automated dosing compatible"],
    applications: ["High alkalinity make-up", "Blow-down reduction programmes"],
    packing: packStandard },
  { slug: "cooling-tower-water-treatment-chemical", name: "Cooling Tower Water Treatment Chemical", category: "cooling-tower-chemicals",
    description: "Complete conditioned dosing programme — antiscalant, biocide, dispersant and inhibitor in one plan.",
    features: ["Bundled programme", "Site-specific formulation", "Includes monitoring plan"],
    applications: ["Full cooling programme customers"],
    packing: packStandard },

  // Descaling
  { slug: "descaling-compound", name: "Descaling Compound", category: "descaling-chemicals",
    description: "Powder acid descaler for use on carbon steel, cast iron and copper equipment.",
    features: ["Solid concentrate", "Corrosion inhibited", "Easy to dose"],
    applications: ["Small equipment CIP", "Route maintenance"],
    packing: ["25 kg bag", "50 kg drum"] },
  { slug: "condenser-descaling-chemical", name: "Condenser Descaling Chemical", category: "descaling-chemicals",
    description: "Purpose-built inhibited acid for shell-and-tube condensers — safe on copper tubes and tube sheets.",
    features: ["Copper safe", "Endpoint indicator", "Fast dissolution"],
    applications: ["Chiller condensers", "Steam condensers"],
    packing: packStandard },
  { slug: "chiller-cleaning-chemical", name: "Chiller Cleaning Chemical", category: "descaling-chemicals",
    description: "Two-stage acid/alkaline chiller cleaning kit that restores heat exchange efficiency to design.",
    features: ["Two-stage programme", "Complete kit"],
    applications: ["Water-cooled chillers", "Absorption chillers"],
    packing: ["25 kg × 2 pair kit"] },
  { slug: "ahu-cleaning-chemical", name: "AHU Cleaning Chemical", category: "descaling-chemicals",
    description: "Coil cleaner for air handling units — cuts oil, biofilm and dust from cooling coils and drain pans.",
    features: ["Non-fuming", "Coil safe", "Foam or spray"],
    applications: ["HVAC preventive maintenance", "Commercial buildings"],
    packing: packStandard },
  { slug: "fcu-cleaning-chemical", name: "FCU Cleaning Chemical", category: "descaling-chemicals",
    description: "Fan coil unit cleaner formulated to be used in occupied spaces — low odour, quick rinse.",
    features: ["Low odour", "Fast rinse", "Ready to use"],
    applications: ["Hotel and hospital FCUs", "Retail HVAC"],
    packing: packStandard },
  { slug: "sodium-hypochlorite", name: "Sodium Hypochlorite", category: "descaling-chemicals",
    description: "Industrial grade 12% chlorine liquid — disinfection, oxidation and shock dosing.",
    features: ["12% available chlorine", "Stabilised grade"],
    applications: ["Water disinfection", "Cooling tower shock dosing"],
    packing: ["25 kg carboy", "50 kg drum", "200 kg drum"] },

  // Resins & Others
  { slug: "ion-exchange-resin", name: "Ion Exchange Resin", category: "resins-and-others",
    description: "Strong acid cation and strong base anion resins for softening, DM and mixed-bed polishing.",
    features: ["Uniform bead size", "High capacity", "Food and pharma grades"],
    applications: ["Water softeners", "DM plants", "Mixed bed polishers"],
    packing: ["25 L bag", "1 m³ bulk bag"] },
  { slug: "citric-acid", name: "Citric Acid", category: "resins-and-others",
    description: "Food-grade anhydrous citric acid for descaling and pH adjustment where chloride-free chemistry is required.",
    features: ["Food grade", "Chloride free"],
    applications: ["Membrane cleaning", "Sensitive equipment"],
    packing: ["25 kg bag"] },
  { slug: "dosing-pump", name: "Dosing Pump", category: "resins-and-others",
    description: "Electromagnetic and motor-driven dosing pumps sized to match every chemical programme we supply.",
    features: ["0.5–50 L/hr", "Manual and automatic", "Warranty backed"],
    applications: ["Chemical dosing skids", "Plant retrofits"],
    packing: ["Single unit"] },
  { slug: "poly-aluminium-chloride", name: "Poly Aluminium Chloride", category: "resins-and-others",
    description: "Coagulant for raw water clarification and effluent treatment — powder and liquid forms.",
    features: ["High basicity", "Wide pH range", "Low residual aluminium"],
    applications: ["Clarifiers", "ETP primary treatment"],
    packing: ["25 kg bag", "50 kg drum"] },
  { slug: "air-filters", name: "Air Filters", category: "resins-and-others",
    description: "HEPA and pre-filter media replacements for cleanroom and HVAC applications.",
    features: ["G4 to H14 grades", "Custom sizes"],
    applications: ["Pharma HVAC", "Cleanrooms"],
    packing: ["Per unit"] },
  { slug: "micro-filters", name: "Micro Filters", category: "resins-and-others",
    description: "Polypropylene cartridge filters — 1, 5 and 10 micron ratings for RO pre-treatment and final polishing.",
    features: ["10\" to 40\" lengths", "Multiple micron ratings"],
    applications: ["RO pre-treatment", "Beverage filtration"],
    packing: ["Case of 20"] },
];

export const categoryFor = (slug: string) => categories.find((c) => c.slug === slug)!;
export const productsIn = (slug: string) => products.filter((p) => p.category === slug);
export const findProduct = (slug: string) => products.find((p) => p.slug === slug);

// Fallback image per category for card visuals
export const categoryImage = (slug: string) => {
  const c = categoryFor(slug);
  return c?.image ?? drum;
};
export const drumImage = drum;