// Everything LK Assist says, as editable content.
//
// The assistant's wording is domain language, and the domain expert is the
// client — not the developer who typed the first draft. "Oxygen removal"
// versus "Oxygen Scavenger" is not a bug to be patched, it is terminology that
// belongs to whoever knows the chemistry, so all of it lives in a
// `pages/chatbot` document and is edited from the dashboard.
//
// These built-ins are the fallback: they render instantly, before Firestore
// resolves, and they keep the assistant working if the document is ever
// missing. Anything saved in the dashboard replaces the matching field.

/** A language the visitor can switch to from the opening screen. */
export type ChatbotLanguage = {
  /** Shown on the button — write it in the language itself. */
  label: string;
  /** Sent as the visitor's first message, which is what tells the assistant
   * which language to answer in. Write it the way a customer would. */
  seed: string;
  /** Optional greeting shown once this language is chosen. */
  greeting?: string;
  /** Optional opening buttons for this language, one per line. */
  starters?: string[];
};

/** House terminology. The single most important thing on this page: it is how
 * the client stops the assistant inventing its own vocabulary. */
export type ChatbotTerm = {
  /** The wording the assistant must use, spelled exactly as you want it read. */
  preferred: string;
  /** Wordings it must never use instead, comma separated. */
  avoid?: string;
  /** When this term applies — helps the assistant pick the right one. */
  note?: string;
};

export type ChatbotContent = {
  /* identity */
  title: string;
  subtitle: string;
  greeting: string;
  placeholder: string;

  /* opening quick replies */
  starters: string[];

  /* languages */
  languagePrompt: string;
  languages: ChatbotLanguage[];

  /* calls to action */
  salesCta: string;
  productCta: string;

  /* what the assistant must say and how */
  terms: ChatbotTerm[];
  guidance: string;

  /* system messages */
  busyMessage: string;
  errorMessage: string;
  offTopicMessage: string;
};

export const chatbotContent: ChatbotContent = {
  title: "LK Assist",
  subtitle: "Usually replies instantly",
  greeting: "Hi! I'm LK Assist. Tell me what you're treating and I'll find the right product.",
  placeholder: "Type your question…",

  // Phrased the way a customer would say it, not the way a chemist would.
  starters: ["RO plant water problem", "Boiler scale", "Cooling tower", "Hard water in my hotel"],

  languagePrompt: "Prefer another language?",
  languages: [
    { label: "English", seed: "Hello, I need help choosing a product." },
    { label: "తెలుగు", seed: "Namaskaram, naaku oka product kavali." },
    { label: "हिंदी", seed: "Namaste, mujhe ek product chahiye." },
  ],

  salesCta: "Talk to a person on WhatsApp",
  productCta: "View product",

  // Seeded with the client's own example so the pattern is obvious on sight.
  terms: [
    {
      preferred: "Oxygen Scavenger",
      avoid: "oxygen removal, oxygen remover, deoxygenator",
      note: "Boiler feed water chemistry that removes dissolved oxygen.",
    },
    {
      preferred: "Antiscalant",
      avoid: "anti-scaling agent, scale remover",
      note: "Prevents scale forming. A scale that has already formed is descaled, not antiscaled.",
    },
    {
      preferred: "Descaling",
      avoid: "de-scaling, scale cleaning",
      note: "Removing scale that has already formed.",
    },
  ],

  guidance: "",

  busyMessage:
    "Our assistant is busy right now. Try again in a few seconds — or tap Contact Sales to reach the team directly.",
  errorMessage: "The assistant is unavailable right now.",
  offTopicMessage: "I can't help with that one. Ask me about water treatment and I'm all yours.",
};
