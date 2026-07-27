// Turning raw PDF text into something a parser can trust.
//
// The documents in the import folder are Word exports printed to PDF, so the
// text layer carries three kinds of noise that would otherwise poison every
// downstream field: the company letterhead repeated on every page, Symbol and
// Wingdings list bullets that survive as private-use codepoints, and
// superscript degree signs flattened into a literal "o" ("100o C"). Everything
// here is deliberately conservative — it normalises shape, never meaning.

import type { Section } from "./types";

/* --------------------------------------------------------------- normalise */

/** Letterhead / footer lines that repeat on every page. Matching these out
 * first is what lets the section splitter treat page breaks as invisible. */
const BOILERPLATE: RegExp[] = [
  /^L\.?\s*K\.?\s*CHEMICALS(\s+PVT\.?\s*LTD\.?)?$/i,
  /^certified by iso\b/i,
  /^(office|factory|works)\s*[:.]/i,
  /^plot\s+no/i,
  /^email[.:]/i,
  // Phone lines only. "Ph: 9866600699" is letterhead, but "pH : 2.0 - 3.0" is
  // the single most important specification on an antiscalant sheet — so the
  // shape of the value is checked, not just the label.
  /^(ph|tel|phone|mobile|contact)\s*[:.]\s*\+?\d[\d\s,/()+-]{6,}\.?$/i,
  /^www\./i,
  /^gst(in)?\s*[:.]/i,
  /^page\s+\d+(\s+of\s+\d+)?$/i,
  /^\d+\s*\|\s*page$/i,
  /^please contact for further details/i,
  // The MSDS disclaimer block — legal text, never product information.
  /^although the information herein is believed to be correct/i,
  /^as to the completeness or accuracy of this information/i,
  /^consult lk chemicals for further information/i,
];

const isBoilerplate = (line: string) => BOILERPLATE.some((re) => re.test(line));

// Bullets arrive in two disguises. Symbol/Wingdings list glyphs land in the
// Unicode private-use area (U+F0B7, U+F0FC, U+F0A7) where a whitespace trim
// cannot see them, and pdf.js additionally renders the Wingdings check as the
// vulgar fraction "3/4". Either can appear alone or together, so each gets its
// own pass.
const SP = "[\\s\\u00a0]*";
const PUA_BULLET = new RegExp(`^${SP}[\\uf000-\\uf0ff]${SP}`);
const TEXT_BULLET = new RegExp(
  `^${SP}(?:3\\u20444|\\u00be|[\\u2022\\u25aa\\u25e6\\u2023\\u00b7\\u00bb\\u25cf\\u25a0\\u25cb]|-{1,2}(?=\\s))${SP}`,
);

/** Marker the normaliser prefixes onto list items so bullet structure survives
 * the whitespace trim. */
export const BULLET_MARK = "• ";

/** Strips any leading bullet marker and reports whether one was there. */
export function stripBullet(line: string): { text: string; bulleted: boolean } {
  let text = line;
  let bulleted = false;
  for (const re of [PUA_BULLET, TEXT_BULLET]) {
    if (re.test(text)) {
      text = text.replace(re, "");
      bulleted = true;
    }
  }
  return { text: text.trim(), bulleted };
}

const isBulleted = (line: string) => line.startsWith(BULLET_MARK);
const unbullet = (line: string) => (isBulleted(line) ? line.slice(BULLET_MARK.length) : line);

const DEGREE_FIXES: [RegExp, string][] = [
  // "100o C" / "25 o C" / "20oC" -> "100 °C"
  [/(\d)\s*o\s*C\b/g, "$1 °C"],
  [/(\d)\s*°\s*C\b/g, "$1 °C"],
  [/@\s*(\d+)\s*C\b/g, "@ $1 °C"],
];

/** Collapses one raw page of pdf.js text into clean, boilerplate-free lines. */
export function normalizePage(raw: string): string[] {
  const out: string[] = [];
  for (const rawLine of raw.split(/\r?\n/)) {
    const collapsed = rawLine
      .replace(/[\u00a0\u2007\u202f]/g, " ")
      .replace(/[ \t]+/g, " ")
      .trim();
    if (!collapsed) continue;
    const { text, bulleted } = stripBullet(collapsed);
    let line = text;
    if (!line || line === ":" || line === "-") continue;
    if (isBoilerplate(line)) continue;
    for (const [re, to] of DEGREE_FIXES) line = line.replace(re, to);
    out.push(bulleted ? `${BULLET_MARK}${line}` : line);
  }
  return out;
}

export function normalizePages(pages: string[]): string[] {
  return pages.map((p) => normalizePage(p).join("\n"));
}

/** All pages as one line list — the section splitter's input. */
export function allLines(pages: string[]): string[] {
  return pages.flatMap((p) => p.split("\n")).filter(Boolean);
}

/* ---------------------------------------------------------------- headings */

