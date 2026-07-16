// Home "What we service" — the service catalog's own signature moment,
// deliberately nothing like the product photo-rail.
//
// Desktop: an expanding photo-panel band — every category is a full-height
// photo panel; the hovered/focused one opens into an editorial card while the
// rest compress into labelled spines (flex-grow transition, no JS layout
// work). Mobile: a scroll-driven 3D card deck — each category is a full card
// that pins under the nav and gets covered by the next one sliding over it,
// the buried cards receding in scale like a shuffled deck. Categories without
// photos fall back to icon + brand gradient, and every colour rides the
// section tokens so both themes work without special cases.
import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useServiceCategories, useServices } from "@/lib/content";
import { useHomeContent } from "@/lib/pages";
import { iconByName } from "@/lib/icons";
import type { ServiceCategory } from "@/data/products";
import { GhostWord, MicroLabel } from "./GhostWord";
import { LiquidButton } from "./LiquidButton";

export function ServiceIndex() {
  const { data: categories } = useServiceCategories();
  const { data: services } = useServices();
  const { data: c } = useHomeContent();
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  // Admin-managed catalog: nothing published yet → no fabricated section.
  if (categories.length === 0) return null;

  const countFor = (slug: string) => services.filter((s) => s.serviceCategory === slug).length;

  // overflow-x-clip, NOT overflow-hidden: a hidden ancestor becomes a scroll
  // container and silently kills every position:sticky inside it (the desktop
  // console and the mobile deck both pin). `clip` contains the ghost word
  // without breaking sticky.
  return (
    <section className="section-light relative overflow-x-clip py-28">
      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <MicroLabel n="04" className="!text-royal">
              What we service
            </MicroLabel>
            <h2
              className="display-xl mt-3 max-w-3xl"
              style={{ fontSize: "clamp(2.25rem, 8vw, 5rem)" }}
            >
              {c.serviceHeadingLead}{" "}
              <span className="grad-leaf-text">{c.serviceHeadingAccent}</span>
            </h2>
            <p className="mt-4 max-w-xl text-ink/70">{c.serviceSubtitle}</p>
          </div>
          <LiquidButton to="/services" variant="primary">
            All services
          </LiquidButton>
        </div>

        {/* ---------- Desktop: expanding photo panels ----------
            The whole catalog in one glance: every category is a full-height
            photo panel; the hovered (or keyboard-focused) one breathes open
            into an editorial card while its neighbours compress into labelled
            spines. Flex-grow does the choreography — pure CSS transition, no
            layout thrash. */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
          className="mt-14 hidden lg:flex gap-3 h-[clamp(460px,58vh,600px)]"
        >
          {categories.map((cat, i) => {
            const Icon = iconByName(cat.iconName);
            const isActive = i === active;
            const count = countFor(cat.slug);
            return (
              <Link
                key={cat.slug}
                id={`svc-${cat.slug}`}
                to="/services/$category"
                params={{ category: cat.slug }}
                aria-label={`${cat.name} — explore services`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group relative block min-w-0 overflow-hidden rounded-[1.75rem] bg-ink-2 outline-none focus-visible:ring-2 focus-visible:ring-cyan-hi"
                style={{
                  flexGrow: isActive ? 4 : 1,
                  flexBasis: 0,
                  transition: reduced
                    ? undefined
                    : "flex-grow 0.75s cubic-bezier(0.22, 0.9, 0.26, 1)",
                }}
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className={
                      "absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-700 " +
                      (isActive ? "scale-100 grayscale-0" : "scale-105 grayscale-[0.4]")
                    }
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-royal/50 via-ink-2 to-ink" />
                )}
                {/* Legibility scrim — heavier while expanded, so copy reads
                    over any photo in either theme */}
                <div
                  className={
                    "absolute inset-0 bg-gradient-to-t transition-opacity duration-700 " +
                    (isActive
                      ? "from-black/85 via-black/35 to-black/10 opacity-100"
                      : "from-black/80 via-black/45 to-black/25 opacity-100")
                  }
                />

                {/* Collapsed spine: number on top, vertical name, a round
                    photo thumb as the anchor (icon only when no photo exists) */}
                <div
                  className={
                    "absolute inset-0 flex flex-col items-center justify-between py-6 transition-opacity duration-400 " +
                    (isActive ? "opacity-0 pointer-events-none" : "opacity-100")
                  }
                >
                  <span className="display-xl text-lg text-cyan-hi">{cat.number}</span>
                  <span
                    className="display-xl whitespace-nowrap text-xl xl:text-2xl text-on-media"
                    style={{ writingMode: "vertical-rl" }}
                  >
                    {cat.name}
                  </span>
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-white/50 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.7)]"
                    />
                  ) : (
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-white/12 text-on-media backdrop-blur">
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                </div>

                {/* Expanded editorial card */}
                <div
                  className={
                    "absolute inset-0 flex flex-col justify-end p-8 xl:p-10 transition-all duration-500 " +
                    (isActive
                      ? "opacity-100 translate-y-0 delay-150"
                      : "opacity-0 translate-y-4 pointer-events-none")
                  }
                >
                  <span className="display-xl absolute top-7 right-8 text-5xl text-on-media opacity-50">
                    {cat.number}
                  </span>
                  {/* No icon chip here — the panel itself is the category's
                      photo; a glyph on top of it was just noise. The label
                      rides a dark chip so it reads over light photo areas. */}
                  <span className="micro-label w-fit rounded-full bg-black/40 px-3 py-1.5 !text-cyan-hi backdrop-blur-sm">
                    {cat.number} · Field crew
                  </span>
                  <h3 className="display-xl mt-4 text-4xl xl:text-5xl text-on-media">{cat.name}</h3>
                  <p className="mt-3 max-w-xl text-sm xl:text-base text-on-media-soft line-clamp-2">
                    {cat.tagline}
                  </p>
                  <p className="mt-2 max-w-xl text-sm text-on-media-soft line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-cyan-hi px-5 py-2.5 text-sm font-semibold text-ink shadow-[0_12px_32px_-12px_var(--cyan-hi)] transition-transform duration-300 group-hover:gap-3">
                      Explore <ArrowUpRight className="h-4 w-4" />
                    </span>
                    {count > 0 && (
                      <span className="inline-flex items-center rounded-full bg-leaf px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-ink shadow-[0_10px_24px_-10px_var(--leaf)]">
                        {count} service {count === 1 ? "line" : "lines"}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </motion.div>

        {/* ---------- Mobile / tablet: scroll-driven 3D card deck ---------- */}
        <ServiceDeck categories={categories} countFor={countFor} reduced={!!reduced} />
      </div>
      {/* Decorative watermark in normal flow BELOW the rows — absolutely
          positioned it sat behind the last category and read as a glitch. */}
      <GhostWord className="mt-12 text-center !text-[15vw] opacity-60">SERVICE</GhostWord>
    </section>
  );
}

/* ------------------------------------------------------------- mobile deck */

// Each accent rides a theme-aware CSS var, so the tints hold up in both the
// glacial light palette and the deep-water dark one.
const DECK_HUES = ["var(--cyan-hi)", "var(--leaf)", "var(--royal)"];

function ServiceDeck({
  categories,
  countFor,
  reduced,
}: {
  categories: ServiceCategory[];
  countFor: (slug: string) => number;
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <div ref={ref} className="mt-10 lg:hidden">
      {categories.map((cat, i) => (
        <DeckCard
          key={cat.slug}
          id={`svc-${cat.slug}`}
          cat={cat}
          i={i}
          total={categories.length}
          progress={scrollYProgress}
          count={countFor(cat.slug)}
          reduced={reduced}
        />
      ))}
    </div>
  );
}

function DeckCard({
  id,
  cat,
  i,
  total,
  progress,
  count,
  reduced,
}: {
  id?: string;
  cat: ServiceCategory;
  i: number;
  total: number;
  progress: MotionValue<number>;
  count: number;
  reduced: boolean;
}) {
  const Icon = iconByName(cat.iconName);
  const hue = DECK_HUES[i % DECK_HUES.length];
  // As the next card slides over this one, this card recedes into the deck.
  const scale = useTransform(progress, [i / total, 1], [1, 1 - (total - i) * 0.045]);
  const dim = useTransform(progress, [i / total, 1], [1, 0.82]);
  const brightness = useTransform(dim, (v) => `brightness(${v.toFixed(3)})`);
  return (
    // Sticky wrapper: the card pins below the nav while its successors scroll
    // over it. Increasing offsets leave the buried cards' top edges peeking
    // out — the deck reads as physical layers.
    <div id={id} className="sticky mb-6 last:mb-0" style={{ top: `calc(92px + ${i * 14}px)` }}>
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 42, rotateX: 9 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, margin: "-6%" }}
        transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
        style={
          reduced
            ? undefined
            : {
                scale,
                filter: brightness,
                transformOrigin: "top center",
                transformPerspective: 1000,
              }
        }
        className="relative overflow-hidden rounded-[1.75rem] bento-tile shadow-[0_18px_50px_-24px_oklch(0.15_0.05_250/0.45)]"
      >
        {/* Per-card accent wash + texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(130% 100% at 88% -10%, color-mix(in oklab, ${hue} 22%, transparent), transparent 62%)`,
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid opacity-20" />
        {/* Oversized ghost number anchors the layer visually (photo cards get
            the number etched on the image instead) */}
        {!cat.image && (
          <span
            aria-hidden
            className="display-xl pointer-events-none absolute -top-3 right-3 text-[5.5rem] leading-none"
            style={{ color: hue, opacity: 0.13 }}
          >
            {cat.number}
          </span>
        )}

        <Link
          to="/services/$category"
          params={{ category: cat.slug }}
          className="relative block active:scale-[0.99] transition-transform"
        >
          {cat.image && (
            <div className="relative h-40 overflow-hidden">
              <img src={cat.image} alt="" loading="lazy" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <span className="display-xl absolute bottom-2.5 right-4 text-4xl text-on-media opacity-85">
                {cat.number}
              </span>
            </div>
          )}
          <div className={"px-6 pb-7 " + (cat.image ? "pt-5" : "pt-6")}>
            {cat.image ? (
              <div className="flex items-center gap-3">
                <img
                  src={cat.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/40"
                />
                <span className="micro-label !text-royal">{cat.number} · Field crew</span>
              </div>
            ) : (
              <>
                <span
                  className="grid h-14 w-14 place-items-center rounded-2xl"
                  style={{ background: `color-mix(in oklab, ${hue} 16%, transparent)`, color: hue }}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="micro-label !text-royal mt-5 block">
                  {cat.number} · Field crew
                </span>
              </>
            )}
            <h3 className="display-xl mt-1.5 text-2xl text-foreground">{cat.name}</h3>
            <p className="mt-2.5 text-sm text-ink/70">{cat.tagline}</p>
            <p className="mt-2 text-sm text-ink/60 line-clamp-3">{cat.description}</p>
            <span className="mt-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-hi px-5 py-2.5 text-sm font-medium text-ink shadow-[0_12px_32px_-12px_var(--cyan-hi)]">
                Explore <ArrowUpRight className="h-4 w-4" />
              </span>
              {count > 0 && (
                <span className="inline-flex items-center rounded-full bg-leaf px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-ink shadow-[0_10px_24px_-10px_var(--leaf)]">
                  {count} service {count === 1 ? "line" : "lines"}
                </span>
              )}
            </span>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
