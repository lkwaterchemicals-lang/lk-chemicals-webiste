// The seven steps of an import, in order, for one PDF.
//
//   scan → classify → extract → match/create → upload → verify → clean up
//
// Runs in the browser on purpose: content is written with the signed-in admin's
// credentials, so Firestore rules and the activity log behave exactly as they do
// for a hand-edited record. The server route only touches the filesystem.
//
// Two rules shape everything below:
//   • never create a duplicate — matching is by product code first, then slug,
//     then normalised name;
//   • never overwrite — scalars are written only into blanks, and lists are
//     extended with genuinely new entries, so a TDS and an MSDS for the same
//     product combine into one complete record instead of fighting each other.

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore/lite";
import { db } from "@/integrations/firebase/client";
import { auth } from "@/integrations/firebase/auth";
import { uploadToCloudinary } from "@/integrations/cloudinary";
import { logActivity } from "./api";
import { slugify, type Row } from "./registry";
import { COLLECTION_FOR, findCode, parseDocument } from "@/lib/pdf-import/parse";
import type {
  DocFamily,
  DocKind,
  ExtractedFields,
  ImportRecord,
  ScanResponse,
  ScannedFile,
} from "@/lib/pdf-import/types";

const API = "/api/pdf-import";

/* ------------------------------------------------------------------ server */

