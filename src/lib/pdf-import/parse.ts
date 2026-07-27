// One entry point for "raw pdf.js text → CMS-shaped record".
//
// Deliberately pure: the server route extracts the text layer, the admin
// resolves the taxonomy and writes Firestore, and this sits between them with
// no I/O of its own so both sides agree on the result.

import { classify } from "./classify";
import { extractFields } from "./extract";
import { allLines, normalizePages, sectionize } from "./text";
import type { CategoryLike } from "./taxonomy";
import type { ParsedDoc } from "./types";

/** The live CMS taxonomy. Both lists are passed because the document's kind is
 * only known after classification, and a service must never be filed under a
 * product category. */
export type Taxonomy = {
  productCategories?: CategoryLike[];
  serviceCategories?: CategoryLike[];
};

export function parseDocument(
  rawPages: string[],
  fileName: string,
  taxonomy: Taxonomy | CategoryLike[] = {},
): ParsedDoc {
  const pages = normalizePages(rawPages);
  const sections = sectionize(allLines(pages));
  const classification = classify(pages, sections, fileName);
  const lists = Array.isArray(taxonomy) ? { productCategories: taxonomy } : taxonomy;
  const categories =
    classification.kind === "service" || classification.kind === "serviceCategory"
      ? (lists.serviceCategories ?? [])
      : (lists.productCategories ?? []);
  const fields = extractFields({ pages, sections, fileName, classification, categories });
  return { classification, fields, pages, sections };
}

export * from "./types";
export { CONFIDENCE_FLOOR, COLLECTION_FOR, label, findCode } from "./classify";
export { resolveCategory, matchByName, codeSeries } from "./taxonomy";
export type { CategoryLike } from "./taxonomy";
