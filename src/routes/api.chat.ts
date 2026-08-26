// Gemini proxy for the site's sales assistant.
//
// The API key lives ONLY here. Anything named `VITE_*` is inlined into the
// browser bundle by Vite, so the key is deliberately read from an unprefixed
// variable that never leaves the server: the browser talks to /api/chat, this
// route talks to Google. That also means the model, the system prompt and the
// product grounding can change without shipping new frontend code.
//
// The assistant is grounded on the LIVE catalog (read over Firestore's REST
// API, the same way the sitemap and route loaders do) so it can only ever
// recommend products LK Chemicals actually sells — and a product added in the
// dashboard today is recommendable within the cache window, with no deploy.
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listDocsRest } from "@/lib/firestore-rest";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
// Overridable so the route can be pointed at a regional endpoint or an
// egress proxy without a code change (and so it can be exercised locally).
const BASE = process.env.GEMINI_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta";
const ENDPOINT = (model: string) => `${BASE}/models/${model}:generateContent`;

const apiKey = () => process.env.GEMINI_API_KEY ?? "";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

/* --------------------------------------------------------------- grounding */

type Catalog = { text: string; at: number; ttl: number };
let catalogCache: Catalog | null = null;
const CATALOG_TTL = 10 * 60 * 1000;
// listDocsRest swallows its own failures and returns [], so a timed-out read
// looks exactly like an empty collection. Caching that for the full ten
// minutes would leave the assistant blind to half the catalog long after the
// blip passed — so a build that came back suspiciously empty is kept only
// briefly and retried.
const CATALOG_RETRY_TTL = 45 * 1000;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown, max = 6) =>
  Array.isArray(v)
    ? v
        .filter((x) => typeof x === "string")
        .slice(0, max)
        .join("; ")
    : "";

/** A compact, token-cheap description of everything the company sells. */
async function catalogText(): Promise<string> {
  if (catalogCache && Date.now() - catalogCache.at < catalogCache.ttl) return catalogCache.text;

  const [products, categories, services, serviceCategories] = await Promise.all([
    listDocsRest("products"),
    listDocsRest("categories"),
    listDocsRest("services"),
    listDocsRest("serviceCategories"),
  ]);

  const catName = new Map(categories.map((c) => [str(c.slug) || str(c.__id), str(c.name)]));
  const svcCatName = new Map(
    serviceCategories.map((c) => [str(c.slug) || str(c.__id), str(c.name)]),
  );

  const productLines = products.map((p) => {
    const slug = str(p.slug) || str(p.__id);
    const bits = [
      `- ${str(p.name)}${str(p.code) ? ` (code ${str(p.code)})` : ""}`,
      `category: ${catName.get(str(p.category)) || str(p.category) || "—"}`,
      str(p.shortDescription) || str(p.description).slice(0, 220),
      list(p.applications) && `applications: ${list(p.applications)}`,
      list(p.industries) && `industries: ${list(p.industries)}`,
      str(p.dosage) && `dosage: ${str(p.dosage)}`,
      list(p.packing, 4) && `packing: ${list(p.packing, 4)}`,
      `url: /products/${slug}`,
    ].filter(Boolean);
    return bits.join(" | ");
  });

  const serviceLines = services.map((s) => {
    const slug = str(s.slug) || str(s.__id);
    const cat = str(s.serviceCategory);
    return [
      `- ${str(s.name)}`,
      `category: ${svcCatName.get(cat) || cat || "—"}`,
      str(s.shortDescription) || str(s.description).slice(0, 200),
      `url: /services/${cat}/${slug}`,
    ]
      .filter(Boolean)
      .join(" | ");
  });

  const text = [
    "PRODUCTS (the ONLY products you may recommend):",
    productLines.join("\n") || "(none published)",
    "",
    "SERVICES:",
    serviceLines.join("\n") || "(none published)",
  ].join("\n");

  // A read that produced no products at all is far more likely to be a failed
  // request than a genuinely empty catalog — retry it soon.
  const complete = productLines.length > 0 && serviceLines.length > 0;
  catalogCache = { text, at: Date.now(), ttl: complete ? CATALOG_TTL : CATALOG_RETRY_TTL };
  return text;
}

/* ------------------------------------------------------------ instructions */

