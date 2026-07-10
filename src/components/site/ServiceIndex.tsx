// Home "What we service" — the service catalog's own signature moment,
// deliberately nothing like the product photo-rail.
//
// Desktop: an editorial index — numbered rows on the left drive a sticky 3D
// "field console" on the right that tilts with the pointer (spring physics)
// and crossfades between categories, with a slow conic halo spinning behind
// the icon. Mobile: a scroll-driven 3D card deck — each category is a full
// card that pins under the nav and gets covered by the next one sliding over
// it, the buried cards receding in scale like a shuffled deck. Icon +
// typography driven, so it looks finished before any category photos exist,
// and every colour rides the section-light tokens so both themes work
// without special cases.
import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowUpRight, Wrench } from "lucide-react";
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

  // Pointer-follow tilt for the desktop console.
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 160, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-9, 9]), { stiffness: 160, damping: 18 });

  // Admin-managed catalog: nothing published yet → no fabricated section.
  if (categories.length === 0) return null;

  const current = categories[Math.min(active, categories.length - 1)];
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

        {/* ---------- Desktop: index rows + sticky 3D console ---------- */}
        <div className="mt-14 hidden lg:grid grid-cols-12 gap-10 items-start">
          <div className="col-span-7 border-t border-ink/10">
            {categories.map((cat, i) => {
              const Icon = iconByName(cat.iconName);
              const isActive = i === active;
              return (
                <motion.div
                  id={`svc-${cat.slug}`}
                  key={cat.slug}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-8%" }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                >
                  <Link
                    to="/services/$category"
                    params={{ category: cat.slug }}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="group relative flex items-center gap-6 py-6 border-b border-ink/10"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="svc-active-rail"
                        aria-hidden
                        className="absolute -left-5 top-4 bottom-4 w-[3px] rounded-full"
                        style={{
                          background:
                            "linear-gradient(180deg, var(--royal), var(--cyan-hi), var(--leaf))",
                        }}
                      />
                    )}
                    <span
                      className={
                        "display-xl w-10 shrink-0 text-xl transition-all duration-300 " +
                        (isActive ? "grad-leaf-text" : "text-foreground opacity-25")
                      }
                    >
                      {cat.number}
                    </span>
                    <motion.span
                      animate={{ scale: isActive ? 1.08 : 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      className={
                        "grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-colors duration-300 " +
                        (isActive
                          ? "bg-cyan-hi/20 text-cyan-hi"
                          : "bg-cyan-hi/10 text-cyan-hi opacity-70")
                      }
                    >
                      <Icon className="h-5 w-5" />
                    </motion.span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={
                          "display-xl block text-2xl xl:text-3xl transition-opacity duration-300 " +
                          (isActive ? "text-foreground" : "text-foreground opacity-60")
                        }
                      >
                        {cat.name}
                      </span>
                      <span className="mt-1 block text-sm text-ink/60 line-clamp-1">
                        {cat.tagline}
                      </span>
                    </span>
                    <span
                      className={
                        "grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-300 " +
                        (isActive
                          ? "border-cyan-hi text-cyan-hi rotate-45"
                          : "border-ink/15 text-foreground opacity-40")
                      }
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            className="col-span-5 sticky top-28"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              mx.set((e.clientX - r.left) / r.width);
              my.set((e.clientY - r.top) / r.height);
            }}
            onMouseLeave={() => {
              mx.set(0.5);
              my.set(0.5);
            }}
          >
            <motion.div
              style={
                reduced
                  ? undefined
                  : { rotateX, rotateY, transformPerspective: 1200, transformStyle: "preserve-3d" }
              }
              className="relative min-h-[480px] overflow-hidden rounded-[2rem] bento-tile"
            >
              {/* Slow conic halo + dot grid give the console a "live" depth */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full opacity-25"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0%, var(--cyan-hi) 30%, var(--leaf) 55%, transparent 75%)",
                  filter: "blur(2px)",
                }}
                animate={reduced ? undefined : { rotate: 360 }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              />
              <div className="pointer-events-none absolute inset-0 dot-grid opacity-25" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.slug}
                  initial={{ opacity: 0, y: 26, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -18, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                  className="relative flex h-full min-h-[480px] flex-col"
                  style={{ z: reduced ? 0 : 46 }}
                >
                  {(() => {
                    const Icon = iconByName(current.iconName);
                    return current.image ? (
                      /* Cover image header — full bleed inside the console,
                         with a legibility scrim and the category number
                         etched over it (always-white text-on-media, so both
                         themes read over the photo). */
                      <div className="relative h-52 xl:h-60 shrink-0 overflow-hidden">
                        <motion.img
                          src={current.image}
                          alt=""
                          initial={reduced ? undefined : { scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                        <span className="display-xl absolute bottom-3 right-6 text-5xl text-on-media opacity-80">
                          {current.number}
                        </span>
                      </div>
                    ) : (
                      <div className="px-8 pt-8 xl:px-10 xl:pt-10">
                        <span className="relative grid h-20 w-20 place-items-center rounded-3xl bg-cyan-hi/15 text-cyan-hi">
                          <Icon className="h-9 w-9" />
                          <span className="absolute inset-0 rounded-3xl border border-cyan-hi/30 animate-pulse-soft" />
                        </span>
                      </div>
                    );
                  })()}
                  <div className="flex flex-1 flex-col px-8 pb-8 pt-6 xl:px-10 xl:pb-10">
                    <div className="flex items-center gap-3">
                      {current.image &&
                        (() => {
                          const Icon = iconByName(current.iconName);
                          return (
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-hi/15 text-cyan-hi">
                              <Icon className="h-5 w-5" />
                            </span>
                          );
                        })()}
                      <div className="micro-label !text-royal">{current.number} · Field crew</div>
                    </div>
                    <h3 className="display-xl mt-2 text-3xl xl:text-4xl">{current.name}</h3>
                    <p className="mt-3 text-sm text-ink/70">{current.tagline}</p>
                    <p className="mt-3 flex-1 text-sm text-ink/60 line-clamp-3">
                      {current.description}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <LiquidButton to={`/services/${current.slug}`}>Explore</LiquidButton>
                      {countFor(current.slug) > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-leaf/25 bg-leaf/10 px-3 py-1.5 text-[11px] uppercase tracking-widest text-leaf">
                          <Wrench className="h-3 w-3" /> {countFor(current.slug)} service lines
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>

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
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{ background: `color-mix(in oklab, ${hue} 16%, transparent)`, color: hue }}
                >
                  <Icon className="h-5 w-5" />
                </span>
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
                <span className="inline-flex items-center gap-1.5 rounded-full border border-leaf/25 bg-leaf/10 px-3 py-1.5 text-[11px] uppercase tracking-widest text-leaf">
                  <Wrench className="h-3 w-3" /> {count} service lines
                </span>
              )}
            </span>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
