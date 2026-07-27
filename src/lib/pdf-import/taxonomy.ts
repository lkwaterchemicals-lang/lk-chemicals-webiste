// Deciding which category a document belongs to — without inventing slugs.
//
// The CMS taxonomy is admin-owned (13 product categories, 5 service
// categories at the time of writing), so this module never hardcodes a slug.
// It recognises a *concept* from the document, then matches that concept to
// whatever categories actually exist in Firestore by name. If the catalog is
// renamed or re-slugged tomorrow, the matching still lands.

export type CategoryLike = { slug: string; name: string };

export type CategoryMatch = {
  slug: string;
  name: string;
  /** How the match was made — shown in the Import Center. */
  via: string;
} | null;

type Concept = {
  id: string;
  /** Words in the target category's *name*, most specific first. Position is
   * the score: "cooling tower chemicals" must beat a bare "cooling tower",
   * otherwise a chemical lands in "Cooling Tower FRP Fills". */
  nameWords: string[];
  /** Document vocabulary that points at this concept, strongest first. */
  keywords: RegExp[];
  /** Leading digits of the LK code series that map here (weakest signal). */
  series?: string[];
  /** Set on concepts that describe equipment rather than chemistry. */
  equipment?: boolean;
};

// The taxonomy mixes chemistry with hardware — "RO Chemicals" and "RO Plants",
// "Cooling Tower Chemicals" and "Cooling Tower FRP Fills". A data sheet for a
// chemical must never be filed under the equipment category that shares its
// first two words.
const EQUIPMENT_WORDS = ["plant", "fills", "fill", "spares", "media", "membrane element", "pump"];

// Order matters only as a tie-break; scoring does the real work.
const PRODUCT_CONCEPTS: Concept[] = [
  {
    id: "descaling",
    nameWords: ["descaling compound", "descaling", "de-scaling"],
    keywords: [/\bde-?scal(ing|er|ant)\b/i, /descaling compound/i],
  },
  {
    id: "resin",
    nameWords: ["resin cleaning", "resin"],
    keywords: [/\bresin\b/i, /ion[- ]exchange/i, /\bmixed bed\b/i],
  },
  {
    id: "ahu",
    nameWords: ["ahu cleaning", "ahu", "air handling"],
    keywords: [/\bahu\b/i, /air handling unit/i, /\bcoil cleaner\b/i],
  },
  {
    id: "etp-stp",
    nameWords: ["etp & stp", "etp", "stp", "effluent", "sewage"],
    keywords: [/\betp\b/i, /\bstp\b/i, /effluent treatment/i, /sewage/i, /\bbio[- ]culture\b/i],
  },
  {
    id: "cooling-tower",
    nameWords: ["cooling tower chemical", "cooling tower", "cooling water", "cooling"],
    keywords: [/cooling tower/i, /\bcooling water\b/i, /\bchiller\b/i, /\bcondenser\b/i],
    series: ["3"],
  },
  {
    id: "boiler",
    nameWords: ["boiler chemical", "boiler"],
    keywords: [/\bboiler\b/i, /\bfeed ?water\b.*\bsteam\b/i, /\boxygen scavenger\b/i],
    series: ["2"],
  },
  {
    id: "ro",
    nameWords: ["ro chemical", "membrane chemical", "reverse osmosis", "ro ", "membrane"],
    keywords: [
      /reverse osmosis/i,
      /\bro\b/i,
      /\bmembrane\b/i,
      /\bnf\b/i,
      /\bpermeate\b/i,
      /\bantiscalant\b/i,
      /\bantifoulant\b/i,
    ],
    series: ["1", "5"],
  },
  {
    id: "water-treatment",
    nameWords: ["water treatment chemical", "water treatment"],
    keywords: [/\bcoagulant\b/i, /\bflocculant\b/i, /polyelectrolyte/i, /\bsoftener\b/i, /\bdm\b/i],
    series: ["4"],
  },
];

