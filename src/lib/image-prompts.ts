// Ready-to-paste AI image prompts, generated from the record being edited.
//
// Every image slot in the dashboard can hand the admin a prompt that already
// knows what the thing *is* — a product's real appearance ("light pink colour
// liquid"), its real packing ("25 Kg HDPE drum"), its category and its code.
// That grounding is the whole point: a generic "industrial chemical drum"
// prompt produces stock-looking filler, while "a 25 kg white HDPE drum of
// light pink antiscalant liquid" produces the product.
//
// Two house rules are baked into every prompt:
//   1. The LK logo is *attached*, never described. Describing a logo makes the
//      model invent one; attaching it and saying "use it exactly as provided"
//      keeps the brand mark intact.
//   2. No invented text on labels. Models cannot spell, and a drum with
//      garbled chemistry on it is unusable.

export type PromptContext = {
  /** Collection id ("products", "services"…) or "page:about" for page content. */
  module: string;
  /** The field being filled — image / banner / ogImage / gallery / img / src. */
  fieldKey: string;
  record: Record<string, unknown>;
};

export type GeneratedPrompt = {
  title: string;
  /** The prompt itself — copy, paste, attach the logo, generate. */
  prompt: string;
  /** Aspect ratio the slot wants. */
  aspect: string;
  /** Short reminders shown under the prompt in the dashboard. */
  tips: string[];
};

/* ------------------------------------------------------------------ house */

// The site is a deep-water aesthetic: near-black navy, cool cyan highlights,
// clean industrial realism. Prompts inherit it so generated images sit in the
// page instead of fighting it.
const HOUSE_STYLE =
  "Photorealistic industrial product photography, deep navy-to-black background " +
  "(#0b1220), cool cyan rim light (#38bdf8) from the left, soft key light from " +
  "above, subtle water-surface reflections, shallow depth of field, 50mm lens, " +
  "crisp focus, no clutter, generous negative space for text overlay.";

const LOGO_RULE =
  "Use the attached LK Chemicals logo exactly as supplied — do not redraw, " +
  "restyle, recolour or letter it. Place it small and cleanly on the label.";

const TEXT_RULE =
  "Do not render any other text, product names, numbers or specifications — " +
  "leave label areas blank so real artwork can be applied later.";

const NEGATIVE =
  "Avoid: cartoon or 3D-render look, stock-photo watermarks, distorted or " +
  "invented lettering, human hands, cluttered backgrounds, oversaturated colours.";

/* --------------------------------------------------------------- grounding */

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);

