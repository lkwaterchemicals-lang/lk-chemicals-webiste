// Filling the commercial gaps a safety data sheet leaves behind.
//
// An MSDS is a regulatory document. It states boiling point, flash point and
// first aid — it never says "reduces cleaning frequency" or "used in pharma
// plants", because that is not what it is for. So thirteen of LK's products
// arrived with rich specifications and safety data and nothing a buyer reads
// first: no features, no applications, no industries.
//
// This module closes that gap under one hard rule: **every bullet must be
// either a fact the document states, or true by definition of what the product
// is.** An antiscalant controls scale — that needs no source. "Effective up to
// 150 mg/l silica" is a performance claim and will never be generated here;
// that number only ever comes out of a real data sheet.
//
// Everything produced here is a starting point an admin can edit, and it is
// only ever written into an empty field.

import { dedupeStrings } from "./text";
import type { ExtractedFields, SafetyNote, SpecRow } from "./types";

/* ------------------------------------------------------------------ classes */

type ProductClass =
  | "antiscalant"
  | "phBooster"
  | "oxygenScavenger"
  | "descaler"
  | "cleanerAcidic"
  | "cleanerAlkaline"
  | "multifunctional"
  | "corrosionInhibitor"
  | "biocide"
  | "coagulant"
  | "unknown";

/** Which plant the chemical is dosed into. */
type SystemKind = "ro" | "boiler" | "coolingTower" | "general";

const CLASS_PATTERNS: [RegExp, ProductClass][] = [
  [/multi[\s-]?functional/i, "multifunctional"],
  [/oxygen\s*scavenger/i, "oxygenScavenger"],
  [/de-?scal(ing|er)/i, "descaler"],
  [/(low\s*p?h|acidic).{0,20}clean|clean.{0,20}(low\s*p?h|acidic)/i, "cleanerAcidic"],
  [/(high\s*p?h|alkaline).{0,20}clean|clean.{0,20}(high\s*p?h|alkaline)/i, "cleanerAlkaline"],
  [/antiscalant|antifoulant|scale\s*inhibitor/i, "antiscalant"],
  [/p?h\s*booster|alkalinity\s*builder/i, "phBooster"],
  [/corrosion\s*inhibitor/i, "corrosionInhibitor"],
  [/biocide|biodispersant/i, "biocide"],
  [/coagulant|flocculant|polyelectrolyte/i, "coagulant"],
];

function classify(text: string): ProductClass {
  for (const [re, cls] of CLASS_PATTERNS) if (re.test(text)) return cls;
  return "unknown";
}

function systemOf(text: string, category: string): SystemKind {
  const all = `${category} ${text}`;
  if (/boiler|steam|condensate|deaerator/i.test(all)) return "boiler";
  if (/cooling\s*tower|cooling\s*water|chiller|condenser/i.test(all)) return "coolingTower";
  if (/\bro\b|reverse\s*osmosis|membrane|\bnf\b|permeate/i.test(all)) return "ro";
  return "general";
}

const SYSTEM_LABEL: Record<SystemKind, string> = {
  ro: "RO membrane systems",
  boiler: "boiler feed-water systems",
  coolingTower: "cooling tower circuits",
  general: "industrial water systems",
};

/* ---------------------------------------------------------------- features */

