// Gemini proxy for the site's sales assistant.
//
// The API key lives ONLY here. Anything named `VITE_*` is inlined into the
// browser bundle by Vite, so the key is deliberately read from an unprefixed
// variable that never leaves the server: the browser talks to /api/chat, this
// route talks to Google.
//
// The model answers in STRUCTURED JSON, not prose. That is the single decision
// that makes this usable by a plant manager who is not a typist: every reply
// comes back as a short sentence plus two to four tappable answers, so the
// visitor picks instead of composing "10 m3/hr, 2200 ppm TDS". Product
// recommendations come back as catalog slugs, resolved here into real cards
// (name, photo, link) rather than a bare URL buried in a paragraph.
//
// It is grounded on the LIVE Firestore catalog, so it can only recommend
// products LK Chemicals actually sells, and a product published in the
// dashboard is recommendable without a deploy.
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { fetchDocRest, listDocsRest } from "@/lib/firestore-rest";
import { chatbotContent, type ChatbotContent, type ChatbotTerm } from "@/data/chatbot";

// A CHAIN, not one model. Measured against this key: gemini-flash-latest
// answered 0/6 (all 503 "high demand", ~15s just to fail) while the lite models
// answered 6/6 in under a second. Google's capacity moves around, so the route
// tries each in turn. Override with a comma-separated list in GEMINI_MODEL.
const MODELS = (
  process.env.GEMINI_MODEL ?? "gemini-flash-lite-latest,gemini-3.5-flash-lite,gemini-flash-latest"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const BASE = process.env.GEMINI_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta";
const ENDPOINT = (model: string) => `${BASE}/models/${model}:generateContent`;

const apiKey = () => process.env.GEMINI_API_KEY ?? "";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown, max = 6) =>
  Array.isArray(v)
    ? v
        .filter((x) => typeof x === "string")
        .slice(0, max)
        .join("; ")
    : "";

/* --------------------------------------------------------------- grounding */

/** Everything the client needs to draw a product card. */
type ProductCard = {
  slug: string;
  name: string;
  category: string;
  image: string | null;
  blurb: string;
  url: string;
};

type Catalog = { text: string; cards: Map<string, ProductCard>; at: number; ttl: number };
let catalogCache: Catalog | null = null;
const CATALOG_TTL = 10 * 60 * 1000;
// listDocsRest swallows its own failures and returns [], so a timed-out read
// looks exactly like an empty collection. Caching that for the full ten minutes
// would leave the assistant blind to half the catalog long after the blip
// passed, so a suspiciously empty build is kept briefly and retried.
const CATALOG_RETRY_TTL = 45 * 1000;

/** Cloudinary originals are multi-MB; a card only needs a thumbnail. */
function thumb(url: string): string | null {
  const raw = str(url);
  if (!raw) return null;
  const marker = "/upload/";
  const at = raw.indexOf(marker);
  if (!raw.includes("res.cloudinary.com") || at === -1) return raw;
  return `${raw.slice(0, at + marker.length)}f_auto,q_auto,w_320,c_limit/${raw.slice(at + marker.length)}`;
}

async function catalog(): Promise<Catalog> {
  if (catalogCache && Date.now() - catalogCache.at < catalogCache.ttl) return catalogCache;

  const [products, categories, services, serviceCategories] = await Promise.all([
    listDocsRest("products"),
    listDocsRest("categories"),
    listDocsRest("services"),
    listDocsRest("serviceCategories"),
  ]);

  const catName = new Map(categories.map((c) => [str(c.slug) || str(c.__id), str(c.name)]));
  const catImage = new Map(categories.map((c) => [str(c.slug) || str(c.__id), str(c.image)]));
  const svcCatName = new Map(
    serviceCategories.map((c) => [str(c.slug) || str(c.__id), str(c.name)]),
  );

  const cards = new Map<string, ProductCard>();
  const productLines = products.map((p) => {
    const slug = str(p.slug) || str(p.__id);
    const category = catName.get(str(p.category)) || str(p.category) || "";
    cards.set(slug, {
      slug,
      name: str(p.name),
      category,
      image: thumb(str(p.image) || catImage.get(str(p.category)) || ""),
      blurb: (str(p.shortDescription) || str(p.description)).slice(0, 110),
      url: `/products/${slug}`,
    });
    return [
      `- slug:${slug} | ${str(p.name)}${str(p.code) ? ` (code ${str(p.code)})` : ""}`,
      `category: ${category || "—"}`,
      str(p.shortDescription) || str(p.description).slice(0, 200),
      list(p.applications) && `applications: ${list(p.applications)}`,
      list(p.industries) && `industries: ${list(p.industries)}`,
      str(p.dosage) && `dosage: ${str(p.dosage)}`,
    ]
      .filter(Boolean)
      .join(" | ");
  });

  const serviceLines = services.map((s) => {
    const cat = str(s.serviceCategory);
    return [
      `- ${str(s.name)}`,
      `category: ${svcCatName.get(cat) || cat || "—"}`,
      (str(s.shortDescription) || str(s.description)).slice(0, 160),
    ]
      .filter(Boolean)
      .join(" | ");
  });

  const text = [
    "PRODUCTS — the ONLY products you may recommend. Put the slug: value verbatim in productSlugs.",
    productLines.join("\n") || "(none published)",
    "",
    "SERVICES:",
    serviceLines.join("\n") || "(none published)",
  ].join("\n");

  const complete = productLines.length > 0 && serviceLines.length > 0;
  catalogCache = { text, cards, at: Date.now(), ttl: complete ? CATALOG_TTL : CATALOG_RETRY_TTL };
  return catalogCache;
}