function systemPrompt(catalog: string): string {
  return `You are "LK Assist", the sales engineer on the website of LK Chemicals Pvt. Ltd. —
an ISO 9001:2015 manufacturer of industrial water-treatment chemicals in Cherlapally,
Hyderabad, serving Telangana, Andhra Pradesh, Karnataka, Tamil Nadu and Maharashtra since 2013.

LANGUAGE
Reply in the language the visitor writes in. You must handle English, Hindi, and Telugu
written in Roman letters ("Telugu ela unnaru", "meeru ee product ivvagalara"). Mirror their
script: if they write Telugu or Hindi in Roman letters, answer the same way — never switch
them to Devanagari or Telugu script unless they used it first.

WHAT YOU ARE FOR
Qualify the enquiry, then recommend the right LK Chemicals products. To recommend well you
need four things. Ask for whichever are still missing, ONE OR TWO AT A TIME, never as a form:
  1. Industry (pharma, power, steel, paper, sugar, hotel, textile, food, apartments…)
  2. Plant capacity (m3/hr, KLD, or TPH for boilers)
  3. Feed water TDS / hardness / silica if they know it
  4. Application (RO antiscalant, boiler treatment, cooling tower, descaling, ETP/STP, DM…)
If the visitor clearly already knows what they want, skip straight to the recommendation.

HARD RULES
- Recommend ONLY products from the catalog below. Never invent a product, code, or spec.
- If nothing in the catalog fits, say so plainly and offer to put them in touch with the team.
- Quote dosage only when the catalog states it, and always frame it as a starting point that
  the technical team confirms against a water analysis.
- Never quote a price. Prices are commercial — hand those to the sales team.
- Never promise delivery dates, discounts, or contractual terms.
- You are not a laboratory. For anything safety-critical, defer to the datasheet and the team.

STYLE
Warm, brief, technical when it helps. Two or three short paragraphs at most, or a short list.
Plain text only — no markdown headings, no asterisks, no tables. Name products exactly as the
catalog spells them. When you recommend one, mention its page path so the visitor can open it.
End a recommendation by offering to connect them to the team on WhatsApp.

${catalog}`;
}

/* --------------------------------------------------------------- rate limit */

// Per-IP token bucket. This is one instance's view of the world, so it is a
// speed bump against a single abusive client rather than a global quota — the
// real ceiling is the Gemini key's own quota.
const buckets = new Map<string, { tokens: number; at: number }>();
const LIMIT = 20;
const WINDOW = 60 * 1000;

function allow(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now - b.at > WINDOW) {
    buckets.set(ip, { tokens: LIMIT - 1, at: now });
    if (buckets.size > 5000) buckets.clear(); // crude ceiling; never unbounded
    return true;
  }
  if (b.tokens <= 0) return false;
  b.tokens -= 1;
  return true;
}

const clientIp = (request: Request) =>
  request.headers.get("cf-connecting-ip") ??
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
  "local";

/* -------------------------------------------------------------------- route */

type InMessage = { role: "user" | "model"; text: string };

const MAX_TURNS = 24;
const MAX_CHARS = 2000;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      // Health/config check for deploys — reports whether the key is present
      // WITHOUT revealing any part of it.
      GET: async () => json({ ok: true, configured: Boolean(apiKey()), model: MODEL }),

      POST: async ({ request }) => {
        if (!apiKey()) {
          return json(
            {
              error:
                "The assistant isn't configured yet. Set GEMINI_API_KEY on the server and reload.",
            },
            503,
          );
        }
        if (!allow(clientIp(request))) {
          return json({ error: "You're sending messages very quickly — give it a moment." }, 429);
        }

        let body: { messages?: InMessage[] };
        try {
          body = (await request.json()) as { messages?: InMessage[] };
        } catch {
          return json({ error: "Bad request." }, 400);
        }

        const incoming = Array.isArray(body.messages) ? body.messages : [];
        const contents = incoming
          .filter((m) => m && (m.role === "user" || m.role === "model") && str(m.text))
          .slice(-MAX_TURNS)
          .map((m) => ({ role: m.role, parts: [{ text: str(m.text).slice(0, MAX_CHARS) }] }));

        if (contents.length === 0) return json({ error: "Nothing to answer." }, 400);

        let catalog = "";
        try {
          catalog = await catalogText();
        } catch {
          // A catalog read failure must not take the assistant down; it simply
          // answers without product grounding and steers to the sales team.
          catalog = "PRODUCTS: (catalog unavailable right now — do not name specific products)";
        }

        try {
          const res = await fetch(ENDPOINT(MODEL), {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey() },
            body: JSON.stringify({
              contents,
              systemInstruction: { parts: [{ text: systemPrompt(catalog) }] },
              generationConfig: {
                temperature: 0.6,
                topP: 0.9,
                maxOutputTokens: 800,
              },
              safetySettings: [
                "HARM_CATEGORY_HARASSMENT",
                "HARM_CATEGORY_HATE_SPEECH",
                "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "HARM_CATEGORY_DANGEROUS_CONTENT",
              ].map((category) => ({ category, threshold: "BLOCK_ONLY_HIGH" })),
            }),
            signal: AbortSignal.timeout(30_000),
          });

          if (!res.ok) {
            // Log the upstream detail server-side; return nothing that could
            // echo the key or Google's internals back to the browser.
            console.error("[chat] Gemini responded", res.status, (await res.text()).slice(0, 400));
            return json({ error: "The assistant is unavailable right now." }, 502);
          }

          const data = (await res.json()) as {
            candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
            promptFeedback?: { blockReason?: string };
          };

          const reply = (data.candidates?.[0]?.content?.parts ?? [])
            .map((p) => p.text ?? "")
            .join("")
            .trim();

          if (!reply) {
            const blocked =
              data.promptFeedback?.blockReason || data.candidates?.[0]?.finishReason === "SAFETY";
            return json({
              reply: blocked
                ? "I can't help with that one. Ask me about water treatment and I'm all yours — or tap Contact Sales and the team will pick it up."
                : "I didn't catch that. Could you put it another way?",
            });
          }

          return json({ reply });
        } catch (err) {
          console.error("[chat] request failed", err);
          return json({ error: "The assistant is unavailable right now." }, 502);
        }
      },
    },
  },
});
