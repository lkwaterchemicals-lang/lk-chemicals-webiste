// Verifies the two rules that matter most in the import pipeline — never
// duplicate, never overwrite — against the *live* catalog, without writing
// anything. Reads Firestore, parses the real PDFs, and prints the decision the
// pipeline would take for each one.
//
//   node scripts/pdf-import-verify.mjs
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { extractText, getDocumentProxy } from "unpdf";
import { createServer } from "vite";
import { collection, getDocs } from "firebase/firestore/lite";

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
const { parseDocument } = await vite.ssrLoadModule("/src/lib/pdf-import/parse.ts");
// Loaded directly so the pure decision helpers are exercised, not re-implemented.
const { findExisting, identityKeyOf, planMerge } = await vite.ssrLoadModule(
  "/src/admin/import-pipeline.ts",
);

// The pipeline module already initialised the Firebase app, so reuse its handle
// rather than creating a second one.
const { db } = await vite.ssrLoadModule("/src/integrations/firebase/client.ts");
const read = async (name) => {
  const snap = await getDocs(collection(db, name));
  return snap.docs.map((d) => ({ __id: d.id, ...d.data() }));
};

const [categories, serviceCategories, products, services] = await Promise.all([
  read("categories"),
  read("serviceCategories"),
  read("products"),
  read("services"),
]);
const asList = (rows) => rows.map((r) => ({ slug: String(r.slug ?? r.__id), name: String(r.name) }));

console.log(`Live catalog: ${products.length} products, ${categories.length} categories\n`);
console.log("Identity keys the matcher derives from existing products:");
for (const p of products) {
  console.log(`  ${String(p.__id).padEnd(34)} → ${identityKeyOf(p) || "(no code)"}`);
}

const DIR = process.env.PDF_IMPORT_DIR ?? "PDF's";
// A working copy of the catalog, mutated as each file is "imported", so the
// second document for the same product sees what the first one wrote.
const workingProducts = products.map((p) => ({ ...p }));
const workingServices = services.map((s) => ({ ...s }));

console.log(`\n${"=".repeat(100)}`);
for (const file of readdirSync(DIR).filter((f) => f.toLowerCase().endsWith(".pdf"))) {
  const buf = new Uint8Array(readFileSync(path.join(DIR, file)));
  const { text } = await extractText(await getDocumentProxy(buf), { mergePages: false });
  const { classification: c, fields: f } = parseDocument(text, file, {
    productCategories: asList(categories),
    serviceCategories: asList(serviceCategories),
  });

  const pool = c.kind === "service" ? workingServices : workingProducts;
  const match = findExisting(f, pool);

  // Mirrors toPayload() for products — the fields an import would offer.
  const payload = {
    name: f.name,
    slug: (f.name ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    code: f.code,
    category: f.category,
    shortDescription: f.shortDescription,
    description: f.description,
    features: f.features,
    applications: f.applications,
    industries: f.industries,
    specifications: f.specifications,
    dosage: f.dosage,
    packing: f.packing,
    safety: f.safety,
    keywords: f.keywords,
    metaTitle: f.metaTitle,
    metaDescription: f.metaDescription,
  };
  const plan = planMerge(payload, match?.row ?? null, { publish: false });

  console.log(`\n${file}`);
  console.log(`  → ${c.kind} · ${f.code ?? "no code"} · category ${f.category ?? "UNRESOLVED"}`);
  console.log(
    match
      ? `  MATCH   updates "${match.row.name}" (${match.row.__id}) via ${match.via}`
      : `  NEW     creates ${payload.slug}`,
  );
  console.log(`  WRITES  ${plan.written.join(", ") || "(nothing)"}`);
  if (plan.skipped.length) console.log(`  KEEPS   ${plan.skipped.join(", ")}`);

  // Apply the plan to the working copy, exactly as Firestore merge would.
  const id = match ? match.row.__id : payload.slug;
  const target = pool.find((r) => r.__id === id);
  if (target) Object.assign(target, plan.patch);
  else pool.push({ __id: id, ...plan.patch });
}

console.log(`\n${"=".repeat(100)}`);
console.log(`Result: ${workingProducts.length} products (was ${products.length})`);
for (const p of workingProducts) {
  const filled = [
    "code",
    "shortDescription",
    "description",
    "features",
    "applications",
    "industries",
    "specifications",
    "dosage",
    "packing",
    "safety",
  ].filter((k) => (Array.isArray(p[k]) ? p[k].length : p[k]));
  console.log(`  ${String(p.__id).padEnd(38)} ${String(p.category ?? "?").padEnd(28)} ${filled.length}/10 fields`);
}
await vite.close();
process.exit(0);
