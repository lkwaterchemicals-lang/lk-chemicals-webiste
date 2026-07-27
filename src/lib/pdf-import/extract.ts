// Pulling structured CMS fields out of a parsed document.
//
// Three document templates are in circulation at LK, and this module handles
// all three from one section map:
//
//   A. PRODUCT DATA SHEET with ALL-CAPS headings (BASIC CHARACTERISTICS,
//      APPLICATIONS, SPECIFICATIONS, DOSAGE, SHIPPING …)
//   B. PRODUCT DATA SHEET with title-case headings (Product Description,
//      Function & Features, Properties Form, Dosage, Shipping)
//   C. MATERIAL SAFETY DATA SHEET with nine numbered sections
//
// Nothing here invents content. Where a field has no section of its own (an
// MSDS has no marketing description) the text is *assembled* from phrases the
// document actually prints, and only ever used to fill a blank.

import { findCode } from "./classify";
import { withDerivedFields } from "./derive";
import { codeSeries, resolveCategory, type CategoryLike } from "./taxonomy";
import { clampSentences, dedupeStrings, findSection, splitInline, toList, toProse } from "./text";
import type {
  Classification,
  DocKind,
  ExtractedFields,
  SafetyNote,
  Section,
  SpecRow,
} from "./types";

/* ------------------------------------------------------------------- names */

const COVER_HEADINGS = ["product data sheet", "material safety data sheet", "safety data sheet"];
const INGREDIENTS = ["ingredients/application", "ingredients"];

/** Cover-page lines: everything before the first content section. */
function coverLines(sections: Section[]): string[] {
  const lines: string[] = [];
  for (const s of sections) {
    if (s.heading && !COVER_HEADINGS.includes(s.heading)) break;
    lines.push(...s.lines);
  }
  return lines;
}

/** The product/service title, the code inside it, and the strap line printed
 * above it. */
function readTitle(sections: Section[], fileName: string) {
  const cover = coverLines(sections);
  const ingredients = findSection(sections, INGREDIENTS);
  const candidates = [...cover, ...(ingredients?.lines.slice(0, 2) ?? [])];

  // The title is the first line carrying a product code — that is what makes
  // it a title rather than a strap line or a synonym list.
  let titleLine = candidates.find((l) => findCode(l) && l.length <= 140) ?? "";
  // MSDS sheets sometimes print the bare code on the cover ("LK CHEM 1066")
  // and the full title in section 1; prefer the longer, more descriptive one.
  const richer = candidates
    .filter((l) => findCode(l) && l.length <= 140)
    .sort((a, b) => b.length - a.length)[0];
  if (richer && richer.length > titleLine.length + 4) titleLine = richer;
  if (!titleLine)
    titleLine = fileName
      .replace(/\.pdf$/i, "")
      .replace(/\s+/g, " ")
      .trim();

  // "LK CHEM 1001 Antiscalant, RO feed water treatment for scale control"
  //  → name "LK CHEM 1001 Antiscalant", application "RO feed water treatment…"
  const [namePart, ...restParts] = titleLine.split(",");
  const rest = restParts.join(",").trim();
  const name = tidyName(namePart);
  const applicationPhrase = rest.replace(/[.;]\s*$/, "").trim();

  // The strap line is a cover line that is neither the title nor letterhead —
  // "Membrane performance chemicals", "Boiler performance chemicals".
  const hint = cover.find(
    (l) =>
      l !== titleLine &&
      !findCode(l) &&
      l.length >= 8 &&
      l.length <= 80 &&
      !/^synonym/i.test(l) &&
      !/data sheet$/i.test(l),
  );

  return { name, titleLine, applicationPhrase, hint: hint?.replace(/[.:]$/, "").trim() };
}

