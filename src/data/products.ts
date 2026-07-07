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
  /** Optional product photo — falls back to the category image when absent. */
  image?: string;
};

import resin from "@/assets/resin.jpg";
import drum from "@/assets/drum.jpg";
import droplet from "@/assets/droplet.jpg";
// Photos taken from the client's printed brochures
import bScaleMaster from "@/assets/b-scale-master.jpg";
import bMembrane from "@/assets/b-membrane.jpg";
import bLk1001 from "@/assets/b-lk1001.jpg";
import bLk1010 from "@/assets/b-lk1010.jpg";
import bLk1044 from "@/assets/b-lk1044.jpg";
import bLk1055 from "@/assets/b-lk1055.jpg";
import bLk1066 from "@/assets/b-lk1066.jpg";
import bLk5010 from "@/assets/b-lk5010.jpg";
import bBoiler from "@/assets/b-boiler.jpg";
import bCoolingTowers from "@/assets/b-cooling-towers.jpg";
import bTubeScale from "@/assets/b-tube-scale.jpg";
import bEtpBeakers from "@/assets/b-etp-beakers.jpg";
import bRoPlantSkid from "@/assets/b-ro-plant-skid.jpg";
import bRoPlantPipes from "@/assets/b-ro-plant-pipes.jpg";
import bDmPlant from "@/assets/b-dm-plant.jpg";
import bSoftener from "@/assets/b-softener.jpg";
import bVessels from "@/assets/b-vessels.jpg";

export const categories: Category[] = [
  {
    slug: "ro-chemicals",
    number: "01",
    name: "RO Chemicals",
    tagline: "Protect the membrane. Preserve the flow.",
    description:
      "Scale Master food-grade antiscalants, low/high pH cleaners and pH boosters engineered for reverse osmosis systems handling every feed water condition — from low TDS municipal to high silica industrial.",
    image: bScaleMaster,
  },
  {
    slug: "boiler-chemicals",
    number: "02",
    name: "Boiler Chemicals",
    tagline: "Zero scale. Zero corrosion. Full pressure.",
    description:
      "A complete internal treatment programme for low, medium and high pressure boilers — pH boosting, scale control, oxygen scavenging, sludge conditioning and corrosion protection in one formulary.",
    image: bBoiler,
  },
  {
    slug: "cooling-tower-chemicals",
    number: "03",
    name: "Cooling Tower Chemicals",
    tagline: "Clean loops. Cold water. Long life.",
    description:
      "Antiscalant cum anti-corrosives, dealkalizers, oxidising and non-oxidising biocides tuned to your make-up water and cycles of concentration.",
    image: bCoolingTowers,
  },
  {
    slug: "chiller-chemicals",
    number: "04",
    name: "Chiller Chemicals",
    tagline: "Closed loops, fully protected.",
    description:
      "Anti-corrosive, biocide and passivation chemistry for closed chilled-water loops — plus cleaning chemicals that bring heat transfer back to design.",
    image: droplet,
  },
  {
    slug: "descaling-chemicals",
    number: "05",
    name: "Descaling Chemicals",
    tagline: "Bring old iron back to new.",
    description:
      "LK 99 series fast-acting, corrosion-inhibited descaling compounds for boilers, chillers, condensers, cooling towers, heat exchangers, moulds and process pipelines.",
    image: bTubeScale,
  },
  {
    slug: "etp-stp-chemicals",
    number: "06",
    name: "ETP & STP Chemicals",
    tagline: "Effluent in. Compliance out.",
    description:
      "Coagulants, polyelectrolytes, bio cultures, defoamers and nutrients for effluent and sewage treatment plants — sludge settlement, colour cutting and bacteria development.",
    image: bEtpBeakers,
  },
  {
    slug: "water-treatment-chemicals",
    number: "07",
    name: "Water Treatment Chemicals",
    tagline: "The workhorse chemistry, always in stock.",
    description:
      "SMBS, citric acid, HCl, hypo, caustic soda, coagulants and biocides — commodity water treatment chemicals supplied in commercial and food grades.",
    image: drum,
  },
  {
    slug: "resin-ahu-cleaning",
    number: "08",
    name: "Resin & AHU Cleaning",
    tagline: "Recharge the resin. Refresh the coils.",
    description:
      "Resin cleaning chemicals for softeners and DM plants, plus AHU and FCU coil cleaning compounds that strip dust, oil and biofilm without harming aluminium fins.",
    image: resin,
  },
  {
    slug: "plants-equipment",
    number: "09",
    name: "Plants & Equipment",
    tagline: "From a single skid to a full water train.",
    description:
      "RO, DM, softener, ETP, STP, UF and desalination plants — new installations, extensions, membranes, filters, pumps and every spare in between.",
    image: bRoPlantSkid,
  },
];

const packStandard = ["25 kg jerry can", "50 kg drum", "200 kg drum", "1000 kg IBC"];
const packBags = ["25 kg bag", "50 kg drum"];
const packPlant = ["Built to order", "SS / MS / FRP construction", "Installation & commissioning"];