/* ------------------------------------------------------------------- voice */

// What the assistant is allowed to say, edited in Admin → Website content →
// AI assistant and stored at pages/chatbot. Cached briefly: an edit should
// reach live conversations within minutes, not require a deploy, but every
// message must not pay for a Firestore read.
let voiceCache: { value: ChatbotContent; at: number; ttl: number } | null = null;
const VOICE_TTL = 5 * 60 * 1000;
// fetchDocRest returns null for a timeout and for "never saved" alike, so a
// blip is not allowed to pin the built-in wording in place for five minutes.
const VOICE_RETRY_TTL = 45 * 1000;

async function voice(): Promise<ChatbotContent> {
  if (voiceCache && Date.now() - voiceCache.at < voiceCache.ttl) return voiceCache.value;
  const doc = await fetchDocRest("pages", "chatbot");
  voiceCache = {
    value: { ...chatbotContent, ...((doc ?? {}) as Partial<ChatbotContent>) },
    at: Date.now(),
    ttl: doc ? VOICE_TTL : VOICE_RETRY_TTL,
  };
  return voiceCache.value;
}

/** The house vocabulary, as prompt text.
 *
 * This is the reason the dashboard page exists. The assistant writes its own
 * sentences and its own quick replies, so no amount of editing a button list
 * would stop it saying "oxygen removal" — the wording has to be a rule it
 * carries into every turn. The client owns the chemistry, so the client owns
 * this list. */
function glossary(terms: ChatbotTerm[] | undefined): string {
  const rows = (terms ?? [])
    .map((t) => {
      const preferred = str(t?.preferred);
      if (!preferred) return "";
      const avoid = str(t?.avoid)
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
        .map((a) => `"${a}"`)
        .join(" or ");
      const note = str(t?.note);
      return [`- Say "${preferred}"`, avoid && `never ${avoid}`, note && `(${note})`]
        .filter(Boolean)
        .join(" — ");
    })
    .filter(Boolean);

  if (!rows.length) return "";
  return `HOUSE TERMINOLOGY — LK Chemicals' own wording. Spell these exactly as written, both in
"reply" and in "suggestions", in place of any synonym you would otherwise reach for.
${rows.join("\n")}`;
}

/* ------------------------------------------------------------ instructions */