function tidyName(raw: string): string {
  return raw
    .replace(/\s+/g, " ")
    .replace(/[,;.]+\s*$/, "")
    .replace(/\s*\(\s*/g, " (")
    .replace(/\s*\)\s*/g, ") ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ------------------------------------------------------------------- specs */

// Physical-property labels these sheets print. Listing them lets us parse
// "Solubility Soluble in water in all" — a label/value pair with no colon,
// which a generic splitter would drop.
const SPEC_LABELS = [
  "appearance",
  "colour",
  "color",
  "odor",
  "odour",
  "form",
  "physical state",
  "ph",
  "ph (neat)",
  "ph value",
  "specific gravity",
  "sp gravity",
  "sp. gravity",
  "density",
  "bulk density",
  "solubility",
  "solubility in water",
  "boiling point",
  "freezing point",
  "melting point",
  "flash point",
  "vapor pressure",
  "vapour pressure",
  "vapor density",
  "vapour density",
  "viscosity",
  "active content",
  "total solids",
  "chloride",
  "shelf life",
  "cas no",
  "cas no.",
  "ionic nature",
  "flammable limits",
  "auto-ignition",
];

const UNIT_RE =
  /^(.*?[\d).])\s*(°C|°F|ppm|ppb|mg\/l|mg\/L|meq\/l|%|kg|Kg|g\/cc|g\/ml|cP|mPa\.s|mm|months?|years?)$/;

/** Only a plainly numeric value gets its unit split off. "18 mm (Hg) @ 20 °C"
 * is a compound reading and stays whole; "100 °C" becomes 100 + °C. */
const PLAIN_NUMBER = /^[\d\s.,±+/–—-]+(?:to|and)?[\d\s.,±+/–—-]*$/i;

/** Values that carry no information — "Not Available", "None", "N/A". */
const isEmptyValue = (v: string) =>
  !v || /^(not\s+(available|applicable)|none(\s+available)?|n\/?a|nil|-{1,2})$/i.test(v.trim());

function specFromLine(line: string): SpecRow | null {
  const text = line.replace(/^•\s*/, "").trim();
  if (!text) return null;

  let name = "";
  let value = "";

  const colon = text.match(/^([^:]{2,48}?)\s*[:：]\s*(.+)$/);
  if (colon) {
    [, name, value] = colon;
  } else {
    // No colon: match the longest known label that prefixes the line.
    const lower = text.toLowerCase();
    const label = SPEC_LABELS.filter((l) => lower.startsWith(l)).sort(
      (a, b) => b.length - a.length,
    )[0];
    if (!label) return null;
    name = text.slice(0, label.length);
    value = text.slice(label.length).replace(/^[\s:=-]+/, "");
  }

  name = name.replace(/\s+/g, " ").trim();
  value = value
    .replace(/\s+/g, " ")
    .replace(/[.;,]\s*$/, "")
    .trim();
  if (!name || isEmptyValue(value) || value.length > 120) return null;
  // Guard against prose that happens to contain a colon.
  if (name.split(/\s+/).length > 6 || /\.\s/.test(name)) return null;

  const unitMatch = value.match(UNIT_RE);
  if (unitMatch && PLAIN_NUMBER.test(unitMatch[1]) && /\d/.test(unitMatch[1])) {
    return { name: prettyLabel(name), value: unitMatch[1].trim(), unit: unitMatch[2] };
  }
  return { name: prettyLabel(name), value, unit: "" };
}

/** "PH" → "pH", "Sp Gravity @ 25 °C" left alone, "SOLUBILITY" → "Solubility". */
function prettyLabel(name: string): string {
  if (/^ph\b/i.test(name)) return name.replace(/^ph/i, "pH");
  if (name === name.toUpperCase() && name.length > 3) {
    return name.charAt(0) + name.slice(1).toLowerCase();
  }
  return name;
}

function readSpecs(sections: Section[]): SpecRow[] {
  const rows: SpecRow[] = [];
  const specSections = sections.filter((s) =>
    /^(specifications?|properties|properties form|typical properties|physical properties|physical data|technical data)/.test(
      s.heading,
    ),
  );
  for (const section of specSections) {
    for (const line of section.lines) {
      const row = specFromLine(line);
      if (row) {
        rows.push(row);
        continue;
      }
      // An unlabelled first line in a Properties block is the appearance
      // ("Clear, Colorless liquid" / "Viscous , brown colour liquid").
      const text = line.replace(/^•\s*/, "").trim();
      if (
        !rows.some((r) => /appearance|form/i.test(r.name)) &&
        /\b(liquid|solid|powder|granul|crystal|colou?r|clear|viscous)\b/i.test(text) &&
        text.length <= 80 &&
        !text.includes(":")
      ) {
        rows.push({ name: "Appearance", value: text.replace(/\s+,/g, ",").trim(), unit: "" });
      }
    }
  }
  // Same property from both the TDS and the MSDS: keep the first spelling.
  const seen = new Set<string>();
  return rows.filter((r) => {
    const key = r.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ----------------------------------------------------------------- packing */

const PACK_UNITS: Record<string, string> = { l: "L", lit: "L", ltr: "L", litre: "L", liter: "L" };

/** "shipped in 5/25/35/55 Kg HDPE drums" → ["5 Kg HDPE drum", "25 Kg …"]. */
function readPacking(sections: Section[]): string[] {
  const section = findSection(sections, [
    "shipping",
    "packing",
    "packaging",
    "supply",
    "availability",
  ]);
  const text = section ? section.lines.join(" ") : "";
  if (!text) return [];
  const out: string[] = [];

  const re =
    /(\d+(?:\s*\/\s*\d+)*)\s*(kg|kgs|l|lit|ltr|litre|liter|ml)\b\.?\s*((?:hdpe|ldpe|pvc|plastic|ms|steel|carboy|jerry|poly\w*)\s+)?(drums?|containers?|cans?|carboys?|barrels?|jerry\s*cans?|bags?|pails?)?/gi;
  for (const m of text.matchAll(re)) {
    const sizes = m[1].split("/").map((s) => s.trim());
    const unitRaw = m[2].toLowerCase().replace(/s$/, "");
    const unit = PACK_UNITS[unitRaw] ?? m[2].replace(/s$/, "");
    const material = (m[3] ?? "").trim().toUpperCase();
    const vessel = (m[4] ?? "container").toLowerCase().replace(/s$/, "").replace(/\s+/g, " ");
    for (const size of sizes) {
      out.push(
        [`${size} ${unit}`, material, vessel.charAt(0).toUpperCase() + vessel.slice(1)]
          .filter(Boolean)
          .join(" "),
      );
    }
  }
  return dedupeStrings(out).slice(0, 10);
}

/* ------------------------------------------------------------------ safety */

// MSDS section headings → the label a buyer should see on the product page.
const SAFETY_TOPICS: { headings: string[]; topic: string }[] = [
  { headings: ["fire and explosion data"], topic: "Fire & explosion" },
  { headings: ["reactivity data"], topic: "Reactivity & stability" },
  { headings: ["health hazards"], topic: "Health hazards" },
  { headings: ["routes of entry and first aid", "first aid"], topic: "First aid" },
  {
    headings: ["special precautions and spill/leak procedures", "precautions"],
    topic: "Handling & spill procedure",
  },
  { headings: ["personal protection"], topic: "Personal protection" },
  { headings: ["handling", "handling & safety", "handling and safety"], topic: "Handling" },
  { headings: ["storage"], topic: "Storage" },
  { headings: ["materials to avoid"], topic: "Materials to avoid" },
  { headings: ["materials compatibility", "compatibility"], topic: "Materials compatibility" },
  { headings: ["transportation"], topic: "Transport" },
  { headings: ["disposal"], topic: "Disposal" },
];

function readSafety(sections: Section[]): SafetyNote[] {
  const notes: SafetyNote[] = [];
  for (const { headings, topic } of SAFETY_TOPICS) {
    const section = findSection(sections, headings);
    if (!section) continue;
    const detail = toProse(section, 700);
    if (detail.length > 20) notes.push({ topic, detail });
  }
  return notes;
}

/* -------------------------------------------------------------- industries */

const INDUSTRIES: [RegExp, string][] = [
  [/\bpharma(ceutical)?s?\b|\bapi\b/i, "Pharmaceutical"],
  [/\bfood\b|\bbeverage\b|\bdairy\b/i, "Food & Beverage"],
  [/\btextile\b|\bdye(ing)?\b/i, "Textile"],
  [/\bpower\b|\bthermal plant\b|\bcaptive power\b/i, "Power"],
  [/\bsugar\b|\bdistiller|\bbrewer/i, "Sugar & Distillery"],
  [/\bpaper\b|\bpulp\b/i, "Paper & Pulp"],
  // Deliberately narrow: "304 stainless steel" in a materials-compatibility
  // list is piping metallurgy, not a customer industry.
  [/\bsteel (plant|mill|industry)\b|\bmetallurg|\bfoundr/i, "Steel & Metals"],
  [/\bcement\b/i, "Cement"],
  [/\bautomobile\b|\bautomotive\b/i, "Automotive"],
  [/\bhospital\b|\bhealthcare\b/i, "Hospitals & Healthcare"],
  [/\bhotel\b|\bhospitality\b|\bmall\b/i, "Hotels & Hospitality"],
  [/\bcommercial building|\bit park|\boffice complex/i, "Commercial Buildings"],
  [/\bmunicipal\b|\bdrinking water\b/i, "Municipal & Drinking Water"],
  [/\bchemical (industry|plant|manufactur)/i, "Chemical Manufacturing"],
  [/\belectronic|\bsemiconductor/i, "Electronics"],
];

/** Industries are read from the customer-facing prose only. Scanning the whole
 * document would mine the compatibility and disposal sections, which mention
 * materials and regulators rather than markets. */
function readIndustries(parts: (string | undefined)[]): string[] {
  const haystack = parts.filter(Boolean).join(" ");
  return dedupeStrings(INDUSTRIES.filter(([re]) => re.test(haystack)).map(([, name]) => name));
}

/* ---------------------------------------------------------------- assembly */

/** Builds a description when the document has no prose block of its own, using
 * only phrases it actually prints. */
function assembleDescription(
  name: string,
  applicationPhrase: string,
  synonyms: string[],
  specs: SpecRow[],
  applications: string[],
): string {
  const parts: string[] = [];
  if (applicationPhrase) {
    parts.push(`${name} is ${indefinite(applicationPhrase)}.`);
  } else if (synonyms.length) {
    parts.push(`${name} is ${indefinite(synonyms.join(", ").toLowerCase())}.`);
  } else {
    parts.push(`${name}.`);
  }
  const appearance = specs.find((s) => /appearance|form/i.test(s.name))?.value;
  const ph = specs.find((s) => /^ph/i.test(s.name))?.value;
  const sg = specs.find((s) => /gravity|density/i.test(s.name))?.value;
  const physical = [
    appearance ? `supplied as ${lowerFirst(appearance)}` : "",
    ph ? `pH ${ph}` : "",
    sg ? `specific gravity ${sg}` : "",
  ].filter(Boolean);
  if (physical.length) parts.push(`It is ${physical.join(", ")}.`);
  // The lead sentence already carries the application phrase; repeating it here
  // reads like padding. Application bullets often start with "For …", which
  // would otherwise produce "Used for for effective control of …".
  const extra = applications
    .filter((a) => a !== applicationPhrase)
    .slice(0, 3)
    .map((a) => a.replace(/^for\s+/i, ""));
  if (extra.length) parts.push(`Used for ${lowerFirst(extra.join("; "))}.`);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/** Lowercases a leading word only when it is ordinary prose — "RO feed water"
 * and "MSDS" keep their capitals, "Clear Colorless solution" does not. */
function lowerFirst(text: string): string {
  const first = text.split(/\s+/)[0] ?? "";
  const isAcronym = first.length > 1 && first === first.toUpperCase() && /[A-Z]{2}/.test(first);
  return isAcronym ? text : text.charAt(0).toLowerCase() + text.slice(1);
}

// Letters whose spoken name starts with a vowel sound, so "an RO antiscalant"
// and "an MSDS" read correctly.
const VOWEL_SOUND_LETTERS = /^[AEFHILMNORSX]/;

const indefinite = (phrase: string) => {
  const p = lowerFirst(phrase.trim());
  if (/^(a|an|the)\s/i.test(p)) return p;
  const first = p.split(/\s+/)[0] ?? "";
  const acronym = first.length > 1 && first === first.toUpperCase() && /[A-Z]{2}/.test(first);
  const vowelish = acronym ? VOWEL_SOUND_LETTERS.test(p) : /^[aeiou]/i.test(p);
  return `${vowelish ? "an" : "a"} ${p}`;
};

/** Synonyms line: "Synonyms Antiscalant, Dispersant". */
function readSynonyms(sections: Section[]): string[] {
  const section = findSection(sections, INGREDIENTS);
  const line = section?.lines.find((l) => /^synonyms?\b/i.test(l));
  if (!line) return [];
  return splitInline(line.replace(/^synonyms?\b[\s:.-]*/i, "")).slice(0, 8);
}

/* ------------------------------------------------------------------ public */

export type ExtractInput = {
  pages: string[];
  sections: Section[];
  fileName: string;
  classification: Classification;
  /** Live CMS taxonomy, so category resolution never invents a slug. */
  categories: CategoryLike[];
};

export function extractFields({
  pages,
  sections,
  fileName,
  classification,
  categories,
}: ExtractInput): ExtractedFields {
  const kind: DocKind = classification.kind ?? "product";
  const text = pages.join("\n");
  const { name, applicationPhrase, hint } = readTitle(sections, fileName);
  const code = findCode(name) ?? findCode(fileName);
  const synonyms = readSynonyms(sections);

  /* features / highlights — a bulleted characteristics block is a feature
     list; the same heading holding prose is a description. */
  const charSection = findSection(sections, [
    "basic characteristics",
    "characteristics",
    "function & features",
    "function and features",
    "features",
    "benefits",
    "advantages",
  ]);
  const charIsList = (charSection?.lines ?? []).some((l) => l.startsWith("• "));
  const features = charIsList ? toList(charSection) : [];

  const descriptionSection = findSection(sections, ["product description", "description"]);
  // An MSDS names its first section "INGREDIENTS/APPLICATION" — a fuzzy match
  // on "application" would drag OSHA PEL, CAS numbers and the synonym line in
  // as if they were customer-facing applications.
  const applications = dedupeStrings([
    ...toList(findSection(sections, ["applications", "application", "uses"], ["ingredients"])),
    ...(applicationPhrase ? [applicationPhrase] : []),
  ]).slice(0, 12);

  const specifications = readSpecs(sections);
  const packing = readPacking(sections);
  const safety = readSafety(sections);
  const dosage = toProse(findSection(sections, ["dosage", "dose", "dosing", "feeding"]), 600);

  let description = toProse(descriptionSection, 900);
  if (!description && charSection && !charIsList) description = toProse(charSection, 900);
  if (!description) {
    description = assembleDescription(
      name,
      applicationPhrase,
      synonyms,
      specifications,
      applications,
    );
  }
  const industries = readIndustries([applications.join(" "), features.join(" "), description]);

  // Preference order for the one-liner: the application phrase printed next to
  // the name, then the lead feature (which is how these sheets open), then the
  // first sentence of the description. A bare repeat of the name is useless, so
  // it is the last resort.
  const shortDescription = clampSentences(
    applicationPhrase ||
      features[0] ||
      applications[0] ||
      description.split(/(?<=\.)\s/)[0] ||
      description,
    150,
  );

  /* category */
  const series = codeSeries(code?.digits);
  const catKind = kind === "service" || kind === "serviceCategory" ? "service" : "product";
  const match =
    kind === "productCategory" || kind === "serviceCategory"
      ? null
      : resolveCategory(
          catKind,
          { title: `${name} ${applicationPhrase}`, hint, body: text, series },
          categories,
        );

  const fields: ExtractedFields = {
    name,
    code: code?.code,
    codeKey: code?.codeKey,
    category: match?.slug,
    categoryName: match?.name,
    categoryHint: match ? undefined : hint,
    description,
    shortDescription,
    applications: applications.length ? applications : undefined,
    industries: industries.length ? industries : undefined,
    specifications: specifications.length ? specifications : undefined,
    dosage: dosage || undefined,
    packing: packing.length ? packing : undefined,
    safety: safety.length ? safety : undefined,
  };

  // Services carry "what's included" rather than product features.
  if (kind === "service") {
    const highlights = dedupeStrings([
      ...features,
      ...toList(
        findSection(sections, ["scope of work", "inclusions", "deliverables", "what's included"]),
      ),
    ]);
    if (highlights.length) fields.highlights = highlights;
    const processSection = findSection(sections, [
      "process",
      "our process",
      "procedure",
      "methodology",
    ]);
    const steps = toList(processSection, 10);
    if (steps.length > 1) {
      fields.process = steps.map((s) => {
        const [title, ...rest] = s.split(/\s*[:–—-]\s+/);
        return { title: clampSentences(title, 70), body: rest.join(" ").trim() || s };
      });
    }
  } else if (features.length) {
    fields.features = features;
  }

  // Category records read as a family, not an item: the strap line becomes the
  // tagline and the body becomes the description.
  if (kind === "productCategory" || kind === "serviceCategory") {
    fields.tagline = hint ? clampSentences(hint, 120) : shortDescription;
  }

  // A safety data sheet carries no features, applications or industries — it is
  // a regulatory document. Products imported from one would otherwise reach the
  // site with a full spec table and nothing a buyer reads first, so those three
  // fields are derived from what the document does say plus what the product
  // demonstrably is. See derive.ts for the rule that keeps it honest.
  if (kind === "product") Object.assign(fields, withDerivedFields(fields));

  Object.assign(fields, buildSeo(fields, classification));
  return fields;
}

/* --------------------------------------------------------------------- SEO */

/** A keyword has to be a phrase a buyer would type. Regulatory labels
 * ("OSHA PEL: Not Available"), synonym prefixes and long clauses are not. */
function isUsableKeyword(value: string): boolean {
  if (value.length < 3 || value.length > 45) return false;
  if (value.includes(":")) return false;
  if (/^synonyms?\b/i.test(value)) return false;
  if (/\b(not\s+(available|applicable)|none|n\/a)\b/i.test(value)) return false;
  return true;
}

function buildSeo(fields: ExtractedFields, classification: Classification) {
  const bits = [
    fields.code,
    fields.name,
    fields.categoryName,
    ...(fields.applications ?? []).slice(0, 4),
    ...(fields.industries ?? []),
    classification.family === "msds" ? "MSDS" : "technical data sheet",
    "LK Chemicals",
    "Hyderabad",
  ];
  const keywords = dedupeStrings(
    bits
      .filter((b): b is string => Boolean(b))
      .map((b) => b.replace(/\s+/g, " ").trim())
      .filter(isUsableKeyword)
      .map((b) => b.toLowerCase()),
  )
    .slice(0, 14)
    .join(", ");

  // Drop parts rather than truncate: a title ending in "|…" looks broken in a
  // SERP, and a clipped product name is worse than a missing brand suffix.
  const metaTitle =
    [
      fields.categoryName
        ? `${fields.name} — ${fields.categoryName} | LK Chemicals`
        : `${fields.name} | LK Chemicals`,
      `${fields.name} | LK Chemicals`,
      fields.name,
    ].find((candidate) => candidate.length <= 70) ?? fields.name;
  const metaDescription = clampSentences(
    fields.shortDescription && fields.shortDescription.length > 60
      ? fields.shortDescription
      : (fields.description ?? fields.name),
    158,
  );
  return { keywords, metaTitle, metaDescription };
}
