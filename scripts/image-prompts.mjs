// Prints the AI image prompt for every record on the site that is missing an
// image — the same prompts the dashboard shows behind "Need an image? Get an
// AI prompt", but as one list you can work through in a sitting.
//
//   node scripts/image-prompts.mjs            # only records with no image
//   node scripts/image-prompts.mjs --all      # every record
//   node scripts/image-prompts.mjs --md       # markdown, for pasting into a doc
import { createServer } from "vite";
import { collection, getDocs } from "firebase/firestore/lite";

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
const { db } = await vite.ssrLoadModule("/src/integrations/firebase/client.ts");
const { buildImagePrompt, promptAsText } = await vite.ssrLoadModule("/src/lib/image-prompts.ts");

const args = process.argv.slice(2);
const all = args.includes("--all");
const md = args.includes("--md");

const read = async (name) => {
  const snap = await getDocs(collection(db, name));
  return snap.docs.map((d) => ({ __id: d.id, ...d.data() }));
};

// Categories first: a category image is the fallback for every product under it,
// so filling those twelve slots covers the whole catalog at once.
const MODULES = [
  { id: "categories", label: "Product categories", fields: ["image", "banner"] },
  { id: "serviceCategories", label: "Service categories", fields: ["image", "banner"] },
  { id: "products", label: "Products", fields: ["image"] },
  { id: "services", label: "Services", fields: ["image"] },
];

let n = 0;
for (const m of MODULES) {
  const rows = await read(m.id);
  if (!rows.length) continue;
  const header = `${m.label} (${rows.length})`;
  console.log(md ? `\n## ${header}\n` : `\n${"=".repeat(90)}\n${header}\n${"=".repeat(90)}`);

  for (const row of rows.sort((a, b) => String(a.name).localeCompare(String(b.name)))) {
    for (const field of m.fields) {
      if (!all && row[field]) continue;
      const p = buildImagePrompt({ module: m.id, fieldKey: field, record: row });
      n++;
      if (md) {
        console.log(`### ${p.title}\n`);
        console.log(`\`${m.id}/${row.__id}\` · field \`${field}\` · **${p.aspect}**\n`);
        console.log("```text");
        console.log(promptAsText(p));
        console.log("```\n");
        p.tips.forEach((t) => console.log(`- ${t}`));
        console.log();
      } else {
        console.log(`\n--- ${p.title}  [${m.id}/${row.__id} · ${field} · ${p.aspect}]`);
        console.log(promptAsText(p));
      }
    }
  }
}

console.log(
  md ? `\n---\n\n${n} prompt(s).` : `\n${"=".repeat(90)}\n${n} prompt(s) — records without an image.`,
);
await vite.close();
process.exit(0);