function systemPrompt(catalogText: string, v: ChatbotContent): string {
  return `You are "LK Assist", the sales engineer on the website of LK Chemicals Pvt. Ltd. —
an ISO 9001:2015 manufacturer of industrial water-treatment chemicals in Cherlapally,
Hyderabad, serving Telangana, Andhra Pradesh, Karnataka, Tamil Nadu and Maharashtra since 2013.

WHO YOU ARE TALKING TO
A plant owner, maintenance in-charge or hotel manager, on a phone, often mid-shift. Many are
not engineers and do not know their TDS. Assume nothing. Never make anyone feel tested.

HOW TO ANSWER — this matters more than anything else
1. Keep "reply" SHORT: at most two sentences, roughly 40 words. No preamble, no repeating
   their question back at them, no "great question".
2. Ask ONE thing at a time. Never two questions in one message.
3. ALWAYS fill "suggestions" with 2-4 tappable answers to the question you just asked, each at
   most 4 words, in the visitor's language. This is how most people will reply — typing is the
   fallback, not the default.
   - Asking about industry? ["Pharma", "Hotel", "Power plant", "Something else"]
   - Asking about capacity? ["Under 5 m3/hr", "5-20 m3/hr", "Over 20 m3/hr", "Not sure"]
   - Asking about water? ["Borewell", "Municipal", "Don't know"]
   - ALWAYS include an escape like "Not sure" or "Don't know" whenever you ask for a number.
     Never leave someone stuck because they lack a figure — recommend on what you do know.
4. When you recommend, put the slug(s) in "productSlugs". The site draws a proper product card,
   so do NOT paste URLs or paths into the reply text. Name the product, let the card do the
   rest. One product is better than three.
5. After a recommendation, "suggestions" become next steps, for example
   ["How much to dose?", "Talk to sales", "Show another option"].

JARGON
Mirror the visitor's level. If they wrote "water is hard", say "hard water" — do not answer
with "feed water hardness and silica loading". Expand an abbreviation the first time you need
one: "TDS (how salty the water is)".

LANGUAGE
Reply in the visitor's own language and mirror their script: if they wrote an Indian language
in Roman letters, reply in Roman letters — never switch them into Devanagari or Telugu script
unless they used it first. Suggestions must be in that same language.

Telugu and Hindi are DIFFERENT languages and must never be swapped for each other. Romanised
Telugu is the one people in Hyderabad most often use here, and answering it in Hindi reads as
though you did not understand.
  Telugu markers: meeku, meeru, unnaya, undha, kavali, ela, entha, cheppandi, chesthara, maa,
    naaku, emi, edi, ekkada, chala, telusa.
  Hindi markers: aapko, aapke, chahiye, hai, kya, kaise, kitna, mujhe, hamare, karna, batao.
  Telugu example — Visitor: "Meeku boiler chemicals unnaya?"
    reply: "Avunu, unnayi. Mee boiler lo ekkuva samasya emiti?"
    suggestions: ["Scale", "Rust", "Teliyadu"]
If a message genuinely mixes both, follow whichever language most of the words come from.

HARD RULES
- Recommend ONLY products from the catalog below, by their exact slug. Never invent one.
- If nothing fits, say so plainly and offer the team.
- Quote dosage only when the catalog states it, always as a starting point that the technical
  team confirms against a water analysis.
- Never quote a price, promise delivery, or offer discounts — those belong to the sales team.
- Plain text only in "reply": no markdown, asterisks, backticks or bullet characters.

${[
  glossary(v.terms),
  str(v.guidance) &&
    `INSTRUCTIONS FROM LK CHEMICALS — these come from the company itself and outrank the style
guidance above, though never the HARD RULES.
${str(v.guidance)}`,
]
  .filter(Boolean)
  .join("\n\n")}

${catalogText}`;
}

/** Structured output is what makes the tappable UI possible. */
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    suggestions: { type: "array", items: { type: "string" } },
    productSlugs: { type: "array", items: { type: "string" } },
  },
  required: ["reply", "suggestions"],
};

/* --------------------------------------------------------------- rate limit */

// Per-IP token bucket. One instance's view of the world, so a speed bump
// against a single abusive client rather than a global quota.
const buckets = new Map<string, { tokens: number; at: number }>();
const LIMIT = 20;
const WINDOW = 60 * 1000;

function allow(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now - b.at > WINDOW) {
    buckets.set(ip, { tokens: LIMIT - 1, at: now });
    if (buckets.size > 5000) buckets.clear();
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

/* ------------------------------------------------------------ model calling */

const RETRYABLE = new Set([429, 500, 502, 503, 504]);
const FATAL = new Set([400, 401, 403]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Answer = { reply: string; suggestions: string[]; productSlugs: string[] };
type GenResult =
  { kind: "ok"; answer: Answer } | { kind: "blocked" } | { kind: "busy" } | { kind: "failed" };

/** Salvages an answer even if a model wraps its JSON in prose or a code fence. */
function parseAnswer(raw: string): Answer | null {
  const text = raw.trim();
  if (!text) return null;

  const candidates = [text];
  const fenced = text.match(/```(?:json)?\s*([\s\S]+?)```/i);
  if (fenced) candidates.push(fenced[1]);
  const open = text.indexOf("{");
  const close = text.lastIndexOf("}");
  if (open !== -1 && close > open) candidates.push(text.slice(open, close + 1));

  for (const c of candidates) {
    try {
      const o = JSON.parse(c) as Partial<Answer>;
      if (typeof o.reply === "string" && o.reply.trim()) {
        return {
          reply: o.reply.trim(),
          suggestions: (Array.isArray(o.suggestions) ? o.suggestions : [])
            .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
            .map((s) => s.trim().slice(0, 40))
            .slice(0, 4),
          productSlugs: (Array.isArray(o.productSlugs) ? o.productSlugs : [])
            .filter((s): s is string => typeof s === "string")
            .map((s) => s.trim())
            .slice(0, 3),
        };
      }
    } catch {
      /* try the next shape */
    }
  }
  // A model that ignored the schema entirely still said something useful, and a
  // plain answer beats an error message.
  return { reply: text, suggestions: [], productSlugs: [] };
}

async function generate(payload: Record<string, unknown>): Promise<GenResult> {
  let sawBusy = false;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      let res: Response;
      try {
        res = await fetch(ENDPOINT(model), {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey() },
          body: JSON.stringify(payload),
          // Per attempt: an overloaded model can sit for 15s before refusing,
          // and the visitor is watching a typing indicator.
          signal: AbortSignal.timeout(20_000),
        });
      } catch (err) {
        console.error(`[chat] ${model} attempt ${attempt + 1} threw`, err);
        if (attempt === 0) {
          await sleep(400);
          continue;
        }
        break;
      }

      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
          promptFeedback?: { blockReason?: string };
        };
        const raw = (data.candidates?.[0]?.content?.parts ?? [])
          .map((p) => p.text ?? "")
          .join("")
          .trim();
        const answer = raw ? parseAnswer(raw) : null;
        if (answer) return { kind: "ok", answer };

        const finish = data.candidates?.[0]?.finishReason;
        if (data.promptFeedback?.blockReason || finish === "SAFETY") return { kind: "blocked" };
        console.error(`[chat] ${model} returned nothing usable (finish=${finish})`);
        break;
      }

      const detail = (await res.text()).slice(0, 300);
      console.error(`[chat] ${model} responded ${res.status}`, detail);
      if (FATAL.has(res.status)) return { kind: "failed" };
      if (RETRYABLE.has(res.status)) {
        sawBusy = true;
        if (attempt === 0) {
          await sleep(500);
          continue;
        }
      }
      break; // 404 and friends: move on to the next model
    }
  }

  return sawBusy ? { kind: "busy" } : { kind: "failed" };
}

