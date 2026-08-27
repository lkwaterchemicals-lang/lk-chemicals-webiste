// Live preview for the AI assistant page.
//
// The editor is a stack of text fields; this is what those fields actually look
// like to a customer. It redraws on every keystroke against the unsaved values,
// so wording is judged in place rather than by saving and hunting for the
// launcher on the public site.
//
// It is a deliberate replica, not the real ChatBot: that component is a
// fixed-position portal wired to a live Gemini thread, neither of which belongs
// inside an admin form. Only the parts the client can edit are drawn.
import { useState } from "react";
import { Send } from "lucide-react";
import logoUrl from "@/assets/lk-logo.png";
import type { ChatbotContent } from "@/data/chatbot";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

function Chip({ children, on }: { children: React.ReactNode; on?: boolean }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1.5 text-[11px] font-medium"
      style={{
        color: on ? "var(--a-accent)" : "var(--a-text2)",
        background: on ? "color-mix(in oklab, var(--a-accent) 12%, transparent)" : "transparent",
        border: `1px solid ${on ? "color-mix(in oklab, var(--a-accent) 40%, transparent)" : "var(--a-border)"}`,
      }}
    >
      {children}
    </span>
  );
}

export function ChatbotPreview({ value }: { value: Record<string, unknown> }) {
  const v = value as unknown as ChatbotContent;
  const languages = arr<ChatbotContent["languages"][number]>(v.languages);
  const terms = arr<ChatbotContent["terms"][number]>(v.terms);

  // Selecting a language here previews that language's opening screen, which is
  // the only way to proof-read a translation without switching the live site.
  const [lang, setLang] = useState<number | null>(null);
  const active = lang === null ? null : languages[lang];
  const greeting = str(active?.greeting) || str(v.greeting);
  const starters = (active?.starters?.length ? active.starters : arr<string>(v.starters)) ?? [];

  return (
    <div className="space-y-3">
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          border: "1px solid var(--a-border2)",
          background: "var(--a-surface)",
          boxShadow: "var(--a-shadow-lg)",
        }}
      >
        {/* header */}
        <div
          className="flex items-center gap-2.5 px-3.5 py-3"
          style={{ borderBottom: "1px solid var(--a-border)", background: "var(--a-surface2)" }}
        >
          <span
            className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full"
            style={{ background: "#fff", border: "1px solid var(--a-border)" }}
          >
            <img src={logoUrl} alt="" className="h-5 w-auto" />
          </span>
          <span className="min-w-0">
            <span
              className="block truncate text-[13px] font-semibold"
              style={{ color: "var(--a-text)" }}
            >
              {str(v.title) || "—"}
            </span>
            <span
              className="flex items-center gap-1.5 truncate text-[11px]"
              style={{ color: "var(--a-text3)" }}
            >
              <i
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: "var(--a-ok)" }}
              />
              {str(v.subtitle)}
            </span>
          </span>
        </div>

        {/* conversation */}
        <div className="space-y-2.5 px-3.5 py-3.5" style={{ background: "var(--a-bg)" }}>
          <p
            className="max-w-[92%] rounded-2xl rounded-tl-md px-3 py-2 text-[12.5px] leading-relaxed"
            style={{
              color: "var(--a-text)",
              background: "var(--a-surface2)",
              border: "1px solid var(--a-border)",
            }}
          >
            {greeting || <em style={{ color: "var(--a-text3)" }}>No welcome message</em>}
          </p>

          {starters.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {starters.map((s, i) => (
                <Chip key={`${s}-${i}`}>{s}</Chip>
              ))}
            </div>
          )}

          {languages.length > 1 && (
            <div className="space-y-1.5 pt-2" style={{ borderTop: "1px solid var(--a-border)" }}>
              <span className="block text-[11px]" style={{ color: "var(--a-text3)" }}>
                {str(v.languagePrompt)}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {languages.map((l, i) => (
                  <button
                    key={`${l?.label}-${i}`}
                    type="button"
                    onClick={() => setLang(lang === i ? null : i)}
                    title="Preview this language's opening screen"
                  >
                    <Chip on={lang === i}>{str(l?.label) || `Language ${i + 1}`}</Chip>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* composer */}
        <div
          className="flex items-center gap-2 px-3.5 py-3"
          style={{ borderTop: "1px solid var(--a-border)", background: "var(--a-surface2)" }}
        >
          <span
            className="flex-1 truncate rounded-xl px-3 py-2 text-[12px]"
            style={{
              color: "var(--a-text3)",
              background: "var(--a-surface)",
              border: "1px solid var(--a-border)",
            }}
          >
            {str(v.placeholder)}
          </span>
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
            style={{ background: "var(--a-accent)", color: "#fff" }}
          >
            <Send className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* the handover, which sits below the composer on the real panel */}
        <div className="px-3.5 pb-3.5" style={{ background: "var(--a-surface2)" }}>
          <span
            className="block truncate rounded-xl px-3 py-2 text-center text-[12px] font-semibold"
            style={{ background: "#25d366", color: "#fff" }}
          >
            {str(v.salesCta)}
          </span>
        </div>
      </div>

      {/* What the preview cannot show: the assistant writes its own sentences,
          so the terminology list is the part that shapes them. */}
      <div
        className="rounded-xl p-3 text-[11px] leading-relaxed"
        style={{
          color: "var(--a-text3)",
          background: "var(--a-surface2)",
          border: "1px solid var(--a-border)",
        }}
      >
        {terms.length > 0 ? (
          <>
            <span className="font-semibold" style={{ color: "var(--a-text2)" }}>
              Always says:
            </span>{" "}
            {terms
              .map((t) => str(t?.preferred))
              .filter(Boolean)
              .join(" · ")}
            <br />
          </>
        ) : (
          <>
            <span className="font-semibold" style={{ color: "var(--a-warn)" }}>
              No house terms set.
            </span>{" "}
            The assistant will use its own wording.
            <br />
          </>
        )}
        Replies and quick-reply buttons are written by the assistant in the customer&rsquo;s
        language, so they cannot be previewed — the terminology above is what holds them to your
        wording. Product names, categories and photos come from the catalog: publish a product and
        it becomes recommendable.
      </div>
    </div>
  );
}
