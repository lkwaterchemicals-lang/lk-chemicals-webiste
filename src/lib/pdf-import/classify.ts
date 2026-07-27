// Deciding what a PDF *is* before touching the CMS.
//
// The brief is explicit: do not guess. So this is a scored classifier, not a
// best-effort label — every signal it finds is recorded with its weight, and a
// document that cannot clear CONFIDENCE_FLOOR is parked for review instead of
// being written into the catalog. An admin can read the signal list in the
// Import Center and see exactly why a decision was made.

import type { Classification, DocFamily, DocKind, Section, Signal } from "./types";
import { findSection } from "./text";

/** Below this, the pipeline refuses to create or update anything. */
export const CONFIDENCE_FLOOR = 0.55;

/** A product code as LK prints it: an optional brand prefix ("Scale Master"),
 * the LK marker, an optional series word ("CHEM"), then the number. The series
 * word is part of the identity — "LK 1001" and "LK CHEM 1001" are two
 * different sheets and must never be merged into one product. */
const CODE_RE =
  /\b((?:scale\s*master\s+)?LK(?:\s*[-–]?\s*(?:CHEM|CHEMICAL|CHEMICALS))?\s*[-–]?\s*(\d{2,5})(?:\s*(?:HP|LP|FG|XL))?)\b/i;

export function findCode(text: string): { code: string; codeKey: string; digits: string } | null {
  const m = text.match(CODE_RE);
  if (!m) return null;
  const code = m[1]
    .replace(/\s+/g, " ")
    .replace(/\s*[-–]\s*/g, " ")
    .trim();
  return {
    // "lk chem 1001" → "lk-chem-1001"; keeps the series token distinct.
    code: titleCaseCode(code),
    codeKey: code.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    digits: m[2],
  };
}

