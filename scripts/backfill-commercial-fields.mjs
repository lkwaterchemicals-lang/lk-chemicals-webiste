// Backfills Features / Applications / Industries served on existing products.
//
// A safety data sheet carries none of the three, so products imported from an
// MSDS reach the site with a full spec table and nothing a buyer reads first.
// This applies the same derivation the import pipeline now runs
// (src/lib/pdf-import/derive.ts) to products already in Firestore.
//
// Only ever ADDS: a field that already has entries keeps them, and derived
// bullets are appended after them. Nothing is replaced.
//
//   node scripts/backfill-commercial-fields.mjs           # preview only
//   node scripts/backfill-commercial-fields.mjs --write    # apply
import { createServer } from "vite";
import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore/lite";

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
const { db } = await vite.ssrLoadModule("/src/integrations/firebase/client.ts");
const { deriveCommercialFields } = await vite.ssrLoadModule("/src/lib/pdf-import/derive.ts");

const write = process.argv.includes("--write");
const snap = await getDocs(collection(db, "products"));
const cats = await getDocs(collection(db, "categories"));
const catName = new Map(cats.docs.map((d) => [d.id, d.data().name]));

let changed = 0;
for (const d of snap.docs.sort((a, b) => a.id.localeCompare(b.id))) {
  const p = d.data();
  const derived = deriveCommercialFields({ ...p, categoryName: catName.get(p.category) });

  // Fill blanks only — mirrors the import pipeline's merge policy.
  const patch = {};
  if (!p.features?.length) patch.features = derived.features;
  if (!p.applications?.length) patch.applications = derived.applications;
  else {
    // A single application phrase off the MSDS title is worth keeping, but on
    // its own it is a thin list — top it up rather than leave it.
    const extra = derived.applications.filter((a) => !p.applications.includes(a));
    if (p.applications.length < 3 && extra.length)
      patch.applications = [...p.applications, ...extra];
  }
  if (!p.industries?.length) patch.industries = derived.industries;

  if (!Object.keys(patch).length) {
    console.log(`\n${d.id}\n  nothing to add`);
    continue;
  }
  changed++;
  console.log(`\n${d.id}   [${derived.productClass} · ${derived.system}]`);
  for (const [k, v] of Object.entries(patch)) {
    console.log(`  ${k}: ${p[k]?.length ?? 0} → ${v.length}`);
    v.forEach((x) => console.log(`      • ${x}`));
  }

  if (write) {
    await setDoc(
      doc(db, "products", d.id),
      { ...patch, _updatedAt: serverTimestamp() },
      { merge: true },
    );
  }
}

console.log(
  `\n${"=".repeat(80)}\n${changed} product(s) ${write ? "updated" : "would be updated — re-run with --write"}.`,
);
await vite.close();
process.exit(0);
