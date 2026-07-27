// Dry-run the PDF import parser over the import folder and print what the
// pipeline *would* create — no Firestore writes, no Cloudinary upload, no file
// deletion. The fastest way to sanity-check extraction after touching
// src/lib/pdf-import/*.
//
//   node scripts/pdf-import-dryrun.mjs                 # all files, summary
//   node scripts/pdf-import-dryrun.mjs --full          # every field
//   node scripts/pdf-import-dryrun.mjs "LK CHEM 1001"  # one file, every field
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { extractText, getDocumentProxy } from "unpdf";
import { createServer } from "vite";

// The parser is TypeScript with bundler-style (extensionless) imports, so it is
// loaded through Vite's SSR pipeline rather than Node's bare type stripping.
const vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
const { parseDocument } = await vite.ssrLoadModule("/src/lib/pdf-import/parse.ts");

const DIR = process.env.PDF_IMPORT_DIR ?? "PDF's";
const args = process.argv.slice(2);
const full = args.includes("--full");
const filter = args.filter((a) => !a.startsWith("--")).join(" ").toLowerCase();

// The live taxonomy, so category resolution is exercised for real.
const CATEGORIES = [
  { slug: "ro-chemicals", name: "RO Chemicals" },
  { slug: "2-boiler-chemicals", name: "Boiler Chemicals" },
  { slug: "3-cooling-tower-chemicals", name: "Cooling Tower Chemicals" },
  { slug: "4-water-treatment-chemicals", name: "Water Treatment Chemicals" },
  { slug: "5-etp-stp-chemicals", name: "ETP & STP Chemicals" },
  { slug: "6-descaling-compounds", name: "Descaling Compounds" },
  { slug: "7-resin-cleaning-chemicals", name: "Resin Cleaning Chemicals" },
  { slug: "8-ahu-cleaning-compounds", name: "AHU Cleaning Compounds" },
  { slug: "9-ro-plants", name: "RO Plants" },
  { slug: "10-dm-plants", name: "DM Plants" },
  { slug: "11-softener-plants", name: "Softener Plants" },
  { slug: "12-cooling-tower-frp-fills", name: "Cooling Tower FRP Fills" },
];

const files = readdirSync(DIR)
  .filter((f) => f.toLowerCase().endsWith(".pdf"))
  .filter((f) => !filter || f.toLowerCase().includes(filter));

console.log(`Parsing ${files.length} file(s) from ${DIR}\n`);
const seen = new Map();

for (const file of files) {
  const buf = new Uint8Array(readFileSync(path.join(DIR, file)));
  const pdf = await getDocumentProxy(buf);
  const { text } = await extractText(pdf, { mergePages: false });
  const { classification: c, fields: f } = parseDocument(text, file, CATEGORIES);

  const dupe = f.codeKey && seen.has(f.codeKey) ? ` ⟵ same product as "${seen.get(f.codeKey)}"` : "";
  if (f.codeKey) seen.set(f.codeKey, file);

  console.log("─".repeat(100));
  console.log(`FILE  ${file}`);
  console.log(
    `TYPE  ${c.kind ?? "UNCLASSIFIED"} · ${c.family} · ${Math.round(c.confidence * 100)}%` +
      (c.reason ? `\n      ⚠ ${c.reason}` : ""),
  );
  console.log(`NAME  ${f.name}`);
  console.log(`CODE  ${f.code ?? "—"}  (key ${f.codeKey ?? "—"})${dupe}`);
  console.log(`CAT   ${f.categoryName ?? "—"} (${f.category ?? "unresolved"})`);
  console.log(
    `HAVE  ${[
      f.description && "description",
      f.shortDescription && "short",
      f.features?.length && `features×${f.features.length}`,
      f.applications?.length && `applications×${f.applications.length}`,
      f.specifications?.length && `specs×${f.specifications.length}`,
      f.dosage && "dosage",
      f.packing?.length && `packing×${f.packing.length}`,
      f.safety?.length && `safety×${f.safety.length}`,
      f.industries?.length && `industries×${f.industries.length}`,
      f.keywords && "keywords",
      f.metaTitle && "seo",
    ]
      .filter(Boolean)
      .join(", ")}`,
  );
  if (full) {
    console.log(`\nDESC  ${f.description}`);
    console.log(`SHORT ${f.shortDescription}`);
    if (f.features?.length) console.log(`FEAT  ${f.features.map((x) => `\n      • ${x}`).join("")}`);
    if (f.applications?.length)
      console.log(`APPS  ${f.applications.map((x) => `\n      • ${x}`).join("")}`);
    if (f.specifications?.length)
      console.log(
        `SPEC  ${f.specifications.map((s) => `\n      ${s.name} = ${s.value}${s.unit ? ` ${s.unit}` : ""}`).join("")}`,
      );
    if (f.dosage) console.log(`DOSE  ${f.dosage}`);
    if (f.packing?.length) console.log(`PACK  ${f.packing.join(" | ")}`);
    if (f.industries?.length) console.log(`IND   ${f.industries.join(", ")}`);
    if (f.safety?.length)
      console.log(
        `SAFE  ${f.safety.map((s) => `\n      [${s.topic}] ${s.detail.slice(0, 150)}…`).join("")}`,
      );
    console.log(`KEYW  ${f.keywords}`);
    console.log(`META  ${f.metaTitle}\n      ${f.metaDescription}`);
    console.log(
      `SIG   ${c.signals.map((s) => `\n      +${s.weight} ${s.label}`).join("")}`,
    );
    console.log();
  }
}

await vite.close();