/** "scale master lk chem 1001" → "Scale Master LK CHEM 1001". */
function titleCaseCode(code: string): string {
  return code
    .split(/\s+/)
    .map((w) =>
      /^(lk|chem|chemical|chemicals|hp|lp|fg|xl)$/i.test(w)
        ? w.toUpperCase()
        : /^\d+$/.test(w)
          ? w
          : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join(" ");
}

/* ------------------------------------------------------------- vocabularies */

const SERVICE_WORDS = [
  "scope of work",
  "site visit",
  "our engineers",
  "service engineer",
  "manpower",
  "amc",
  "annual maintenance",
  "turnaround time",
  "on-site",
  "onsite",
  "man-days",
  "service offering",
  "we undertake",
  "commissioning",
  "installation & upgradation",
  "preventive maintenance",
  "service report",
  "labour",
  "mobilisation",
  "mobilization",
];

const PRODUCT_WORDS = [
  "specific gravity",
  "appearance",
  "solubility",
  "dosage",
  "dose rate",
  "ppm",
  "hdpe",
  "drums",
  "carboy",
  "shelf life",
  "cas no",
  "boiling point",
  "flash point",
  "sp gravity",
  "neat product",
  "dosing pump",
];

const CATEGORY_WORDS = [
  "product range",
  "range of products",
  "our range",
  "product catalogue",
  "product catalog",
  "range includes",
  "the following products",
  "product list",
  "price list",
  "brochure",
];

const count = (haystack: string, needles: string[]) =>
  needles.filter((n) => haystack.includes(n)).length;

/* -------------------------------------------------------------- classifier */

export function classify(pages: string[], sections: Section[], fileName: string): Classification {
  const text = pages.join("\n");
  const lower = text.toLowerCase();
  const head = pages[0]?.slice(0, 700).toLowerCase() ?? "";
  const signals: Signal[] = [];
  const add = (label: string, weight: number) => signals.push({ label, weight });

  /* ---- family: which template is this? */
  let family: DocFamily = "unknown";
  if (/material safety data sheet|safety data sheet|\bmsds\b/i.test(head)) {
    family = "msds";
    add("Titled “Material Safety Data Sheet”", 0.45);
  } else if (/product data sheet|technical data sheet|\btds\b/i.test(head)) {
    family = "tds";
    add("Titled “Product Data Sheet”", 0.45);
  }

  /* ---- structural evidence */
  const msdsSections = ["ingredients/application", "physical data", "health hazards"].filter((h) =>
    findSection(sections, [h]),
  ).length;
  if (msdsSections >= 2) {
    add(`${msdsSections} numbered MSDS sections present`, 0.2);
    if (family === "unknown") family = "msds";
  }

  const tdsSections = ["dosage", "applications", "specifications", "properties", "shipping"].filter(
    (h) => findSection(sections, [h]),
  ).length;
  if (tdsSections >= 2) {
    add(`${tdsSections} data-sheet sections present (dosage / specs / applications)`, 0.2);
    if (family === "unknown") family = "tds";
  }

  /* ---- identity: a single dominant product code means a single product */
  const code = findCode(`${firstMeaningfulLines(sections)}\n${fileName}`) ?? findCode(text);
  const codes = new Set<string>();
  for (const m of text.matchAll(new RegExp(CODE_RE.source, "gi"))) {
    codes.add(m[1].replace(/\s+/g, " ").toLowerCase());
  }
  if (code) add(`Product code “${code.code}” in the title`, 0.25);
  if (codes.size > 3) add(`${codes.size} different product codes — reads like a range`, 0.2);

  /* ---- vocabulary */
  const productHits = count(lower, PRODUCT_WORDS);
  const serviceHits = count(lower, SERVICE_WORDS);
  const categoryHits = count(lower, CATEGORY_WORDS);
  if (productHits >= 3) add(`${productHits} product-sheet terms (specs, dosage, packing)`, 0.2);
  if (serviceHits >= 2) add(`${serviceHits} service terms (scope of work, site visit, AMC)`, 0.25);
  if (categoryHits >= 1) add(`${categoryHits} range/catalogue terms`, 0.2);

  /* ---- the filename is weak evidence, but it is evidence */
  if (/\b(service|servicing|amc|maintenance)\b/i.test(fileName)) {
    add("Filename mentions a service", 0.1);
  }
  if (/\b(range|catalogue|catalog|brochure|list)\b/i.test(fileName)) {
    add("Filename mentions a range or brochure", 0.1);
  }

  /* ---- score the four possible outcomes */
  const scores: Record<DocKind, number> = {
    product: 0,
    productCategory: 0,
    service: 0,
    serviceCategory: 0,
  };

  if (family === "msds" || family === "tds") scores.product += 0.5;
  if (code) scores.product += 0.25;
  if (msdsSections >= 2 || tdsSections >= 2) scores.product += 0.2;
  scores.product += Math.min(productHits, 5) * 0.05;

  scores.service += Math.min(serviceHits, 5) * 0.12;
  if (/\b(scope of work|service offering|amc)\b/i.test(head)) scores.service += 0.3;
  if (family === "msds" || family === "tds") scores.service -= 0.45; // a data sheet is not a service

  // A category document describes many things at once: several codes, range
  // vocabulary, and none of the single-product apparatus.
  const rangeish = codes.size > 3 && productHits < 4;
  scores.productCategory += Math.min(categoryHits, 3) * 0.18 + (rangeish ? 0.3 : 0);
  if (code && codes.size <= 2) scores.productCategory -= 0.35;
  if (family === "msds") scores.productCategory -= 0.4;

  scores.serviceCategory += Math.min(categoryHits, 3) * 0.12 + Math.min(serviceHits, 4) * 0.1;
  if (serviceHits < 2) scores.serviceCategory -= 0.35;
  if (code) scores.serviceCategory -= 0.3;
  if (family === "msds" || family === "tds") scores.serviceCategory -= 0.4;

  const ranked = (Object.entries(scores) as [DocKind, number][]).sort((a, b) => b[1] - a[1]);
  const [topKind, topScore] = ranked[0];
  const runnerUp = ranked[1][1];
  const confidence = Math.max(0, Math.min(1, topScore));

  // "Do not guess" has two failure modes worth separating: nothing scored, and
  // two things scored alike. Both park the file for review.
  if (confidence < CONFIDENCE_FLOOR) {
    return {
      kind: null,
      family,
      confidence,
      signals,
      reason:
        signals.length === 0
          ? "No recognisable product, service or category structure in the document."
          : `Not confident enough to classify (best guess “${label(topKind)}” at ${Math.round(
              confidence * 100,
            )}%). Needs a human decision.`,
    };
  }
  if (topScore - runnerUp < 0.15) {
    return {
      kind: null,
      family,
      confidence,
      signals,
      reason: `Ambiguous — “${label(topKind)}” and “${label(ranked[1][0])}” scored almost the same.`,
    };
  }

  return { kind: topKind, family, confidence, signals };
}

/** The first few non-empty lines of the cover section — where a title lives. */
function firstMeaningfulLines(sections: Section[]): string {
  const lines: string[] = [];
  for (const s of sections) {
    for (const l of s.lines) {
      lines.push(l);
      if (lines.length >= 6) return lines.join("\n");
    }
  }
  return lines.join("\n");
}

export function label(kind: DocKind | null): string {
  switch (kind) {
    case "product":
      return "Product";
    case "productCategory":
      return "Product category";
    case "service":
      return "Service";
    case "serviceCategory":
      return "Service category";
    default:
      return "Unclassified";
  }
}

/** Firestore collection each kind writes to. */
export const COLLECTION_FOR: Record<DocKind, string> = {
  product: "products",
  productCategory: "categories",
  service: "services",
  serviceCategory: "serviceCategories",
};