// Headings the LK document families actually print. A curated list beats pure
// heuristics here: "Dosage" and "Shipping" are title-case single words that no
// generic ALL-CAPS rule would catch, and mis-reading a body line as a heading
// silently truncates the field above it.
const KNOWN_HEADINGS = [
  // technical / product data sheets
  "product data sheet",
  "product description",
  "description",
  "basic characteristics",
  "characteristics",
  "function & features",
  "function and features",
  "features",
  "benefits",
  "advantages",
  "applications",
  "application",
  "uses",
  "specifications",
  "specification",
  "properties",
  "properties form",
  "typical properties",
  "physical properties",
  "technical data",
  "dosage",
  "dose",
  "dosing",
  "feeding",
  "feed point",
  "method of use",
  "directions for use",
  "materials compatibility",
  "materials to avoid",
  "compatibility",
  "handling",
  "handling & safety",
  "handling and safety",
  "safety",
  "precautions",
  "storage",
  "shelf life",
  "shipping",
  "packing",
  "packaging",
  "supply",
  "availability",
  "note",
  "notes",
  "industries",
  "industries served",
  // safety data sheets
  "material safety data sheet",
  "safety data sheet",
  "ingredients/application",
  "ingredients",
  "physical data",
  "fire and explosion data",
  "reactivity data",
  "health hazards",
  "routes of entry and first aid",
  "first aid",
  "special precautions and spill/leak procedures",
  "personal protection",
  "transportation",
  "disposal",
  // service documents
  "scope of work",
  "scope",
  "process",
  "procedure",
  "methodology",
  "our process",
  "deliverables",
  "inclusions",
  "what's included",
  "service offering",
  "why choose us",
  "faqs",
  "frequently asked questions",
];

const headingKey = (line: string) =>
  unbullet(line)
    .replace(/^\s*\d+\s*[.)]\s*/, "") // "1. INGREDIENTS/APPLICATION"
    .replace(/[:：]\s*$/, "")
    .trim()
    .toLowerCase();

/** Is this line a section heading? Known headings win — including bulleted
 * ones, because Word applies list formatting to headings too. Otherwise a
 * short, all-uppercase line is treated as one. */
export function isHeading(line: string): boolean {
  const key = headingKey(line);
  if (!key || key.length > 60) return false;
  if (KNOWN_HEADINGS.includes(key)) return true;
  // Past this point a bullet means "list item", not "heading".
  if (isBulleted(line)) return false;
  // Numbered section, e.g. "10. OTHER INFORMATION".
  if (/^\s*\d+\s*[.)]\s*[A-Z][A-Za-z/&,'\- ]{3,}:?$/.test(line)) return true;
  // Standalone ALL-CAPS label, optionally with a trailing colon.
  const bare = line.replace(/[:：]\s*$/, "");
  const letters = bare.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 4 && bare === bare.toUpperCase() && bare.split(/\s+/).length <= 6) {
    return !/\d{3,}/.test(bare); // not an address or a phone number
  }
  return false;
}

/** Splits normalised lines into `{ heading, lines }` sections. Text before the
 * first heading lands under the "" heading, which is where cover-page titles
 * live. */
export function sectionize(lines: string[]): Section[] {
  const sections: Section[] = [{ heading: "", lines: [], body: "" }];
  for (const line of lines) {
    if (isHeading(line)) {
      sections.push({ heading: headingKey(line), lines: [], body: "" });
      // Some sheets print "Properties Form: Clear, Colorless liquid" — keep
      // whatever followed the colon as the section's first body line.
      const inline = unbullet(line).split(/[:：]/).slice(1).join(":").trim();
      if (inline) sections[sections.length - 1].lines.push(inline);
    } else {
      sections[sections.length - 1].lines.push(line);
    }
  }
  return sections
    .map((s) => ({ ...s, body: s.lines.join("\n").trim() }))
    .filter((s) => s.heading || s.lines.length);
}

/** First section whose heading matches any of `names` (exact, then fuzzy).
 * `exclude` keeps a fuzzy pass from stealing a neighbour: "applications" must
 * never resolve to the MSDS section "ingredients/application". */
export function findSection(
  sections: Section[],
  names: string[],
  exclude: string[] = [],
): Section | null {
  const allowed = (s: Section) => !exclude.some((x) => s.heading.includes(x));
  for (const n of names) {
    const exact = sections.find((s) => s.heading === n && allowed(s));
    if (exact) return exact;
  }
  for (const n of names) {
    const partial = sections.find(
      (s) => allowed(s) && (s.heading.startsWith(n) || s.heading.includes(n)),
    );
    if (partial) return partial;
  }
  return null;
}

/* ------------------------------------------------------------------ pieces */

/** Body lines as a list: bulleted lines when the section has them, otherwise
 * one item per line. A bullet continued on the next line is folded back into
 * the bullet above it. */
export function toList(section: Section | null, max = 14): string[] {
  if (!section) return [];
  const items: string[] = [];
  let sawBullet = false;
  for (const line of section.lines) {
    if (isBulleted(line)) {
      sawBullet = true;
      items.push(unbullet(line).trim());
    } else if (sawBullet && items.length) {
      items[items.length - 1] = `${items[items.length - 1]} ${line}`.replace(/\s+/g, " ");
    } else {
      items.push(line);
    }
  }
  const cleaned = items
    .map((s) =>
      s
        .replace(/\s+/g, " ")
        .replace(/[.;,]\s*$/, "")
        .trim(),
    )
    .filter((s) => s.length > 2 && s.length <= 220);
  return dedupeStrings(cleaned).slice(0, max);
}

/** Section body as flowing prose (wrapped lines rejoined, bullets dropped). */
export function toProse(section: Section | null, maxChars = 900): string {
  if (!section) return "";
  const text = section.lines.map(unbullet).join(" ").replace(/\s+/g, " ").trim();
  return clampSentences(text, maxChars);
}

/** Trims to whole sentences under `maxChars` so a description never ends
 * mid-word. */
export function clampSentences(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return (stop > maxChars * 0.5 ? cut.slice(0, stop + 1) : `${cut.trimEnd()}…`).trim();
}

/** Case-insensitive de-duplication that keeps the first spelling seen. */
export function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = v
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

/** Splits a comma / semicolon / slash separated run into trimmed parts. */
export function splitInline(value: string): string[] {
  return dedupeStrings(
    value
      .split(/[,;]|\s+and\s+|\//gi)
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter((s) => s.length > 1),
  );
}