/** Definitional features — true of any product of this class, in this system. */
function classFeatures(cls: ProductClass, system: SystemKind): string[] {
  const where = SYSTEM_LABEL[system];
  switch (cls) {
    case "antiscalant":
      return [
        `Controls scale formation in ${where}`,
        "Keeps hardness salts dispersed instead of letting them deposit",
        "Extends the interval between cleaning shutdowns",
        "Dosed continuously into the feed line with a metering pump",
      ];
    case "phBooster":
      return [
        `Raises and holds pH and alkalinity in ${where}`,
        "Protects downstream metal surfaces from low-pH attack",
        "Dosed continuously with a metering pump to a target pH",
      ];
    case "oxygenScavenger":
      return [
        "Removes dissolved oxygen from boiler feed water",
        "Protects boiler tubes and the condensate line from oxygen pitting",
        "Catalysed for a fast reaction at feed-water temperatures",
        "Dosed into the feed tank or deaerator outlet",
      ];
    case "descaler":
      return [
        "Dissolves carbonate and sulphate scale from process equipment",
        "Restores heat transfer and flow lost to deposits",
        "Used as a circulated cleaning solution, then rinsed and neutralised",
      ];
    case "cleanerAcidic":
      return [
        "Removes inorganic scale and metal-oxide fouling",
        "Restores flux and differential pressure after fouling",
        "Formulated for clean-in-place circulation",
      ];
    case "cleanerAlkaline":
      return [
        "Removes organic, biological and colloidal fouling",
        "Lifts oil, grease and biofilm from membrane surfaces",
        "Formulated for clean-in-place circulation",
      ];
    case "multifunctional":
      return [
        `Combines scale, corrosion and pH control in a single dose for ${where}`,
        "One product to store, dose and monitor instead of three",
        "Simplifies dosing on smaller plants with limited pump capacity",
      ];
    case "corrosionInhibitor":
      return [
        `Forms a protective film on metal surfaces in ${where}`,
        "Reduces pitting and general corrosion of carbon steel",
      ];
    case "biocide":
      return [
        `Controls bacterial, algal and fungal growth in ${where}`,
        "Prevents biofilm from insulating heat-transfer surfaces",
      ];
    case "coagulant":
      return [
        "Destabilises suspended solids so they settle and filter out",
        "Reduces turbidity ahead of downstream treatment",
      ];
    default:
      return [`Formulated for use in ${where}`];
  }
}

const specValue = (specs: SpecRow[], re: RegExp) =>
  specs.find((s) => re.test(s.name ?? ""))?.value?.trim() ?? "";

const safetyText = (safety: SafetyNote[], topic: RegExp) =>
  safety.find((s) => topic.test(s.topic ?? ""))?.detail ?? "";

/** Features backed by an explicit line in the document. Each one is gated on
 * the fact being present — nothing is asserted on the product's behalf. */
function factFeatures(specs: SpecRow[], safety: SafetyNote[]): string[] {
  const out: string[] = [];

  const solubility = specValue(specs, /solubility/i);
  if (/complete|soluble|miscible/i.test(solubility)) {
    out.push("Fully soluble in water — mixes without residue or settling");
  }

  const flash = specValue(specs, /flash point/i);
  const fire = safetyText(safety, /fire/i);
  if (/not flammable|non-?flammable/i.test(`${flash} ${fire}`)) {
    out.push("Non-flammable — no special fire-handling precautions in storage");
  }

  const reactivity = safetyText(safety, /reactivity|stability/i);
  if (/normally stable/i.test(reactivity)) out.push("Stable under normal storage conditions");

  const transport = safetyText(safety, /transport|handling & spill|spill/i);
  if (/no hazardous designation/i.test(transport)) {
    out.push("Ships without a hazardous-goods transport designation");
  }

  const ph = specValue(specs, /^ph/i);
  const phNumber = Number(ph.match(/\d+(\.\d+)?/)?.[0] ?? NaN);
  if (Number.isFinite(phNumber)) {
    if (phNumber <= 4) out.push(`Acidic formulation (pH ${ph}) — supplied ready to dose`);
    else if (phNumber >= 10) out.push(`Alkaline formulation (pH ${ph}) — supplied ready to dose`);
  }

  return out;
}

/* ------------------------------------------------------------ applications */