export async function scanImportFolder(): Promise<ScanResponse> {
  const res = await fetch(`${API}?action=scan`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Scan failed (${res.status})`);
  return (await res.json()) as ScanResponse;
}

async function fetchPages(rel: string): Promise<string[]> {
  const res = await fetch(`${API}?action=text&file=${encodeURIComponent(rel)}`);
  const body = (await res.json()) as { ok: boolean; pages?: string[]; error?: string };
  if (!body.ok || !body.pages) throw new Error(body.error ?? "Could not read the PDF text.");
  return body.pages;
}

async function fetchPdf(rel: string, name: string): Promise<File> {
  const res = await fetch(`${API}?action=file&file=${encodeURIComponent(rel)}`);
  if (!res.ok) throw new Error(`Could not read the PDF bytes (${res.status})`);
  return new File([await res.blob()], name, { type: "application/pdf" });
}

/** Removes a duplicate that the pipeline refused to re-import, so the folder can
 * be cleared without the admin hunting for it in a file manager. Explicit on
 * purpose: nothing deletes a file the pipeline did not fully process. */
export async function discardDuplicate(file: ScannedFile): Promise<void> {
  const prior = await readLedgerEntry(file.hash);
  if (prior?.status !== "imported" && prior?.status !== "skipped") {
    throw new Error("Only a file that was already imported can be discarded.");
  }
  await deleteLocalFile(file.rel, file.hash);
  await writeLedger({ ...prior, hash: file.hash, localFileDeleted: true });
}

async function deleteLocalFile(rel: string, hash: string): Promise<void> {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", rel, hash }),
  });
  const body = (await res.json()) as { ok: boolean; error?: string };
  if (!body.ok) throw new Error(body.error ?? "Could not delete the local file.");
}

/* ------------------------------------------------------------------ ledger */

export const LEDGER = "imports";

export async function readLedgerEntry(hash: string): Promise<ImportRecord | null> {
  const snap = await getDoc(doc(db, LEDGER, hash));
  return snap.exists() ? (snap.data() as ImportRecord) : null;
}

async function writeLedger(record: ImportRecord): Promise<void> {
  await setDoc(
    doc(db, LEDGER, record.hash),
    { ...prune(record), importedAt: serverTimestamp(), user: auth.currentUser?.email ?? "unknown" },
    { merge: true },
  );
}

/** Firestore rejects `undefined`; the extractor legitimately produces it. */
function prune<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}

/* ---------------------------------------------------------------- matching */

const norm = (v: unknown) =>
  String(v ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** The identity key for an existing record: its own `code` field when the admin
 * (or a previous import) set one, otherwise a code parsed out of its name or
 * slug — which is how products created before this pipeline are recognised. */
export function identityKeyOf(row: Row): string {
  const explicit = typeof row.code === "string" ? findCode(row.code) : null;
  if (explicit) return explicit.codeKey;
  const fromName = findCode(String(row.name ?? ""));
  if (fromName) return fromName.codeKey;
  const fromSlug = findCode(String(row.slug ?? row.__id ?? "").replace(/-/g, " "));
  return fromSlug?.codeKey ?? "";
}

export type MatchResult = { row: Row; via: string } | null;

/** When a catalog already holds duplicates of the same product — the admin's
 * "Duplicate" action leaves a "…-copy" behind — the import has to land on the
 * same one every time. Published beats draft, an original beats a copy, and the
 * shorter id breaks any remaining tie. */
function preferred(rows: Row[]): Row {
  return [...rows].sort((a, b) => {
    const copy = (r: Row) => (/-copy(-\d+)?$/.test(r.__id) ? 1 : 0);
    const draft = (r: Row) => (r.status === "published" || !r.status ? 0 : 1);
    return copy(a) - copy(b) || draft(a) - draft(b) || a.__id.length - b.__id.length;
  })[0];
}

/** Finds the record this document is about, without ever guessing loosely. */
export function findExisting(fields: ExtractedFields, rows: Row[]): MatchResult {
  if (fields.codeKey) {
    const byCode = rows.filter((r) => identityKeyOf(r) === fields.codeKey);
    if (byCode.length) {
      return {
        row: preferred(byCode),
        via:
          byCode.length > 1
            ? `product code ${fields.code} (${byCode.length} records share it)`
            : `product code ${fields.code}`,
      };
    }
  }
  const slug = slugify(fields.name);
  const bySlug = rows.find((r) => String(r.slug ?? r.__id) === slug);
  if (bySlug) return { row: bySlug, via: `slug ${slug}` };

  const target = norm(fields.name);
  const byName = rows.find((r) => norm(r.name) === target);
  if (byName) return { row: byName, via: "exact name" };
  return null;
}

/* ------------------------------------------------------------------- merge */

type MergePlan = {
  patch: Record<string, unknown>;
  written: string[];
  skipped: string[];
};

const isBlank = (v: unknown) =>
  v === undefined ||
  v === null ||
  (typeof v === "string" && !v.trim()) ||
  (Array.isArray(v) && v.length === 0);

/** Key a list entry is considered "already present" by. */
function entryKey(item: unknown): string {
  if (item && typeof item === "object") {
    const o = item as Record<string, unknown>;
    return norm(o.name ?? o.topic ?? o.label ?? JSON.stringify(o));
  }
  return norm(item);
}

/** Builds the Firestore patch. Scalars fill blanks only; lists are extended
 * with entries the record does not already have. Nothing is ever replaced. */
export function planMerge(
  fields: Record<string, unknown>,
  existing: Row | null,
  { publish }: { publish: boolean },
): MergePlan {
  const patch: Record<string, unknown> = {};
  const written: string[] = [];
  const skipped: string[] = [];

  for (const [key, incoming] of Object.entries(fields)) {
    if (isBlank(incoming)) continue;
    const current = existing?.[key];

    if (Array.isArray(incoming)) {
      const currentList = Array.isArray(current) ? current : [];
      const have = new Set(currentList.map(entryKey));
      const additions = incoming.filter((item) => !have.has(entryKey(item)));
      if (!additions.length) {
        skipped.push(key);
        continue;
      }
      patch[key] = [...currentList, ...additions];
      written.push(currentList.length ? `${key} (+${additions.length})` : key);
      continue;
    }

    if (isBlank(current)) {
      patch[key] = incoming;
      written.push(key);
    } else {
      skipped.push(key);
    }
  }

  // A brand-new record needs its publication state decided once; an existing
  // one keeps whatever the admin chose.
  if (!existing) patch.status = publish ? "published" : "draft";
  return { patch, written, skipped };
}

/* ---------------------------------------------------------------- category */

const CATEGORY_COLLECTION: Record<DocKind, string> = {
  product: "categories",
  productCategory: "categories",
  service: "serviceCategories",
  serviceCategory: "serviceCategories",
};

/** Next free display number, zero-padded like the rest of the taxonomy. */
function nextNumber(rows: Row[]): string {
  const max = rows.reduce((m, r) => Math.max(m, Number(r.number ?? 0) || 0), 0);
  return String(max + 1).padStart(2, "0");
}

/** Resolves the owning category, creating one from the document's strap line
 * only when nothing existing matches. Never creates a second category with a
 * name the taxonomy already has. */
async function ensureCategory(
  kind: DocKind,
  fields: ExtractedFields,
  categories: Row[],
): Promise<{ slug: string; name: string; created: boolean } | null> {
  // A resolved slug came from this very list, so it is known to exist.
  if (fields.category) {
    const hit = categories.find((c) => String(c.slug ?? c.__id) === fields.category);
    return {
      slug: fields.category,
      name: String(hit?.name ?? fields.categoryName ?? fields.category),
      created: false,
    };
  }
  const hint = fields.categoryHint?.trim();
  if (!hint) return null;

  const existing = categories.find((c) => norm(c.name) === norm(hint));
  if (existing) {
    return {
      slug: String(existing.slug ?? existing.__id),
      name: String(existing.name),
      created: false,
    };
  }

  const slug = slugify(hint);
  if (!slug) return null;
  const collection = CATEGORY_COLLECTION[kind];
  await setDoc(
    doc(db, collection, slug),
    prune({
      slug,
      name: titleCase(hint),
      number: nextNumber(categories),
      status: "draft",
      tagline: hint,
      description: "",
      parent: "",
      _updatedAt: serverTimestamp(),
    }),
    { merge: true },
  );
  void logActivity("created", collection, `${titleCase(hint)} (from PDF import)`);
  return { slug, name: titleCase(hint), created: true };
}

const titleCase = (s: string) =>
  s
    .split(/\s+/)
    .map((w) => (w.length > 3 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");

/* ---------------------------------------------------------------- document */

const DOC_LABEL: Record<DocFamily, string> = {
  tds: "Technical Data Sheet (TDS)",
  msds: "Material Safety Data Sheet (MSDS)",
  brochure: "Brochure",
  service: "Service Brochure",
  unknown: "Datasheet",
};

/** Attaches the Cloudinary URL, replacing the entry of the same kind rather
 * than piling up a new one on every re-import. */
function mergeDocuments(
  existing: unknown,
  entry: { label: string; url: string; type: string },
): { label: string; url: string; type?: string }[] {
  const list = Array.isArray(existing)
    ? (existing as { label?: string; url?: string; type?: string }[])
    : [];
  const kept = list.filter(
    (d) => norm(d.label) !== norm(entry.label) && String(d.url ?? "") !== entry.url,
  );
  // Firestore rejects `undefined` anywhere in a document, including inside an
  // array, so `type` is omitted rather than set to undefined.
  return [...kept, entry].map((d) => ({
    label: String(d.label ?? "Document"),
    url: String(d.url ?? ""),
    ...(d.type ? { type: String(d.type) } : {}),
  }));
}

/** Cloudinary refuses to serve PDFs until the account allows it, which turns a
 * successful upload into a dead download link. Checking is cheap and turns a
 * silent failure into an actionable message. */
async function isDeliverable(
  url: string,
): Promise<{ ok: boolean; detail?: string; blocked?: boolean }> {
  try {
    const res = await fetch(url, { method: "HEAD", mode: "cors" });
    if (res.ok) return { ok: true };
    const blocked = res.status === 401 || res.status === 403;
    return {
      ok: false,
      blocked,
      detail: blocked
        ? "The content was saved and the PDF is on Cloudinary, but Cloudinary is refusing to serve it, so the download link would be dead. Open the Cloudinary console → Settings → Security and allow delivery of PDF and ZIP files, then retry. The local file has been kept."
        : `Cloudinary returned ${res.status} for the uploaded document.`,
    };
  } catch {
    // A CORS-opaque failure is not proof of anything; don't block on it.
    return { ok: true };
  }
}

/* ------------------------------------------------------------------ import */

export type ImportContext = {
  categories: Row[];
  serviceCategories: Row[];
  products: Row[];
  services: Row[];
  /** New records go live immediately instead of landing as drafts. */
  publish: boolean;
  /** Require the uploaded PDF to actually be downloadable before cleanup. */
  verifyDelivery: boolean;
  onProgress?: (stage: string) => void;
};

/** Runs the whole pipeline for one file and returns the ledger row it wrote.
 * Never throws: a failure is a recorded outcome, and a failed import always
 * leaves the local PDF where it was. */
export async function importFile(file: ScannedFile, ctx: ImportContext): Promise<ImportRecord> {
  const base: ImportRecord = {
    hash: file.hash,
    fileName: file.name,
    bytes: file.bytes,
    status: "running",
    attempts: 1,
  };
  const step = (s: string) => ctx.onProgress?.(s);

  try {
    /* 1 · duplicate guard ------------------------------------------------- */
    const prior = await readLedgerEntry(file.hash);
    if (prior?.status === "imported") {
      const record: ImportRecord = {
        ...base,
        ...prior,
        status: "skipped",
        localFileDeleted: false,
        error: `Duplicate — this exact document was already imported${
          prior.targetName ? ` as “${prior.targetName}”` : ""
        }. Nothing was changed.`,
      };
      await writeLedger(record);
      return record;
    }
    base.attempts = (prior?.attempts ?? 0) + 1;

    /* 2 · text + classify + extract --------------------------------------- */
    step("Reading the PDF");
    const pages = await fetchPages(file.rel);
    step("Classifying");
    const parsed = parseDocument(pages, file.name, {
      productCategories: asCategoryList(ctx.categories),
      serviceCategories: asCategoryList(ctx.serviceCategories),
    });
    const { classification: cls, fields } = parsed;
    Object.assign(base, {
      kind: cls.kind,
      family: cls.family,
      confidence: cls.confidence,
      signals: cls.signals,
      targetName: fields.name,
    });

    if (!cls.kind) {
      const record: ImportRecord = { ...base, status: "review", error: cls.reason };
      await writeLedger(record);
      return record;
    }

    /* 3 · category -------------------------------------------------------- */
    const isCategoryDoc = cls.kind === "productCategory" || cls.kind === "serviceCategory";
    const catRows =
      CATEGORY_COLLECTION[cls.kind] === "categories" ? ctx.categories : ctx.serviceCategories;
    let category: { slug: string; name: string; created: boolean } | null = null;
    if (!isCategoryDoc) {
      category = await ensureCategory(cls.kind, fields, catRows);
      if (!category) {
        const record: ImportRecord = {
          ...base,
          status: "review",
          error: `Could not tell which category “${fields.name}” belongs to, and the document names no category to create. Assign it by hand, or add the category first.`,
        };
        await writeLedger(record);
        return record;
      }
      Object.assign(base, {
        categorySlug: category.slug,
        categoryName: category.name,
        categoryCreated: category.created,
      });
    }

    /* 4 · match or create ------------------------------------------------- */
    const collection = COLLECTION_FOR[cls.kind];
    const pool =
      cls.kind === "product"
        ? ctx.products
        : cls.kind === "service"
          ? ctx.services
          : cls.kind === "productCategory"
            ? ctx.categories
            : ctx.serviceCategories;
    const match = findExisting(fields, pool);
    const targetId = match ? match.row.__id : slugify(fields.name) || file.hash.slice(0, 12);
    Object.assign(base, {
      targetCollection: collection,
      targetId,
      targetCreated: !match,
    });

    /* 5 · upload the original to Cloudinary -------------------------------- */
    step("Uploading to Cloudinary");
    const pdf = await fetchPdf(file.rel, file.name);
    // A deterministic public id keeps retries from littering the media library,
    // while the content hash still gives a revised sheet its own asset.
    const publicId = `lk-import/${slugify(fields.code ?? fields.name)}-${cls.family}-${file.hash.slice(0, 8)}`;
    const upload = await uploadToCloudinary(pdf, undefined, { publicId });
    const documentEntry = {
      label: DOC_LABEL[cls.family],
      url: upload.secure_url,
      type: "PDF",
    };
    Object.assign(base, {
      documentUrl: upload.secure_url,
      documentLabel: documentEntry.label,
      cloudinaryId: upload.public_id,
      // Cloudinary renders page 1 of a PDF as an image, which makes a genuine
      // thumbnail for the Import Center without a second upload.
      previewUrl: upload.resource_type === "image" ? previewFrom(upload.secure_url) : undefined,
    });

    /* 6 · write the content ------------------------------------------------ */
    step("Writing to the CMS");
    const payload = toPayload(cls.kind, fields, category, targetId);
    // Categories order themselves by `number`, which is required — a category
    // created from a document has to be given the next free slot.
    if (isCategoryDoc && !match) payload.number = nextNumber(catRows);
    const plan = planMerge(payload, match?.row ?? null, { publish: ctx.publish });
    plan.patch.documents = mergeDocuments(match?.row?.documents, documentEntry);
    if (!plan.written.includes("documents")) plan.written.push("documents");

    await setDoc(
      doc(db, collection, targetId),
      { ...prune(plan.patch), _updatedAt: serverTimestamp() },
      { merge: true },
    );
    void logActivity(
      match ? "updated" : "created",
      collection,
      `${fields.name} (PDF import: ${file.name})`,
    );
    Object.assign(base, { fieldsWritten: plan.written, fieldsSkipped: plan.skipped });

    /* 7 · verify the download, then clean up ------------------------------- */
    if (ctx.verifyDelivery) {
      step("Verifying the download link");
      const delivery = await isDeliverable(upload.secure_url);
      if (!delivery.ok) {
        const record: ImportRecord = {
          ...base,
          status: "failed",
          localFileDeleted: false,
          deliveryBlocked: delivery.blocked,
          error: delivery.detail,
        };
        await writeLedger(record);
        return record;
      }
    }

    step("Removing the local file");
    await deleteLocalFile(file.rel, file.hash);

    const record: ImportRecord = {
      ...base,
      status: "imported",
      localFileDeleted: true,
      error: undefined,
    };
    await writeLedger(record);
    return record;
  } catch (err) {
    const record: ImportRecord = {
      ...base,
      status: "failed",
      localFileDeleted: false,
      error: describe(err),
    };
    try {
      await writeLedger(record);
    } catch {
      // Losing the ledger row must not lose the reason — the caller still gets it.
    }
    return record;
  }
}

/* ----------------------------------------------------------------- helpers */

const asCategoryList = (rows: Row[]) =>
  rows.map((r) => ({ slug: String(r.slug ?? r.__id), name: String(r.name ?? r.__id) }));

/** Cloudinary delivers page 1 of a PDF as an image when the extension is
 * swapped — a free preview thumbnail. */
function previewFrom(url: string): string | undefined {
  if (!/\/image\/upload\//.test(url)) return undefined;
  return url.replace(/\.pdf(\?.*)?$/i, ".jpg");
}

/** Maps extracted fields onto the collection's own field names. */
function toPayload(
  kind: DocKind,
  fields: ExtractedFields,
  category: { slug: string } | null,
  slug: string,
): Record<string, unknown> {
  const common = {
    name: fields.name,
    slug,
    shortDescription: fields.shortDescription,
    description: fields.description,
    metaTitle: fields.metaTitle,
    metaDescription: fields.metaDescription,
    keywords: fields.keywords,
  };

  if (kind === "product") {
    return {
      ...common,
      code: fields.code,
      category: category?.slug,
      features: fields.features,
      applications: fields.applications,
      industries: fields.industries,
      specifications: fields.specifications,
      dosage: fields.dosage,
      packing: fields.packing,
      safety: fields.safety,
    };
  }
  if (kind === "service") {
    return {
      ...common,
      code: fields.code,
      serviceCategory: category?.slug,
      highlights: fields.highlights,
      industries: fields.industries,
      process: fields.process,
    };
  }
  // Category records.
  return { ...common, tagline: fields.tagline, parent: "" };
}

function describe(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/permission|insufficient/i.test(msg)) {
    return `${msg} — the Firestore rules need to allow authenticated writes to the “imports” collection.`;
  }
  return msg;
}