const SERVICE_CONCEPTS: Concept[] = [
  {
    id: "descaling-services",
    nameWords: ["descaling"],
    keywords: [/\bde-?scaling\b/i, /scale removal/i],
  },
  {
    id: "cleaning-services",
    nameWords: ["cleaning"],
    keywords: [/\bcleaning\b/i, /\bcip\b/i, /\bflushing\b/i, /\bsanitis|sanitiz/i],
  },
  {
    id: "installation",
    nameWords: ["installation", "upgradation", "commissioning"],
    keywords: [/\binstallation\b/i, /\bupgradation\b/i, /\bcommissioning\b/i, /\berection\b/i],
  },
  {
    id: "amc",
    nameWords: ["amc", "technical support", "support"],
    keywords: [/\bamc\b/i, /annual maintenance/i, /technical support/i, /\bconsultanc/i],
  },
  {
    id: "plant-services",
    nameWords: ["plant"],
    keywords: [/\bplant\b/i, /\bro plant\b/i, /\bboiler\b/i, /\bcooling tower\b/i, /\boverhaul/i],
  },
];

/** Weighted keyword scan. `title` counts far more than body text: a sheet that
 * mentions "boiler" once in a compatibility list is not a boiler chemical. */
function scoreConcepts(concepts: Concept[], title: string, body: string, series: string) {
  return concepts
    .map((c) => {
      let score = 0;
      const hits: string[] = [];
      for (const re of c.keywords) {
        if (re.test(title)) {
          score += 3;
          hits.push(`title matches ${re.source}`);
        } else if (re.test(body)) {
          score += 1;
          hits.push(`body matches ${re.source}`);
        }
      }
      if (series && c.series?.includes(series)) {
        score += 1.5;
        hits.push(`code series ${series}xxx`);
      }
      return { concept: c, score, hits };
    })
    .sort((a, b) => b.score - a.score);
}

/** Best live category for a concept. Specificity decides: an earlier name word
 * scores higher than a later one, and an equipment category is penalised for a
 * chemistry concept (and vice versa) so sibling categories never tie. */
function liveCategoryFor(concept: Concept, categories: CategoryLike[]): CategoryLike | null {
  const weight = concept.nameWords.length;
  const scored = categories
    .map((cat) => {
      const name = cat.name.toLowerCase();
      const slug = cat.slug.toLowerCase();
      let s = 0;
      concept.nameWords.forEach((w, i) => {
        const rank = weight - i; // first word is the most specific
        if (name.includes(w)) s += rank * 2;
        else if (slug.includes(w.trim().replace(/\s+/g, "-"))) s += rank;
      });
      if (s > 0) {
        const isEquipment = EQUIPMENT_WORDS.some((w) => name.includes(w));
        if (isEquipment !== Boolean(concept.equipment)) s -= weight * 2;
      }
      return { cat, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.cat.name.length - b.cat.name.length);
  return scored[0]?.cat ?? null;
}

/** Resolves a document to an existing category. `hint` is the strap line some
 * sheets print above the title ("Boiler performance chemicals"), which is the
 * best signal available when present. */
export function resolveCategory(
  kind: "product" | "service",
  { title, hint, body, series }: { title: string; hint?: string; body: string; series?: string },
  categories: CategoryLike[],
): CategoryMatch {
  if (!categories.length) return null;
  const concepts = kind === "product" ? PRODUCT_CONCEPTS : SERVICE_CONCEPTS;

  // 1. The document's own strap line, treated as a title-strength signal.
  if (hint) {
    const ranked = scoreConcepts(concepts, hint, "", "");
    if (ranked[0]?.score >= 3) {
      const cat = liveCategoryFor(ranked[0].concept, categories);
      if (cat) return { ...cat, via: `document strap line “${hint}”` };
    }
    // A strap line can also name a category almost verbatim.
    const direct = matchByName(hint, categories);
    if (direct) return { ...direct, via: `strap line matches “${direct.name}”` };
  }

  // 2. Title + body vocabulary, plus the LK code series as a tie-break.
  const ranked = scoreConcepts(concepts, title, body, series ?? "");
  for (const r of ranked) {
    if (r.score < 2) break;
    const cat = liveCategoryFor(r.concept, categories);
    if (cat) return { ...cat, via: r.hits.slice(0, 2).join(", ") };
  }

  return null;
}

/** Fuzzy "is this text naming an existing category?" check. */
export function matchByName(text: string, categories: CategoryLike[]): CategoryLike | null {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const t = norm(text);
  if (!t) return null;
  for (const c of categories) {
    const n = norm(c.name);
    if (n && (t === n || t.includes(n) || n.includes(t))) return c;
  }
  return null;
}

/** The digit series of an LK code, e.g. "LK CHEM 2011" → "2". Single- and
 * double-digit codes (LK CHEM 99) have no meaningful series. */
export function codeSeries(digits: string | undefined): string {
  return digits && digits.length >= 3 ? digits[0] : "";
}