export const products: Product[] = [
  // ============ 01 RO Chemicals ============
  {
    slug: "scale-master-ro-antiscalant",
    image: bScaleMaster,
    name: "LK 5001 RO Antiscalant (Food Grade)",
    category: "ro-chemicals",
    description:
      "Our flagship Scale Master food-grade antiscalant. A liquid, low-dose scale inhibitor that keeps calcium carbonate, calcium sulphate, barium and strontium in solution across polyamide RO membranes.",
    features: ["Food-grade antiscalant", "Effective 2–5 ppm dosing", "NSF-grade raw materials", "Compatible with all thin film composite membranes"],
    applications: ["Municipal RO plants", "Packaged drinking water", "Industrial process RO"],
    packing: packStandard,
  },
  {
    slug: "lk-1001-high-silica-ro-antiscalant",
    image: bLk1001,
    name: "LK 1001 High Silica & High TDS RO Antiscalant (Food Grade)",
    category: "ro-chemicals",
    description:
      "Advanced polyorganophosphonate chemistry that inhibits every scale parameter in the water — CaCO₃, calcium, magnesium, sulphate, nitrate, iron, chloride and silica. Dosed regularly, product water flow never falls off.",
    features: ["pH 2–3 · Specific gravity 1.10 ± 0.01 · 30% solids", "Base: polyorganophosphonate · light pink liquid · amber odour", "Inhibits CaCO₃, Ca, Mg, SO₄, NO₃, Fe, Cl and silica", "Food grade · Dosage depends on water quality"],
    applications: ["High silica bore water", "Power plant pre-treatment", "Effluent recovery & ZLD RO"],
    packing: packStandard,
  },
  {
    slug: "ro-low-silica-antiscalant",
    image: bLk1010,
    name: "LK 1010 RO Antiscalant & Antifouling (Food Grade)",
    category: "ro-chemicals",
    description:
      "Low silica antiscalant and antifoulant on a polyorganophosphonate base. Removes scale already sitting on the membrane — CaCO₃, calcium, magnesium, sulphate, nitrate, iron, chloride — without enlarging the membrane pore size.",
    features: ["pH 2–3 · Specific gravity 1.05 ± 0.01 · 20% solids", "Base: polyorganophosphonate · light pink liquid · amber odour", "Removes scale without enlarging the membrane pore size", "Food grade · Dosage depends on water quality"],
    applications: ["Commercial RO", "Small industrial RO", "Housing societies"],
    packing: packStandard,
  },
  {
    slug: "lk-5010-ro-antiscalant",
    image: bLk5010,
    name: "LK 5010 RO Antiscalant",
    category: "ro-chemicals",
    description:
      "Polymer-based antiscalant and dispersant that inhibits calcium, magnesium, sulphate and nitrate scaling. A brown viscous liquid engineered for hard bore water — extends membrane cleaning cycles substantially.",
    features: ["pH 10–12 · Specific gravity 1.03 ± 0.01 · 20% solids", "Polymer base · brown viscous liquid · amber odour", "Antiscalant + dispersant — inhibits Ca, Mg and sulphate", "Dosage depends on water quality"],
    applications: ["Bore well RO", "Brackish water plants", "Beverage industry"],
    packing: packStandard,
  },
  {
    slug: "lk-5020-ro-antiscalant",
    name: "LK 5020 RO Antiscalant",
    category: "ro-chemicals",
    description:
      "The step up from LK 5010 — a higher-solids polymer antiscalant and dispersant for tougher feed water. Inhibits calcium, magnesium, sulphate and nitrate scale at high recovery.",
    features: ["pH 10–12 · Specific gravity 1.05 ± 0.01 · 25% solids", "Superior performance to LK 5010", "Polymer base · brown viscous liquid · amber odour", "Antiscalant + dispersant · Dosage depends on water quality"],
    applications: ["High hardness feed water", "Two-pass RO trains", "Industrial RO"],
    packing: packStandard,
  },
  {
    slug: "ro-ph-booster",
    image: bLk1044,
    name: "LK 1044 RO pH Booster (Food Grade)",
    category: "ro-chemicals",
    description:
      "A blend of food-grade chemicals that raises the pH of RO product water gently — no spikes, no hardness contribution — for stable downstream chemistry and palatable drinking water.",
    features: ["pH 10–12 · Specific gravity 1.10 ± 0.01 · 30% solids", "Mixture combination of food-grade chemicals", "Increases the pH value in product water", "Dosage depends on water quality"],
    applications: ["Post RO conditioning", "Bottled water", "Boiler make-up"],
    packing: packStandard,
  },
  {
    slug: "lk-555-ro-ph-booster",
    name: "LK 555 RO pH Booster (Food Grade)",
    category: "ro-chemicals",
    description:
      "Economical food-grade alkaline booster for permeate re-mineralisation in packaged water and process plants where a lighter dose profile is enough.",
    features: ["Food-grade blend", "No hardness contribution", "Gentle, stable pH lift"],
    applications: ["Packaged drinking water", "Process water conditioning"],
    packing: packStandard,
  },
  {
    slug: "ro-low-ph-cleaning-chemical",
    image: bLk1055,
    name: "LK 1055 RO Low pH Cleaning Chemical",
    category: "ro-chemicals",
    description:
      "Acidic membrane cleaner (pH 2) for inorganic scale — carbonates, sulphates and metal oxides. Strips the scale deposit off the membrane, makes it fresh and restores product water flow.",
    features: ["pH 2 · Specific gravity 1.20 ± 0.01 · 40% solids", "Acidic in nature, corrosion inhibited", "Dosage: 2 kg in 20 L of water", "Membrane safe"],
    applications: ["Carbonate scale removal", "Metal oxide cleaning", "Scheduled CIP"],
    packing: packStandard,
  },
  {
    slug: "ro-high-ph-cleaning-chemical",
    image: bLk1066,
    name: "LK 1066 RO High pH Cleaning Chemical",
    category: "ro-chemicals",
    description:
      "Alkaline membrane cleaner (pH 10–12) for organic, biological and colloidal fouling. Removes the deposits acid can't touch and pairs with LK 1055 for a complete two-step CIP.",
    features: ["pH 10–12 · Specific gravity 1.10 ± 0.01 · 30% solids", "Alkaline in nature, surfactant fortified", "Dosage: 2 kg in 20 L of water", "Fast contact time, rinses clean"],
    applications: ["Bio-fouling removal", "Colloidal iron cleaning", "Oil traces"],
    packing: packStandard,
  },
  {
    slug: "ro-membrane-cleaning-chemical",
    image: bMembrane,
    name: "RO Membrane Cleaning Kit (LK 1055 + LK 1066)",
    category: "ro-chemicals",
    description:
      "Two-step CIP kit — LK 1055 acid clean followed by LK 1066 alkaline clean — supplied as a matched pair with full application instructions.",
    features: ["Matched acid + alkaline CIP pair", "Application datasheet included", "Restores flux to design"],
    applications: ["Scheduled maintenance", "Restart after long shutdown"],
    packing: ["25 kg × 2 pair kit", "50 kg × 2 pair kit"],
  },
  {
    slug: "ro-cleaner-chemical-minerals",
    name: "RO Scale Remover (Mineral Foulant)",
    category: "ro-chemicals",
    description:
      "Off-line cleaner formulated to strip calcium carbonate, iron oxide and general mineral scaling from RO membrane surfaces.",
    features: ["Chelation and dispersion", "Powder concentrate", "Membrane safe"],
    applications: ["Scheduled CIP", "Flux recovery", "Reject flow restoration"],
    packing: packBags,
  },
  {
    slug: "ro-algae-fungi-remover",
    name: "RO Algae & Fungi Remover",
    category: "ro-chemicals",
    description:
      "Bio-foulant cleaner and neutraliser for RO systems — removes algae, fungi and bacterial slime from membranes and pre-treatment, then neutralises before restart.",
    features: ["Broad-spectrum bio-foulant removal", "Neutraliser step included", "Bio-fouling preventive dosing option"],
    applications: ["Biofouled membranes", "Pre-treatment sanitisation", "Restart cleaning"],
    packing: packStandard,
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

  // ============ 02 Boiler Chemicals ============
  {
    slug: "boiler-ph-booster",
    name: "LK 2011 Boiler pH Booster",
    category: "boiler-chemicals",
    description:
      "Alkalinity builder to hold boiler water pH in the protective 10.5–11.5 range across low, medium and high pressure boilers.",
    features: ["All pressure classes", "Neutralising amines optional", "Steady release", "Compatible with condensate"],
    applications: ["Boiler drum dosing", "Condensate line protection"],
    packing: packStandard,
  },
  {
    slug: "boiler-antiscalant",
    name: "LK 2022 Boiler Antiscalant",
    category: "boiler-chemicals",
    description:
      "Polymer dispersant that keeps hardness salts suspended for blow-down removal — protects tubes across all pressure ranges.",
    features: ["Low, medium & high pressure boilers", "Sludge conditioning action", "No boiler acid"],
    applications: ["Industrial steam boilers", "Package boilers", "Waste heat boilers"],
    packing: packStandard,
  },
  {
    slug: "boiler-oxygen-scavenger",
    name: "LK 2044 Boiler Oxygen Scavenger",
    category: "boiler-chemicals",
    description:
      "Hydrazine-free scavenger that removes dissolved oxygen instantly — protects the pre-boiler section, feed lines and economiser from pitting corrosion.",
    features: ["Volatile, no TDS build-up", "Fast reaction", "Food-safe grade available"],
    applications: ["Deaerator dosing", "Feed water lines"],
    packing: packStandard,
  },
  {
    slug: "lk-2055-boiler-sludge-conditioner",
    name: "LK 2055 Boiler Sludge Conditioner",
    category: "boiler-chemicals",
    description:
      "Keeps precipitated solids fluid and non-adherent so they leave with the blow-down instead of baking onto tubes and drums.",
    features: ["Fluidises boiler sludge", "Prevents secondary scale", "Works with LK 2022 antiscalant"],
    applications: ["High make-up boilers", "Boilers on hard feed water"],
    packing: packStandard,
  },
  {
    slug: "lk-2066-boiler-anti-corrosive",
    name: "LK 2066 Boiler Anti-Corrosive",
    category: "boiler-chemicals",
    description:
      "Corrosion inhibitor for boiler internals and condensate systems — passivates metal surfaces and holds the protective magnetite layer intact.",
    features: ["Multi-metal protection", "Condensate system coverage", "All pressure classes"],
    applications: ["Steam boilers", "Hot water generators", "Idle boiler lay-up"],
    packing: packStandard,
  },
  {
    slug: "boiler-water-treatment-chemical",
    name: "LK 2001 Boiler Multi-Functional Chemical",
    category: "boiler-chemicals",
    description:
      "All-in-one internal treatment combining scale control, corrosion protection, oxygen scavenging and pH management in a single dose stream.",
    features: ["Single-drum programme", "Reduces monitoring load", "Cost-optimised"],
    applications: ["Small to mid boilers", "Textile and food industry"],
    packing: packStandard,
  },
  {
    slug: "boiler-descaling-chemical",
    name: "Boiler Descaling Chemical",
    category: "boiler-chemicals",
    description:
      "Off-line acid descaler with corrosion inhibitor for reviving hard-scaled boilers to design efficiency.",
    features: ["Inhibited acid blend", "Endpoint indicator", "Safe on carbon steel"],
    applications: ["Boiler shutdown cleaning", "Scale removal restarts"],
    packing: packStandard,
  },
  {
    slug: "boiler-boil-out-chemical",
    name: "Boiler Boil-Out Chemical",
    category: "boiler-chemicals",
    description:
      "Alkaline boil-out compound for commissioning new boilers — removes mill scale, oil and preservative films before the first steaming.",
    features: ["New boiler commissioning", "Removes oil & mill scale", "Passivation-ready surface"],
    applications: ["New installations", "Post-repair commissioning"],
    packing: packStandard,
  },

  // ============ 03 Cooling Tower Chemicals ============
  {
    slug: "cooling-tower-antiscalant",
    name: "LK 3001 CT Antiscalant cum Anti-Corrosive",
    category: "cooling-tower-chemicals",
    description:
      "Dual-action threshold antiscalant and corrosion inhibitor that lets you run higher cycles of concentration without carbonate scale or metal loss.",
    features: ["Antiscalant + anti-corrosive in one drum", "High CoC operation", "Polymer/phosphonate blend", "Stable at 50 °C"],
    applications: ["HVAC towers", "Process cooling loops"],
    packing: packStandard,
  },
  {
    slug: "cooling-tower-dealkalizer",
    name: "LK 3011 CT Dealkalizer (pH Controller)",
    category: "cooling-tower-chemicals",
    description:
      "Controlled acid feed to reduce M-alkalinity, hold pH in range and stabilise the Langelier saturation index.",
    features: ["Concentrated liquid", "Automated dosing compatible", "Cuts blow-down losses"],
    applications: ["High alkalinity make-up", "Blow-down reduction programmes"],
    packing: packStandard,
  },
  {
    slug: "cooling-tower-biocide",
    name: "LK 3031 CT Biocide (Non-Oxidising)",
    category: "cooling-tower-chemicals",
    description:
      "Broad-spectrum non-oxidising biocide controlling algae, bacteria and Legionella in open recirculating systems.",
    features: ["Alternate with oxidising biocide", "Rapid kill", "Low foaming"],
    applications: ["Comfort cooling", "Industrial towers"],
    packing: packStandard,
  },
  {
    slug: "lk-3033-ct-biocide",
    name: "LK 3033 CT Biocide (Non-Oxidising)",
    category: "cooling-tower-chemicals",
    description:
      "Second-chemistry non-oxidising biocide for rotation with LK 3031 — rotation prevents microbial populations from adapting to a single kill mechanism.",
    features: ["Rotation partner to LK 3031", "Broad-spectrum control", "Long contact activity"],
    applications: ["Biocide rotation programmes", "Heavy bio-load towers"],
    packing: packStandard,
  },
  {
    slug: "lk-3032-ct-biocide",
    name: "LK 3032 CT Biocide (Oxidising)",
    category: "cooling-tower-chemicals",
    description:
      "Oxidising biocide for fast knock-down of bacteria and algae — the backbone of any alternating biocide programme.",
    features: ["Fast oxidative kill", "Pairs with non-oxidising rotation", "Shock or continuous dosing"],
    applications: ["Open recirculating systems", "Shock dosing"],
    packing: packStandard,
  },
  {
    slug: "lk-3033p-ct-biocide",
    name: "LK 3033P CT Biocide (Oxidising)",
    category: "cooling-tower-chemicals",
    description:
      "Stabilised oxidising biocide variant for systems that need longer residual — sustained microbial control between doses.",
    features: ["Stabilised oxidising chemistry", "Longer residual than LK 3032", "Low corrosivity at use dilution"],
    applications: ["Large towers", "Long-loop systems"],
    packing: packStandard,
  },
  {
    slug: "cooling-tower-biodispersant",
    name: "CT Biodispersant",
    category: "cooling-tower-chemicals",
    description:
      "Penetrates and disperses established biofilm so biocides can reach the microbes underneath.",
    features: ["Biofilm penetration", "Non-ionic", "Chlorine compatible"],
    applications: ["Biofilm-prone systems", "Restart after shutdown"],
    packing: packStandard,
  },
  {
    slug: "cooling-tower-anti-corrosion-chemical",
    name: "CT Anti-Corrosion Chemical",
    category: "cooling-tower-chemicals",
    description:
      "Film-forming inhibitor protecting mild steel, copper and galvanised surfaces from oxygen corrosion.",
    features: ["Multi-metal protection", "Tolyltriazole for yellow metals", "Low phosphorus options"],
    applications: ["Mixed-metallurgy loops", "Chilled water systems"],
    packing: packStandard,
  },
  {
    slug: "ct-defoamer-sludge-conditioner",
    name: "CT Defoamer & Sludge Conditioner",
    category: "cooling-tower-chemicals",
    description:
      "Knocks down foam in the basin and conditions suspended solids so they blow down instead of settling in the fill and sump.",
    features: ["Instant foam knock-down", "Sludge fluidisation", "Compatible with full CT programme"],
    applications: ["Foaming towers", "High-solids make-up water"],
    packing: packStandard,
  },
  {
    slug: "cooling-tower-water-treatment-chemical",
    name: "Cooling Tower Complete Programme",
    category: "cooling-tower-chemicals",
    description:
      "Complete conditioned dosing programme — antiscalant, biocides, dispersant and inhibitor in one plan, formulated to your make-up water.",
    features: ["Bundled programme", "Site-specific formulation", "Includes monitoring plan"],
    applications: ["Full cooling programme customers"],
    packing: packStandard,
  },

  // ============ 04 Chiller Chemicals ============
  {
    slug: "chiller-anti-corrosive",
    name: "Chiller Anti-Corrosive Chemical",
    category: "chiller-chemicals",
    description:
      "Protective inhibitor for closed chilled-water loops — the pipework you never see stays passivated, so heat transfer and flow stay at design year after year.",
    features: ["Closed-loop corrosion control", "Multi-metal protection", "Low maintenance dose"],
    applications: ["Chilled water loops", "Secondary cooling circuits"],
    packing: packStandard,
  },
  {
    slug: "chiller-biocide",
    name: "Chiller Biocide Chemical",
    category: "chiller-chemicals",
    description:
      "Controls bacterial growth and slime in closed chiller circuits where stagnant zones breed microbiological fouling.",
    features: ["Closed-system formulation", "Broad-spectrum control", "Compatible with inhibitors"],
    applications: ["Chilled loops", "Process cooling"],
    packing: packStandard,
  },
  {
    slug: "chiller-passivation",
    name: "Chiller Passivation Chemical",
    category: "chiller-chemicals",
    description:
      "Builds the protective oxide layer on new or freshly-cleaned chiller circuits before they go back into service — the step that makes descaling last.",
    features: ["Post-cleaning passivation", "New system commissioning", "Extends inhibitor life"],
    applications: ["After chiller descaling", "New chiller commissioning"],
    packing: packStandard,
  },
  {
    slug: "chiller-cleaning-chemical",
    name: "Chiller Cleaning Chemical",
    category: "chiller-chemicals",
    description:
      "Two-stage acid/alkaline chiller cleaning kit that restores heat exchange efficiency to design.",
    features: ["Two-stage programme", "Copper-safe chemistry", "Complete kit"],
    applications: ["Water-cooled chillers", "Absorption chillers"],
    packing: ["25 kg × 2 pair kit"],
  },

  // ============ 05 Descaling Chemicals ============
  {
    slug: "descaling-compound",
    name: "LK 99 Descaling Compound",
    category: "descaling-chemicals",
    description:
      "The universal descaler — a corrosion-inhibited compound for all types of systems: boilers, chillers, condensers, cooling towers, heat exchangers, moulds and pipelines.",
    features: ["For all types of systems", "Corrosion inhibited", "Visual endpoint indicator", "Easy to dose"],
    applications: ["Boilers & chillers", "Condensers & heat exchangers", "Pipelines & moulds"],
    packing: packBags,
  },
  {
    slug: "lk-99a-descaling-compound",
    name: "LK 99A Descaling Compound (Copper & SS)",
    category: "descaling-chemicals",
    description:
      "The metal-safe variant of LK 99 — formulated specifically for copper and stainless steel equipment where standard acid descalers would attack the base metal.",
    features: ["Safe on copper & SS metal", "Corrosion inhibited", "Endpoint indicator"],
    applications: ["Copper condensers", "SS heat exchangers", "Sensitive equipment"],
    packing: packBags,
  },
  {
    slug: "condenser-descaling-chemical",
    name: "Condenser Descaling Chemical",
    category: "descaling-chemicals",
    description:
      "Purpose-built inhibited acid for shell-and-tube condensers — safe on copper tubes and tube sheets.",
    features: ["Copper safe", "Endpoint indicator", "Fast dissolution"],
    applications: ["Chiller condensers", "Steam condensers"],
    packing: packStandard,
  },
  {
    slug: "scale-remover",
    name: "Scale Remover",
    category: "descaling-chemicals",
    description:
      "General-purpose acidic scale remover for hard-water deposits across small equipment.",
    features: ["Fast-acting", "Low fumes", "Buffered"],
    applications: ["Heat exchangers", "Auxiliary equipment"],
    packing: packStandard,
  },

  // ============ 06 ETP & STP Chemicals ============
  {
    slug: "poly-aluminium-chloride",
    name: "Coagulants — Alum & PAC (All Types)",
    category: "etp-stp-chemicals",
    description:
      "Ferric alum and poly aluminium chloride coagulants for raw water clarification, sludge settlement and colour cutting in ETP and STP primary treatment — powder and liquid forms.",
    features: ["Alum & PAC, all types", "High basicity PAC", "Wide pH range", "Low residual aluminium"],
    applications: ["Clarifiers", "ETP primary treatment", "STP sludge settlement"],
    packing: packBags,
  },
  {
    slug: "polyelectrolytes-flocculants",
    name: "Polyelectrolytes / Flocculants (Anionic · Cationic · Non-Ionic)",
    category: "etp-stp-chemicals",
    description:
      "Complete flocculant range — anionic, cationic and non-ionic polyelectrolytes for floc building, sludge thickening and dewatering across ETP and STP duty.",
    features: ["All three ionicities stocked", "Powder & emulsion grades", "Centrifuge & filter-press proven"],
    applications: ["Sludge dewatering", "Clarifier polishing", "Effluent colour cutting"],
    packing: packBags,
  },
  {
    slug: "bio-culture",
    name: "Bio Culture",
    category: "etp-stp-chemicals",
    description:
      "Selected microbial consortium that kick-starts and re-seeds biological treatment — faster BOD/COD reduction and quicker recovery from shock loads.",
    features: ["Rapid biomass development", "Shock-load recovery", "Aerobic & anaerobic strains"],
    applications: ["STP commissioning", "ETP bio-reactor recovery", "MBBR / SBR systems"],
    packing: ["1 kg pouch", "25 kg bag"],
  },
  {
    slug: "etp-defoamer",
    name: "Defoamer (Anti-Foaming Agent)",
    category: "etp-stp-chemicals",
    description:
      "Silicone and non-silicone defoamers that collapse foam in aeration tanks, cooling systems and process vessels at ppm doses.",
    features: ["Instant foam collapse", "Silicone & non-silicone grades", "Effective at low ppm"],
    applications: ["Aeration tanks", "Process vessels", "Cooling systems"],
    packing: packStandard,
  },
  {
    slug: "urea-dap-nutrients",
    name: "Urea & DAP (Bio Nutrients)",
    category: "etp-stp-chemicals",
    description:
      "Nitrogen and phosphorus nutrient dosing for biological treatment plants running nutrient-deficient industrial effluent.",
    features: ["Maintains BOD:N:P ratio", "Technical grade", "Steady biomass health"],
    applications: ["Industrial ETPs", "Nutrient-deficient effluent"],
    packing: ["50 kg bag"],
  },
  {
    slug: "caustic-lime",
    name: "Caustic & Lime",
    category: "etp-stp-chemicals",
    description:
      "pH correction workhorses for effluent neutralisation — caustic soda for fast trim, hydrated lime for bulk neutralisation and heavy metal precipitation.",
    features: ["Bulk & trim pH correction", "Heavy metal precipitation", "Always in stock"],
    applications: ["Effluent neutralisation", "Metal precipitation"],
    packing: ["50 kg bag", "25 kg bag"],
  },
  {
    slug: "etp-sludge-conditioner",
    name: "Sludge Conditioner (ETP / STP)",
    category: "etp-stp-chemicals",
    description:
      "Conditions biological and chemical sludge for faster settlement and drier cake off the filter press or centrifuge.",
    features: ["Faster settlement", "Drier cake", "Cuts polymer consumption"],
    applications: ["Sludge settlement", "Dewatering lines"],
    packing: packBags,
  },

  // ============ 07 Water Treatment Chemicals ============
  {
    slug: "smbs",
    name: "SMBS (Sodium Metabisulphite)",
    category: "water-treatment-chemicals",
    description:
      "Dechlorination workhorse — protects RO membranes from chlorine attack and doubles as an oxygen scavenger and preservative.",
    features: ["RO dechlorination", "Food grade available", "Membrane preservation solution"],
    applications: ["RO pre-treatment", "Membrane storage", "Effluent dechlorination"],
    packing: ["25 kg bag"],
  },
  {
    slug: "citric-acid",
    name: "Citric Acid",
    category: "water-treatment-chemicals",
    description:
      "Food-grade anhydrous citric acid for descaling and pH adjustment where chloride-free chemistry is required.",
    features: ["Food grade", "Chloride free"],
    applications: ["Membrane cleaning", "Sensitive equipment"],
    packing: ["25 kg bag"],
  },
  {
    slug: "hcl-acid",
    name: "HCL Acid (Commercial)",
    category: "water-treatment-chemicals",
    description:
      "Commercial hydrochloric acid for pH correction, resin regeneration and descaling duty — supplied with proper handling guidance.",
    features: ["Commercial grade", "Consistent strength", "Safe-handling support"],
    applications: ["pH correction", "DM plant regeneration", "Descaling"],
    packing: ["35 kg carboy", "50 kg carboy"],
  },
  {
    slug: "sodium-hypochlorite",
    name: "Sodium Hypochlorite (Hypo)",
    category: "water-treatment-chemicals",
    description:
      "Industrial grade 12% chlorine liquid — disinfection, oxidation and shock dosing.",
    features: ["12% available chlorine", "Stabilised grade"],
    applications: ["Water disinfection", "Cooling tower shock dosing", "STP disinfection"],
    packing: ["25 kg carboy", "50 kg drum", "200 kg drum"],
  },
  {
    slug: "caustic-soda",
    name: "Caustic Soda",
    category: "water-treatment-chemicals",
    description:
      "Caustic soda flakes and lye for pH correction, neutralisation, CIP and resin regeneration across the water train.",
    features: ["Flakes & lye supply", "Consistent purity", "Bulk contracts available"],
    applications: ["pH correction", "Anion resin regeneration", "CIP systems"],
    packing: ["50 kg bag", "25 kg bag"],
  },
  {
    slug: "biocides-i-ii",
    name: "Biocide I & Biocide II",
    category: "water-treatment-chemicals",
    description:
      "Twin general-purpose biocides for alternating dosing programmes across raw water, process water and effluent systems.",
    features: ["Two rotating chemistries", "Broad-spectrum control", "Programme dosing guidance"],
    applications: ["Raw water storage", "Process water systems", "Effluent polishing"],
    packing: packStandard,
  },

  // ============ 08 Resin & AHU Cleaning ============
  {
    slug: "resin-cleaning-chemical",
    name: "Resin Cleaning Chemical",
    category: "resin-ahu-cleaning",
    description:
      "Inhibited acidic cleaner that recharges fouled softener and DM resin without attacking the beads — iron, hardness and organic contamination stripped out, output hardness back in spec.",
    features: ["Inhibited — no attack on resin granules", "Removes iron & organic fouling", "Restores exchange capacity", "For all types of softeners"],
    applications: ["Softener resin beds", "DM plant resin", "Mixed bed polishers"],
    packing: packBags,
  },
  {
    slug: "ahu-cleaning-chemical",
    name: "AHU Coil Cleaning Chemical",
    category: "resin-ahu-cleaning",
    description:
      "Alkaline coil cleaning compound for air handling units — lifts thick dust coating, oil and biofilm from cooling coils and drain pans while treating aluminium fins gently and preserving fin gaps.",
    features: ["Safe on aluminium fins", "Maintains fin gaps", "Non-fuming", "Foam or spray application"],
    applications: ["HVAC preventive maintenance", "Commercial buildings", "Pharma AHUs"],
    packing: packStandard,
  },
  {
    slug: "fcu-cleaning-chemical",
    name: "FCU Coil Cleaning Chemical",
    category: "resin-ahu-cleaning",
    description:
      "Fan coil unit cleaner formulated to be used in occupied spaces — low odour, quick rinse.",
    features: ["Low odour", "Fast rinse", "Ready to use"],
    applications: ["Hotel and hospital FCUs", "Retail HVAC"],
    packing: packStandard,
  },

  // ============ 09 Plants & Equipment ============
  {
    slug: "industrial-ro-plants",
    image: bRoPlantPipes,
    name: "Industrial RO Plants (1 KL – 100 KL)",
    category: "plants-equipment",
    description:
      "New RO plant installations from 1 KL to 100 KL in SS and FRP — engineered, installed and commissioned by our own team, with extension of old plants and cleaning services after.",
    features: ["1 KL to 100 KL capacities", "SS & FRP construction", "SS skids, panel box, dosing pump (6/10 LPH)", "Extension of old plants"],
    applications: ["Process water", "Drinking water", "Boiler feed pre-treatment"],
    packing: packPlant,
  },
  {
    slug: "dm-plants",
    image: bDmPlant,
    name: "DM Plants",
    category: "plants-equipment",
    description:
      "Demineralisation plants of all types — new installations, extensions, resin change-outs and full service support.",
    features: ["All types of DM plants", "All types of DM resins", "Extension of old plants", "DM plant service"],
    applications: ["Boiler feed water", "Power & pharma process water"],
    packing: packPlant,
  },
  {
    slug: "softener-plants",
    image: bSoftener,
    name: "Softener Plants (MS & FRP)",
    category: "plants-equipment",
    description:
      "MS and FRP softeners with vessels in SS, MS and FRP — multiport valves of all types, diaphragm valves, resins of all brands and water testing kits.",
    features: ["MS & FRP construction · vessels in SS, MS, FRP", "Multiport valves (all types) · diaphragm valves", "Resins (all brands) · water testing kits", "New installations & extension of old plants"],
    applications: ["Cooling tower make-up", "Boiler feed", "Commercial buildings"],
    packing: packPlant,
  },
  {
    slug: "stp-plants",
    name: "STP Plants (Sewage Treatment)",
    category: "plants-equipment",
    description:
      "Sewage treatment plants for gated communities, apartments, malls, IT campuses, hotels, hospitals and schools — MBBR and SBR technologies, sized to occupancy.",
    features: ["MBBR & SBR technologies", "Compact footprints", "Reuse-quality treated water", "O&M support available"],
    applications: ["Gated communities & apartments", "Hotels & hospitals", "IT campuses & schools"],
    packing: packPlant,
  },
  {
    slug: "etp-plants",
    name: "ETP Plants (Effluent Treatment)",
    category: "plants-equipment",
    description:
      "Effluent treatment plants built on aerobic, anaerobic, MBBR and SBR technologies — designed to your effluent characteristics and discharge norms.",
    features: ["Aerobic / Anaerobic / MBBR / SBR", "Designed to PCB norms", "Turnkey civil + mechanical + electrical"],
    applications: ["Pharma & chemical plants", "Food & beverage", "Textile processing"],
    packing: packPlant,
  },
  {
    slug: "uf-plants",
    name: "Ultrafiltration (UF) Plants",
    category: "plants-equipment",
    description:
      "Ultrafiltration systems as RO pre-treatment or standalone clarification — consistent SDI below 3 feeding your membranes.",
    features: ["Hollow-fibre UF membranes", "Automated backwash", "RO pre-treatment duty"],
    applications: ["RO pre-treatment", "Surface water clarification", "Effluent recycle"],
    packing: packPlant,
  },
  {
    slug: "desalination-plants",
    name: "Desalination Plants",
    category: "plants-equipment",
    description:
      "Brackish and sea water desalination plants — high-rejection membranes, energy-conscious design, built for coastal and high-TDS ground water.",
    features: ["Sea & brackish water duty", "High-rejection membranes", "Corrosion-resistant materials"],
    applications: ["Coastal industry", "High TDS bore water", "Drinking water schemes"],
    packing: packPlant,
  },
  {
    slug: "sand-carbon-filters",
    image: bVessels,
    name: "Sand & Carbon Filters",
    category: "plants-equipment",
    description:
      "Pressure sand filters and activated carbon filters with fresh media — turbidity, odour and free chlorine removal ahead of softeners and RO.",
    features: ["FRP / MS / SS vessels", "Sand & carbon media supply", "Multiport or diaphragm valves"],
    applications: ["RO pre-treatment", "Process water polishing"],
    packing: packPlant,
  },
  {
    slug: "iron-removal-beds",
    name: "Iron Removal Beds",
    category: "plants-equipment",
    description:
      "Catalytic iron removal filters for bore water — stops iron staining, fouling and taste complaints at the source.",
    features: ["Catalytic media beds", "Handles high-iron bore water", "Low maintenance backwash"],
    applications: ["Bore well water", "Housing & industry intake"],
    packing: packPlant,
  },
  {
    slug: "cooling-tower-frp-fills",
    name: "Cooling Tower FRP Fills",
    category: "plants-equipment",
    description:
      "Replacement FRP fills, drift eliminators and nozzles that bring tower approach temperature back to design.",
    features: ["Standard & custom profiles", "UV-stabilised FRP", "Supply & installation"],
    applications: ["Cooling tower refurbishment", "Approach temperature recovery"],
    packing: ["Per tower requirement", "Supply & installation"],
  },
  {
    slug: "ro-membranes-spares",
    image: bMembrane,
    name: "RO Membranes & Spares (All Makes)",
    category: "plants-equipment",
    description:
      "Membranes of all makes, membrane housings and end caps, micron filters (wound & spun — jumbo & slim), filter housings in SS/PVC/FRP, pressure vessels, multiport valves, rotometers, pressure gauges, UV lamps, conductivity, pH and TDS meters and high pressure pumps.",
    features: ["Membranes — all makes", "Micron filters: wound & spun, jumbo & slim", "Filter housings: SS, PVC, FRP — all sizes", "UV lamps, conductivity, pH & TDS meters"],
    applications: ["RO plant spares", "Plant retrofits", "Preventive stock"],
    packing: ["Per unit", "Case packs"],
  },
  {
    slug: "dosing-pump",
    name: "Dosing Pumps (6 & 10 LPH)",
    category: "plants-equipment",
    description:
      "Electromagnetic and motor-driven dosing pumps sized to match every chemical programme we supply.",
    features: ["6 & 10 LPH standard, up to 50 L/hr", "Manual and automatic", "Warranty backed"],
    applications: ["Chemical dosing skids", "Plant retrofits"],
    packing: ["Single unit"],
  },
  {
    slug: "industrial-pumps",
    name: "Industrial Pumps (Kirloskar & All Makes)",
    category: "plants-equipment",
    description:
      "High pressure pumps for RO trains and general-duty industrial pumps — Kirloskar and all leading makes, sized and supplied with the plant or as replacements.",
    features: ["Kirloskar & leading makes", "RO high pressure pumps", "Sizing & installation support"],
    applications: ["RO plants", "Transfer & booster duty"],
    packing: ["Per unit"],
  },
  {
    slug: "ion-exchange-resin",
    name: "Ion Exchange Resins (All Brands)",
    category: "plants-equipment",
    description:
      "Strong acid cation and strong base anion resins for softening, DM and mixed-bed polishing — all brands supplied.",
    features: ["Uniform bead size", "High capacity", "Food and pharma grades"],
    applications: ["Water softeners", "DM plants", "Mixed bed polishers"],
    packing: ["25 L bag", "1 m³ bulk bag"],
  },
  {
    slug: "micro-filters",
    name: "Micron Filters (Wound & Spun)",
    category: "plants-equipment",
    description:
      "Polypropylene cartridge filters — wound and spun, jumbo and slim, 1 to 10 micron ratings for RO pre-treatment and final polishing.",
    features: ["10\" to 40\" lengths", "Jumbo & slim formats", "Multiple micron ratings"],
    applications: ["RO pre-treatment", "Beverage filtration"],
    packing: ["Case of 20"],
  },
  {
    slug: "air-filters",
    name: "Air Filters (HEPA & Pre-Filters)",
    category: "plants-equipment",
    description:
      "HEPA and pre-filter media replacements for cleanroom and HVAC applications.",
    features: ["G4 to H14 grades", "Custom sizes"],
    applications: ["Pharma HVAC", "Cleanrooms"],
    packing: ["Per unit"],
  },
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
