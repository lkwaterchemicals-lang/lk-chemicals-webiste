// The filesystem half of the PDF import pipeline.
//
// Everything that needs Node lives here — reading the import folder, pulling
// the text layer out of a PDF, streaming the original bytes to the browser so
// it can push them to Cloudinary, and deleting the file once the import has
// fully succeeded. Firestore and Cloudinary are deliberately *not* touched from
// the server: content is written by the signed-in admin in the browser, exactly
// like every other change made in the dashboard, so the same Firestore rules
// and audit trail apply.
//
// The route is development-only. A production build (Cloudflare Workers) has no
// import folder to watch, so it reports `available: false` and the Import
// Center explains why instead of failing.
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import type { ExtractResponse, ScanResponse, ScannedFile } from "@/lib/pdf-import/types";

/** Folder watched for new PDFs, relative to the project root unless absolute. */
const IMPORT_DIR = process.env.PDF_IMPORT_DIR ?? "PDF's";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

// Local authoring tool: never expose the filesystem from a deployed build. A
// self-hosted Node deployment that genuinely wants a watched folder can opt in
// with PDF_IMPORT_ENABLED=1.
const isEnabled = () =>
  process.env.NODE_ENV !== "production" || process.env.PDF_IMPORT_ENABLED === "1";

type Node = {
  fs: typeof import("node:fs/promises");
  path: typeof import("node:path");
  crypto: typeof import("node:crypto");
  dir: string;
};

/** Loads Node's filesystem modules lazily. On a worker runtime the import
 * throws, which is exactly how "no import folder here" is detected. */
async function node(): Promise<Node | null> {
  if (!isEnabled()) return null;
  try {
    const [fs, path, crypto] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
      import("node:crypto"),
    ]);
    const dir = path.isAbsolute(IMPORT_DIR) ? IMPORT_DIR : path.resolve(process.cwd(), IMPORT_DIR);
    return { fs, path, crypto, dir };
  } catch {
    return null;
  }
}

/** Resolves a client-supplied name to a real path *inside* the import folder.
 * Anything that escapes the folder, or isn't a PDF, is refused — the client
 * only ever sends back a name the scan handed it. */
function safeResolve(n: Node, rel: string): string | null {
  if (!rel || rel.includes("\0")) return null;
  if (!/\.pdf$/i.test(rel)) return null;
  const target = n.path.resolve(n.dir, rel);
  const root = n.dir.endsWith(n.path.sep) ? n.dir : n.dir + n.path.sep;
  if (!target.startsWith(root)) return null;
  return target;
}

async function sha256(n: Node, file: string): Promise<string> {
  const buf = await n.fs.readFile(file);
  return n.crypto.createHash("sha256").update(buf).digest("hex");
}

/* ------------------------------------------------------------------ actions */

async function scan(n: Node): Promise<ScanResponse> {
  let names: string[];
  try {
    names = await n.fs.readdir(n.dir);
  } catch {
    return {
      ok: true,
      dir: n.dir,
      available: false,
      files: [],
      error: `Import folder not found: ${n.dir}`,
    };
  }
  const files: ScannedFile[] = [];
  for (const name of names.filter((f) => /\.pdf$/i.test(f))) {
    const full = safeResolve(n, name);
    if (!full) continue;
    try {
      const stat = await n.fs.stat(full);
      if (!stat.isFile()) continue;
      files.push({
        name,
        rel: name,
        bytes: stat.size,
        modified: stat.mtimeMs,
        hash: await sha256(n, full),
      });
    } catch {
      // A file being written or removed mid-scan simply isn't ready yet.
    }
  }
  files.sort((a, b) => a.modified - b.modified);
  return { ok: true, dir: n.dir, available: true, files };
}

async function textOf(n: Node, rel: string): Promise<ExtractResponse> {
  const full = safeResolve(n, rel);
  if (!full) return { ok: false, error: "Refused: file is outside the import folder." };
  try {
    const buf = await n.fs.readFile(full);
    // unpdf ships a serverless build of pdf.js — no canvas, no worker file.
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    const { text } = await extractText(pdf, { mergePages: false });
    const pages = (Array.isArray(text) ? text : [text]).map((p) => String(p ?? ""));
    if (!pages.some((p) => p.trim().length > 40)) {
      return {
        ok: false,
        error:
          "No text layer found — this looks like a scanned PDF. It needs OCR before it can be imported.",
      };
    }
    return { ok: true, pages };
  } catch (err) {
    return { ok: false, error: `Could not read the PDF: ${(err as Error).message}` };
  }
}

async function bytesOf(n: Node, rel: string): Promise<Response> {
  const full = safeResolve(n, rel);
  if (!full) return json({ ok: false, error: "Refused: file is outside the import folder." }, 400);
  try {
    const buf = await n.fs.readFile(full);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(rel)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return json({ ok: false, error: (err as Error).message }, 404);
  }
}

/** Deletes an imported file — but only when its contents still hash to what the
 * pipeline actually imported. A file edited or replaced mid-import is left
 * alone, because it is no longer the document that was written to the CMS. */
async function remove(n: Node, rel: string, expectedHash?: string) {
  const full = safeResolve(n, rel);
  if (!full) return json({ ok: false, error: "Refused: file is outside the import folder." }, 400);
  try {
    if (expectedHash) {
      const actual = await sha256(n, full);
      if (actual !== expectedHash) {
        return json(
          { ok: false, error: "File changed on disk since it was parsed — left in place." },
          409,
        );
      }
    }
    await n.fs.unlink(full);
    return json({ ok: true, deleted: rel });
  } catch (err) {
    return json({ ok: false, error: (err as Error).message }, 500);
  }
}

/* ------------------------------------------------------------------- route */

const unavailable = () =>
  json({
    ok: true,
    dir: IMPORT_DIR,
    available: false,
    files: [],
    error:
      "The import folder is only readable when the site runs locally (npm run dev). A deployed build has no folder to watch.",
  } satisfies ScanResponse);

export const Route = createFileRoute("/api/pdf-import")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const n = await node();
        if (!n) return unavailable();
        const url = new URL(request.url);
        const action = url.searchParams.get("action") ?? "scan";
        const file = url.searchParams.get("file") ?? "";
        switch (action) {
          case "scan":
            return json(await scan(n));
          case "text":
            return json(await textOf(n, file));
          case "file":
            return bytesOf(n, file);
          default:
            return json({ ok: false, error: `Unknown action “${action}”.` }, 400);
        }
      },
      POST: async ({ request }) => {
        const n = await node();
        if (!n) return unavailable();
        let body: { action?: string; rel?: string; hash?: string } = {};
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return json({ ok: false, error: "Expected a JSON body." }, 400);
        }
        if (body.action === "delete") return remove(n, body.rel ?? "", body.hash);
        return json({ ok: false, error: `Unknown action “${body.action}”.` }, 400);
      },
    },
  },
});