/** The product's real colour and form, straight off its data sheet. */
function appearanceOf(record: Record<string, unknown>): string {
  const specs = Array.isArray(record.specifications)
    ? (record.specifications as { name?: string; value?: string }[])
    : [];
  const row = specs.find((s) => /appearance|colour|color|form/i.test(str(s.name)));
  const value = str(row?.value);
  if (!value) return "clear pale liquid";
  // "Light pink colour liquid" → "light pink liquid"
  return value
    .replace(/\bcolou?r\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** The pack the product actually ships in. */
function packOf(record: Record<string, unknown>): string {
  const packing = list(record.packing);
  const first = packing[0] ?? "";
  const m = first.match(/^(\d+)\s*(kg|l)\b/i);
  if (!m) return "25 litre white HDPE drum";
  const unit = m[2].toLowerCase() === "kg" ? "kg" : "litre";
  const vessel = /can|jerry/i.test(first) ? "jerry can" : /carboy/i.test(first) ? "carboy" : "drum";
  return `${m[1]} ${unit} white HDPE ${vessel}`;
}

const categoryLabel = (record: Record<string, unknown>) =>
  str(record.categoryName) || str(record.category).replace(/^\d+-/, "").replace(/-/g, " ");

/** One sentence of what the thing does, for scene context. Data-sheet phrases
 * often arrive without a full stop; the prompt reads as one run-on sentence
 * unless it is closed off here. */
function purposeOf(record: Record<string, unknown>): string {
  const short = str(record.shortDescription);
  const source = short || str(record.description).split(/(?<=\.)\s/)[0] || "";
  if (!source) return "";
  return /[.!?]$/.test(source) ? source : `${source}.`;
}

/* ----------------------------------------------------------------- builders */

function productPrompt(ctx: PromptContext): GeneratedPrompt {
  const r = ctx.record;
  const name = str(r.name) || "the product";
  const code = str(r.code);
  const appearance = appearanceOf(r);
  const pack = packOf(r);
  const category = categoryLabel(r);
  const purpose = purposeOf(r);

  if (ctx.fieldKey === "gallery" || ctx.fieldKey === "img") {
    return {
      title: `Gallery shot — ${name}`,
      aspect: "4:3",
      prompt: [
        `Industrial application photograph for ${name}${code ? ` (${code})` : ""}, a ${category || "water treatment"} chemical.`,
        purpose ? `Context: ${purpose}` : "",
        `Show the dosing scene: a ${pack} connected to a metering dosing pump beside stainless-steel process piping in a clean Indian industrial water-treatment plant. Daylight through a high window, cyan equipment accents.`,
        HOUSE_STYLE,
        LOGO_RULE,
        TEXT_RULE,
        NEGATIVE,
      ]
        .filter(Boolean)
        .join(" "),
      tips: [
        "Generate 3–4 variations and keep the one where the drum sits at eye level.",
        "Attach the LK logo file before generating.",
      ],
    };
  }

  if (ctx.fieldKey === "ogImage") {
    return {
      title: `Social share card — ${name}`,
      aspect: "1200×630 (1.91:1)",
      prompt: [
        `Wide social-share banner for ${name}${code ? `, product code ${code}` : ""}.`,
        `A single ${pack} of ${appearance}, three-quarter view, positioned on the right third of the frame.`,
        `Left two-thirds: empty dark gradient space reserved for a headline.`,
        HOUSE_STYLE,
        LOGO_RULE,
        TEXT_RULE,
        NEGATIVE,
      ].join(" "),
      tips: [
        "Keep the left half clear — the product name is overlaid there.",
        "Export at exactly 1200×630 so link previews don't crop the drum.",
      ],
    };
  }

  return {
    title: `Product photo — ${name}`,
    aspect: "4:3 or 1:1",
    prompt: [
      `Studio product photograph of a ${pack} containing ${appearance}, the packaging for ${name}${code ? ` (${code})` : ""}${category ? `, a ${category} product` : ""}.`,
      purpose ? `It is used for: ${purpose}` : "",
      `Single container, three-quarter front view, standing on a wet dark surface with a faint reflection, a thin sheet of water catching the cyan rim light. Blank white label panel facing the camera.`,
      HOUSE_STYLE,
      LOGO_RULE,
      TEXT_RULE,
      NEGATIVE,
    ]
      .filter(Boolean)
      .join(" "),
    tips: [
      `Colour matters: the data sheet says "${appearance}" — reject any result that changes it.`,
      "Attach the LK logo file; never let the model invent a mark.",
      "One container only. Rows of identical drums read as stock photography.",
    ],
  };
}

function categoryPrompt(ctx: PromptContext): GeneratedPrompt {
  const r = ctx.record;
  const name = str(r.name) || "the category";
  const tagline = str(r.tagline) || purposeOf(r);
  const banner = ctx.fieldKey === "banner";

  return {
    title: `${banner ? "Category banner" : "Category cover"} — ${name}`,
    aspect: banner ? "21:9" : "3:2",
    prompt: [
      `${banner ? "Ultra-wide hero banner" : "Category cover image"} representing ${name} for an industrial water-treatment chemical manufacturer.`,
      tagline ? `The range is about: ${tagline}` : "",
      sceneFor(name),
      banner
        ? "Composition: the subject sits to the right, the left half stays dark and uncluttered for a large headline."
        : "Composition: centred subject with breathing room, works cropped square or 3:2.",
      HOUSE_STYLE,
      TEXT_RULE,
      NEGATIVE,
    ]
      .filter(Boolean)
      .join(" "),
    tips: [
      "This image also backs every product in the category that has no photo of its own — keep it generic enough to sit behind any of them.",
      banner ? "Export at least 2400px wide." : "Export at least 1600px wide.",
    ],
  };
}

/** A concrete scene beats an abstract description — pick one per category. */
function sceneFor(name: string): string {
  const n = name.toLowerCase();
  if (/\bro\b|membrane|reverse osmosis/.test(n)) {
    return "Scene: a bank of white FRP reverse-osmosis pressure vessels with a spiral-wound membrane element partly withdrawn, showing its layered mesh; polished stainless manifolds and pressure gauges.";
  }
  if (/boiler/.test(n)) {
    return "Scene: an industrial steam boiler house — insulated pipework, a feed-water deaerator, pressure gauges and valve wheels, warm haze catching the light.";
  }
  if (/cooling tower|frp fill/.test(n)) {
    return "Scene: the top of an induced-draught cooling tower — fan cowl, water distribution nozzles spraying over PVC fill packs, fine mist backlit against a dusk sky.";
  }
  if (/etp|stp|effluent|sewage/.test(n)) {
    return "Scene: an effluent treatment plant aeration basin at golden hour, surface aerators churning, clarifier bridge behind, clean water weir in the foreground.";
  }
  if (/descal/.test(n)) {
    return "Scene: a shell-and-tube heat exchanger opened for cleaning — one half of the tube sheet heavily scaled and chalky, the other half cleaned back to bright metal, split down the middle of the frame.";
  }
  if (/resin/.test(n)) {
    return "Scene: a macro of amber ion-exchange resin beads spilling through clear water inside a glass column, each bead catching the light.";
  }
  if (/ahu|air handling/.test(n)) {
    return "Scene: an air handling unit with its access panel open, showing a finned cooling coil mid-clean — one half grimy, one half bright aluminium.";
  }
  if (/plant/.test(n)) {
    return "Scene: a skid-mounted water treatment plant — blue FRP vessels, PVC manifolds, a control panel with indicator lamps, installed in a clean plant room.";
  }
  if (/water treatment/.test(n)) {
    return "Scene: a clarifier and dosing skid — coagulant dosing pumps, a flash mixer stirring a floc-forming tank, clear treated water overflowing a weir.";
  }
  return "Scene: a clean industrial water-treatment plant room — stainless pipework, dosing pumps, gauges and a control panel, water catching cool light.";
}

function servicePrompt(ctx: PromptContext): GeneratedPrompt {
  const r = ctx.record;
  const name = str(r.name) || "the service";
  const purpose = purposeOf(r);
  return {
    title: `Service image — ${name}`,
    aspect: ctx.fieldKey === "banner" ? "21:9" : "3:2",
    prompt: [
      `Documentary-style photograph of an industrial service crew performing ${name}.`,
      purpose ? `The job: ${purpose}` : "",
      "Two technicians in navy coveralls, safety helmets, gloves and goggles working on plant equipment; tools and a service trolley in frame; one technician reading a gauge. Real working environment, not a studio.",
      "Faces turned away from camera or out of focus.",
      HOUSE_STYLE,
      TEXT_RULE,
      NEGATIVE,
    ]
      .filter(Boolean)
      .join(" "),
    tips: [
      "Faces away from camera keeps it honest — it isn't a photo of your actual team.",
      "Swap in a real site photo when you have one; visitors can tell.",
    ],
  };
}

function pagePrompt(ctx: PromptContext): GeneratedPrompt {
  const key = ctx.fieldKey;
  const record = ctx.record;
  const title = str(record.title) || str(record.heroHeading) || "";

  if (/^cert/i.test(key) || key === "img") {
    // Certificates and awards are scans of real documents — never generated.
    return {
      title: "Certificate or award — scan, don't generate",
      aspect: "4:3 (portrait document, shown uncropped)",
      prompt:
        "Do not generate this image. Certificates, approvals and awards must be " +
        "photographs or scans of the real document — a generated certificate is a " +
        "fabricated credential. Scan at 300dpi, crop to the certificate border, " +
        "straighten it, and upload the flat image.",
      tips: [
        "Phone photos work: lay it flat, even light, shoot straight down, no flash glare.",
        "The site shows certificates uncropped, so any aspect ratio is safe.",
      ],
    };
  }

  if (key === "heroImage") {
    return {
      title: "Page hero background",
      aspect: "16:9 or wider",
      prompt: [
        `Wide atmospheric hero background for the ${ctx.module.replace("page:", "")} page of an industrial water-treatment chemical manufacturer${title ? ` — the headline reads "${title}"` : ""}.`,
        "Scene: a modern chemical manufacturing floor at blue hour — stainless reactors and blending vessels, pipework, a clean epoxy floor with faint reflections.",
        "Deliberately low contrast and slightly dark: text sits on top of this image.",
        HOUSE_STYLE,
        TEXT_RULE,
        NEGATIVE,
      ].join(" "),
      tips: [
        "The page darkens this image and lays a headline over it — favour a calm, uncluttered frame.",
        "Export at least 2400px wide.",
      ],
    };
  }

  return {
    title: title ? `Image — ${title}` : "Section image",
    aspect: "3:2",
    prompt: [
      `Editorial photograph for a website section${title ? ` titled "${title}"` : ""} on an industrial water-treatment chemical manufacturer's site.`,
      str(record.body) ? `The section says: ${str(record.body)}` : "",
      "Scene: authentic plant or laboratory detail — a chemist checking a titration, a QC bench with sample bottles, or a blending vessel being charged.",
      HOUSE_STYLE,
      TEXT_RULE,
      NEGATIVE,
    ]
      .filter(Boolean)
      .join(" "),
    tips: ["Keep the whole set consistent — same light, same palette, same lens feel."],
  };
}

function teamPrompt(): GeneratedPrompt {
  return {
    title: "Team portrait — photograph, don't generate",
    aspect: "1:1 portrait crop",
    prompt:
      "Do not generate this image. A generated face presented as a named employee " +
      "misrepresents a real person. Take a real portrait instead: stand the person " +
      "against a plain wall, shoot at chest height in soft daylight (a window to one " +
      "side), crop square with the eyes on the upper third. The site falls back to a " +
      "clean monogram until a real photo exists — which is a perfectly good default.",
    tips: [
      "Shoot the whole team in one session so the portraits match.",
      "Portrait crop, at least 800×800.",
    ],
  };
}

function galleryPrompt(): GeneratedPrompt {
  return {
    title: "Gallery image — facility & process",
    aspect: "3:2 (or 2:1 for a wide tile)",
    prompt: [
      "Documentary photograph for a manufacturer's gallery: an Indian chemical plant that makes water-treatment chemistry.",
      "Pick one subject — a blending vessel being charged, drums on a filling line, a QC laboratory bench with burettes and sample bottles, or a warehouse of stacked HDPE drums.",
      HOUSE_STYLE,
      TEXT_RULE,
      NEGATIVE,
    ].join(" "),
    tips: [
      "The gallery is the most-checked proof that you actually manufacture — real photos beat generated ones every time.",
      "If you generate, keep every tile in one consistent light and palette.",
    ],
  };
}

/* ------------------------------------------------------------------ public */

/** Builds the prompt for whichever image slot is being filled. */
export function buildImagePrompt(ctx: PromptContext): GeneratedPrompt {
  const { module, fieldKey } = ctx;
  if (module === "team") return teamPrompt();
  if (module === "gallery") return galleryPrompt();
  if (module === "products") return productPrompt(ctx);
  if (module === "categories" || module === "serviceCategories") return categoryPrompt(ctx);
  if (module === "services") return servicePrompt(ctx);
  if (module.startsWith("page:")) {
    if (/^(certifications|awards)$/.test(fieldKey)) return pagePrompt({ ...ctx, fieldKey: "cert" });
    return pagePrompt(ctx);
  }
  return pagePrompt(ctx);
}

/** Everything a generation tool needs, as one pasteable block. */
export function promptAsText(p: GeneratedPrompt): string {
  return `${p.prompt}\n\nAspect ratio: ${p.aspect}`;
}