/* -------------------------------------------------------------------- route */

type InMessage = { role: "user" | "model"; text: string };

const MAX_TURNS = 24;
const MAX_CHARS = 2000;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      // Health check for deploys — reports whether the key is present WITHOUT
      // revealing any part of it. `?check=env` adds enough to tell the two
      // failure modes apart when a host says the variable is set but the
      // function disagrees. Values are never returned, and only
      // Gemini/Google-shaped names are ever listed.
      GET: async ({ request }) => {
        const base = { ok: true, configured: Boolean(apiKey()), models: MODELS };
        if (new URL(request.url).searchParams.get("check") !== "env") return json(base);

        const env: Record<string, string | undefined> =
          typeof process !== "undefined" && process.env ? process.env : {};
        const keys = Object.keys(env);
        return json({
          ...base,
          runtimeSeesEnv: keys.length,
          onVercel: keys.some((k) => k.startsWith("VERCEL")),
          vercelEnv: env.VERCEL_ENV ?? null,
          geminiKeySet: Boolean(env.GEMINI_API_KEY),
          geminiKeyLength: (env.GEMINI_API_KEY ?? "").length,
          lookalikeNames: keys.filter((k) => /GEMINI|GOOGLE|GENAI/i.test(k)),
        });
      },

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

        // Both reads are cached and neither is allowed to take the assistant
        // down: without the catalog it answers ungrounded and steers to the
        // team, without the document it falls back to the built-in wording.
        const [cat, v] = await Promise.all([
          catalog().catch(() => null),
          voice().catch(() => chatbotContent),
        ]);

        const result = await generate({
          contents,
          systemInstruction: {
            parts: [
              {
                text: systemPrompt(
                  cat?.text ??
                    "PRODUCTS: (catalog unavailable right now — do not name specific products)",
                  v,
                ),
              },
            ],
          },
          generationConfig: {
            temperature: 0.6,
            topP: 0.9,
            // Headroom for models that spend part of the budget thinking.
            maxOutputTokens: 1600,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
          safetySettings: [
            "HARM_CATEGORY_HARASSMENT",
            "HARM_CATEGORY_HATE_SPEECH",
            "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "HARM_CATEGORY_DANGEROUS_CONTENT",
          ].map((category) => ({ category, threshold: "BLOCK_ONLY_HIGH" })),
        });

        switch (result.kind) {
          case "ok": {
            // Resolve slugs to real cards, silently dropping anything invented —
            // a card can only ever point at a product that exists.
            const products = result.answer.productSlugs
              .map((s) => cat?.cards.get(s))
              .filter((p): p is ProductCard => Boolean(p));
            return json({
              reply: result.answer.reply,
              suggestions: result.answer.suggestions,
              products,
            });
          }
          case "blocked":
            // No chips here: a chip sends its text to the model, and there is
            // nothing useful to ask it. The WhatsApp button below the composer
            // is already the way out.
            return json({ reply: v.offTopicMessage, suggestions: [], products: [] });
          case "busy":
            return json({ error: v.busyMessage }, 503);
          default:
            return json({ error: v.errorMessage }, 502);
        }
      },
    },
  },
});
