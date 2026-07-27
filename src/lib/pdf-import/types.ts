// Shared vocabulary for the PDF import pipeline. Kept free of Node and
// Firebase imports so the same types describe the server route's payloads, the
// pure parsing engine and the admin's Import Center.

/** The only four things a document is allowed to become in the CMS. */
export type DocKind = "product" | "productCategory" | "service" | "serviceCategory";

/** Which document family the parser recognised — drives extraction and the
 * label the PDF gets attached under. */
export type DocFamily =
  | "tds" // PRODUCT DATA SHEET / technical data sheet
  | "msds" // MATERIAL SAFETY DATA SHEET
  | "brochure" // multi-product range / category overview
  | "service" // scope-of-work, AMC, service offering
  | "unknown";

export type SpecRow = { name: string; value: string; unit?: string };
export type SafetyNote = { topic: string; detail: string };
export type DocLink = { label: string; url: string; type?: string };

/** One heading and the body lines that belong to it. */
export type Section = { heading: string; lines: string[]; body: string };

/** A single reason the classifier moved a decision one way or the other —
 * surfaced in the Import Center so a human can audit the machine. */
export type Signal = { label: string; weight: number };

export type Classification = {
  kind: DocKind | null;
  family: DocFamily;
  /** 0–1. Below CONFIDENCE_FLOOR the pipeline refuses to guess. */
  confidence: number;
  signals: Signal[];
  /** Set when kind is null — why the document could not be classified. */
  reason?: string;
};

/** Everything the parser managed to pull out of one PDF. Every field beyond
 * `name` is optional: documents in the wild are inconsistent, and the merge
 * step only ever fills blanks, so a missing field costs nothing. */
export type ExtractedFields = {
  name: string;
  /** Product/service code as printed, e.g. "LK CHEM 1001" or "LK 1044". */
  code?: string;
  /** Normalised identity key derived from the code — the duplicate guard. */
  codeKey?: string;
  /** Target category slug, resolved against the live CMS taxonomy. */
  category?: string;
  categoryName?: string;
  /** Free-text hint the document itself printed, e.g. "Boiler performance
   * chemicals" — kept when no CMS category could be resolved. */
  categoryHint?: string;
  description?: string;
  shortDescription?: string;
  features?: string[];
  applications?: string[];
  /** Services use `highlights` where products use `features`. */
  highlights?: string[];
  industries?: string[];
  specifications?: SpecRow[];
  dosage?: string;
  packing?: string[];
  safety?: SafetyNote[];
  keywords?: string;
  metaTitle?: string;
  metaDescription?: string;
  /** Category records only. */
  tagline?: string;
  /** Ordered process steps, when a service document describes them. */
  process?: { title: string; body: string }[];
};

export type ParsedDoc = {
  classification: Classification;
  fields: ExtractedFields;
  /** Pages of normalised text, kept for the "why did it decide that" panel. */
  pages: string[];
  sections: Section[];
};

/* ------------------------------------------------------------ server route */

/** A PDF sitting in the import folder, as reported by the scan endpoint. */
export type ScannedFile = {
  name: string;
  /** Path relative to the import folder — the only handle the client sends
   * back, so nothing outside the folder is ever addressable. */
  rel: string;
  bytes: number;
  modified: number;
  /** sha256 of the file contents: the import ledger's primary key, so the same
   * document dropped twice (under any filename) is recognised. */
  hash: string;
};

export type ScanResponse = {
  ok: boolean;
  /** Absolute folder the server watched, echoed for the admin UI. */
  dir: string;
  available: boolean;
  files: ScannedFile[];
  error?: string;
};

export type ExtractResponse = {
  ok: boolean;
  pages?: string[];
  error?: string;
};

/* ------------------------------------------------------------------ ledger */

export type ImportStatus =
  | "pending" // seen in the folder, not processed yet
  | "running"
  | "imported" // content written, PDF on Cloudinary, local file removed
  | "failed"
  | "review" // parsed, but the classifier refused to guess
  | "skipped"; // duplicate of an already-imported document

/** One row of the `imports` Firestore collection, keyed by content hash. */
export type ImportRecord = {
  hash: string;
  fileName: string;
  bytes: number;
  status: ImportStatus;
  kind?: DocKind | null;
  family?: DocFamily;
  confidence?: number;
  signals?: Signal[];
  /** Collection + id of the record this import created or updated. */
  targetCollection?: string;
  targetId?: string;
  targetName?: string;
  targetCreated?: boolean;
  categorySlug?: string;
  categoryName?: string;
  categoryCreated?: boolean;
  documentUrl?: string;
  documentLabel?: string;
  previewUrl?: string;
  cloudinaryId?: string;
  /** Field keys the merge actually wrote — the audit trail for "only fills
   * blanks". */
  fieldsWritten?: string[];
  fieldsSkipped?: string[];
  localFileDeleted?: boolean;
  /** Upload succeeded but Cloudinary refused to serve the PDF — an account
   * setting, not a per-file problem, so the UI can say so once. */
  deliveryBlocked?: boolean;
  error?: string;
  attempts?: number;
  importedAt?: unknown; // Firestore serverTimestamp
  user?: string;
};