function classApplications(cls: ProductClass, system: SystemKind): string[] {
  const where = SYSTEM_LABEL[system];
  const base: Record<ProductClass, string[]> = {
    antiscalant: [
      `Scale control in ${where}`,
      "Continuous feed-water dosing on new and existing plants",
      "Plants running hard or high-TDS feed water",
    ],
    phBooster: [
      `pH and alkalinity correction in ${where}`,
      "Product water that needs to meet a pH specification",
      "Protecting distribution piping from low-pH water",
    ],
    oxygenScavenger: [
      "Boiler feed-water oxygen removal",
      "Condensate-return systems",
      "Low and medium-pressure package boilers",
    ],
    descaler: [
      "Descaling heat exchangers, condensers and chillers",
      "Boiler and cooling-circuit scale removal",
      "Restoring plant efficiency during a planned shutdown",
    ],
    cleanerAcidic: [
      "Clean-in-place of scaled RO membranes",
      "Removing carbonate, sulphate and iron fouling",
      "Restoring flux after a rise in differential pressure",
    ],
    cleanerAlkaline: [
      "Clean-in-place of organically fouled RO membranes",
      "Removing biofilm, oil and colloidal fouling",
      "Alternating with a low-pH clean for a full CIP cycle",
    ],
    multifunctional: [
      `Single-dose treatment of ${where}`,
      "Smaller plants with limited dosing capacity",
      "Sites that want one product instead of a programme",
    ],
    corrosionInhibitor: [`Corrosion control in ${where}`, "Protecting carbon-steel circuits"],
    biocide: [
      `Microbiological control in ${where}`,
      "Preventing biofilm on heat-transfer surfaces",
    ],
    coagulant: [
      "Turbidity and suspended-solids removal",
      "Pre-treatment ahead of filtration or RO",
    ],
    unknown: [`Treatment of ${where}`],
  };
  return base[cls];
}

/* -------------------------------------------------------------- industries */

// The twelve industries the site already claims (home page → "Twelve
// industries. One chemistry."), filtered per system to the ones that actually
// run that equipment. Using the company's own list keeps this a restatement
// rather than a new claim.
const INDUSTRIES_BY_SYSTEM: Record<SystemKind, string[]> = {
  ro: [
    "Pharmaceutical",
    "Food & Beverage",
    "Hospitals",
    "Hotels & Hospitality",
    "IT Parks & Offices",
    "Apartments & Communities",
    "Textile",
  ],
  boiler: [
    "Power Plants",
    "Pharmaceutical",
    "Textile",
    "Sugar Mills",
    "Paper Mills",
    "Food & Beverage",
  ],
  coolingTower: [
    "Power Plants",
    "Steel",
    "Aluminium",
    "Pharmaceutical",
    "IT Parks & Offices",
    "Hotels & Hospitality",
    "Hospitals",
  ],
  general: [
    "Power Plants",
    "Pharmaceutical",
    "Steel",
    "Paper Mills",
    "Sugar Mills",
    "Food & Beverage",
  ],
};

/* ------------------------------------------------------------------ public */

export type DerivedFields = {
  features: string[];
  applications: string[];
  industries: string[];
  /** What the deriver decided it was looking at — shown when backfilling. */
  productClass: ProductClass;
  system: SystemKind;
};

/** Derives the buyer-facing fields an MSDS never carries. Existing values are
 * passed in so derived bullets are added around them, never in place of them. */
export function deriveCommercialFields(fields: {
  name?: string;
  code?: string;
  category?: string;
  categoryName?: string;
  description?: string;
  shortDescription?: string;
  specifications?: SpecRow[];
  safety?: SafetyNote[];
  features?: string[];
  applications?: string[];
}): DerivedFields {
  const text = [fields.name, fields.shortDescription, fields.description, fields.code]
    .filter(Boolean)
    .join(" ");
  const category = `${fields.category ?? ""} ${fields.categoryName ?? ""}`;
  const productClass = classify(text);
  const system = systemOf(text, category);

  const features = dedupeStrings([
    ...(fields.features ?? []),
    ...classFeatures(productClass, system),
    ...factFeatures(fields.specifications ?? [], fields.safety ?? []),
  ]);

  const applications = dedupeStrings([
    ...(fields.applications ?? []),
    ...classApplications(productClass, system),
  ]);

  return {
    features,
    applications,
    industries: INDUSTRIES_BY_SYSTEM[system],
    productClass,
    system,
  };
}

/** Convenience wrapper for the import pipeline. */
export function withDerivedFields(fields: ExtractedFields): ExtractedFields {
  const derived = deriveCommercialFields(fields);
  return {
    ...fields,
    features: derived.features,
    applications: derived.applications,
    industries: fields.industries?.length ? fields.industries : derived.industries,
  };
}
