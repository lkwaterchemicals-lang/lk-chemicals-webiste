// Shared renderer for legal/policy pages — same visual language as the rest
// of the site: dark hero with a ghost word, then a readable light band with
// numbered sections, and a contact CTA at the end.
import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { GhostWord, MicroLabel } from "@/components/site/GhostWord";
import { LiquidButton } from "@/components/site/LiquidButton";
import { useSiteSettings } from "@/lib/content";
import { POLICIES, type Policy } from "@/data/policies";

export function PolicyPage({ policy }: { policy: Policy }) {
  const { data: s } = useSiteSettings();
  const sections = policy.sections(s);

  return (
    <>
      {/* Hero */}
      <section className="section-dark relative pt-32 sm:pt-40 pb-14 overflow-hidden">
        <div className="absolute inset-0 caustics opacity-30" />
        <GhostWord className="hidden md:block absolute bottom-0 right-0 !text-[10vw] opacity-50">
          LEGAL
        </GhostWord>
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="00">Company policies</MicroLabel>
          <h1
            className="display-xl mt-4 grad-text"
            style={{ fontSize: "clamp(2.25rem, 7vw, 5.5rem)" }}
          >
            {policy.title}
          </h1>
          <p className="mt-5 max-w-xl text-white/70">{policy.tagline}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/40">
            Last updated · {policy.updated}
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="section-light py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8 grid gap-12 lg:grid-cols-[240px_1fr]">
          {/* Policy switcher — quick lateral navigation between all policies */}
          <nav aria-label="All policies" className="hidden lg:block">
            <div className="sticky top-28 space-y-1">
              <div className="micro-label !text-royal mb-3">All policies</div>
              {POLICIES.map((p) => (
                <Link
                  key={p.slug}
                  to={p.path}
                  className={
                    "block rounded-xl px-3.5 py-2.5 text-sm transition-colors " +
                    (p.slug === policy.slug
                      ? "bg-cyan-hi/10 text-royal font-semibold"
                      : "text-ink/60 hover:text-ink hover:bg-ink/5")
                  }
                >
                  {p.navLabel}
                </Link>
              ))}
            </div>
          </nav>

          <div className="max-w-3xl">
            {sections.map((sec, i) => (
              <section key={sec.heading} className={i === 0 ? "" : "mt-12"}>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-royal/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="display-xl text-xl sm:text-2xl text-foreground">{sec.heading}</h2>
                </div>
                {(sec.paras ?? []).map((p) => (
                  <p key={p.slice(0, 40)} className="mt-4 text-[15px] leading-relaxed text-ink/70">
                    {p}
                  </p>
                ))}
                {(sec.bullets ?? []).length > 0 && (
                  <ul className="mt-4 space-y-2.5">
                    {(sec.bullets ?? []).map((b) => (
                      <li key={b.slice(0, 40)} className="flex gap-2.5 text-[15px] text-ink/70">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-royal/70" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* Mobile policy switcher */}
            <div className="mt-14 lg:hidden">
              <div className="micro-label !text-royal mb-3">All policies</div>
              <div className="flex flex-wrap gap-2">
                {POLICIES.map((p) => (
                  <Link
                    key={p.slug}
                    to={p.path}
                    className={
                      "rounded-full px-4 py-2 text-xs transition-colors " +
                      (p.slug === policy.slug
                        ? "bg-cyan-hi/15 text-royal font-semibold"
                        : "bento-tile text-ink/70 hover:text-ink")
                    }
                  >
                    {p.navLabel}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-14 bento-tile rounded-3xl p-7 sm:p-8">
              <h3 className="display-xl text-xl text-foreground">Questions about this policy?</h3>
              <p className="mt-2 text-sm text-ink/70">
                Talk to a person, not a form-letter — {s.contactPerson} answers directly.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <LiquidButton to="/contact">Contact us</LiquidButton>
                <LiquidButton href={`tel:${s.phone.replace(/\s+/g, "")}`} variant="ghost">
                  {s.phone}
                </LiquidButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
