// Shared building blocks for the product & service detail pages — one visual
// system for media, pricing, sharing, clamped copy and cross-sell rails.
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowUpRight, Share2 } from "lucide-react";
import { MicroLabel } from "@/components/site/GhostWord";

/* ------------------------------------------------------------------ panel */

export function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"rounded-3xl glass-dark p-6 " + className}>
      <div className="micro-label mb-3">{title}</div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ price */

export function PriceChip({ price }: { price: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-leaf/30 bg-leaf/15 px-4 py-2 text-sm font-semibold text-leaf">
      {price}
    </span>
  );
}

/* ------------------------------------------------------------------ share */

// Shares the record WITH its photo where the platform allows it (Web Share
// Level 2 file sharing), falls back to a plain link share, then to copying
// the URL. The photo fetch is best-effort — a CORS refusal or slow network
// silently degrades to the link share.
export function ShareButton({ name, image }: { name: string; image?: string | null }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = typeof location !== "undefined" ? location.href : "";
    const title = `${name} — LK Chemicals`;
    try {
      if (navigator.share) {
        if (image && typeof navigator.canShare === "function") {
          try {
            const res = await fetch(image, { mode: "cors", signal: AbortSignal.timeout(1800) });
            if (res.ok) {
              const blob = await res.blob();
              const ext = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
              const file = new File([blob], `${name.replace(/[^\w-]+/g, "-")}.${ext}`, {
                type: blob.type || "image/jpeg",
              });
              if (navigator.canShare({ files: [file] })) {
                await navigator.share({ title, text: `${title}\n${url}`, url, files: [file] });
                return;
              }
            }
          } catch {
            // Photo unavailable — fall through to the plain link share.
          }
        }
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Visitor cancelled the share sheet — nothing to do.
    }
  };
  return (
    <button
      type="button"
      onClick={share}
      aria-label={`Share ${name}`}
      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs text-white/80 transition-colors hover:border-cyan-hi hover:text-white"
    >
      <Share2 className="h-3.5 w-3.5" /> {copied ? "Link copied!" : "Share"}
    </button>
  );
}

/* --------------------------------------------------------- clamped copy */

// Long copy buries the record on phones — clamp it behind a read-more there,
// show it in full on desktop.
export function ClampedText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 180;
  return (
    <div>
      <p
        className={
          "text-base lg:text-lg text-white/70 " +
          (!open && long ? "line-clamp-3 lg:line-clamp-none" : "")
        }
      >
        {text}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden mt-1.5 text-sm font-medium text-cyan-hi"
        >
          {open ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ image stage */

// Directional cinematic transition: the incoming photo slides and folds in
// from the side you're heading toward, the outgoing one falls away.
const stageVariants: Variants = {
  enter: (d: number) => ({ x: d * 72, opacity: 0, scale: 1.05, rotateY: d * 10 }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: { type: "spring", stiffness: 220, damping: 27 },
  },
  exit: (d: number) => ({
    x: d * -72,
    opacity: 0,
    scale: 0.97,
    rotateY: d * -8,
    transition: { duration: 0.28, ease: "easeIn" },
  }),
};

// Animated media gallery — crossfading Ken-Burns stage with swipe support on
// touch devices, hover tilt on desktop, and a polite auto-play that stops the
// moment the visitor takes over. Falls back to the category photo (plus an
// optional overlay) or a brand gradient when a record has no images.
export function MediaGallery({
  images,
  name,
  fallbackImage,
  fallbackOverlay,
}: {
  images: string[];
  name: string;
  fallbackImage?: string | null;
  fallbackOverlay?: string;
}) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const lastUser = useRef(0);
  const many = images.length > 1;

  const go = (i: number, user = false) => {
    if (user) lastUser.current = Date.now();
    const next = ((i % images.length) + images.length) % images.length;
    setDir(next > active || (active === images.length - 1 && next === 0) ? 1 : -1);
    setActive(next);
  };

  // Auto-advance keeps the stage alive on phones (no hover there), but never
  // fights the user: any touch/click pauses it for a while.
  useEffect(() => {
    if (reduced || !many) return;
    const id = setInterval(() => {
      if (document.hidden || Date.now() - lastUser.current < 9000) return;
      setDir(1);
      setActive((a) => (a + 1) % images.length);
    }, 5000);
    return () => clearInterval(id);
  }, [images.length, many, reduced]);

  const src = images[active] ?? images[0] ?? null;

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        whileHover={reduced ? undefined : { rotateY: 6, rotateX: -4, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 150, damping: 16 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative h-72 rounded-3xl overflow-hidden glass-dark"
      >
        <AnimatePresence initial={false} custom={dir}>
          {src ? (
            <motion.div
              key={src + active}
              custom={dir}
              variants={reduced ? undefined : stageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag={many ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDragStart={() => (lastUser.current = Date.now())}
              onDragEnd={(_, info) => {
                lastUser.current = Date.now();
                if (info.offset.x < -56 || info.velocity.x < -420) go(active + 1, true);
                else if (info.offset.x > 56 || info.velocity.x > 420) go(active - 1, true);
              }}
              className={"absolute inset-0 " + (many ? "cursor-grab active:cursor-grabbing" : "")}
            >
              <motion.img
                src={src}
                alt={name}
                draggable={false}
                animate={reduced ? undefined : { scale: [1, 1.07] }}
                transition={
                  reduced
                    ? undefined
                    : { duration: 9, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                }
                className="h-full w-full object-cover"
              />
            </motion.div>
          ) : (
            <div key="fallback" className="absolute inset-0">
              {fallbackImage ? (
                <img src={fallbackImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-royal/40 via-ink to-ink" />
              )}
              {fallbackOverlay && (
                <img
                  src={fallbackOverlay}
                  alt={name}
                  className="absolute inset-0 h-full w-full object-contain p-8 mix-blend-screen"
                />
              )}
            </div>
          )}
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
        {many && (
          <div className="pointer-events-none absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={
                  "h-1.5 rounded-full transition-all duration-300 " +
                  (i === active ? "w-6 bg-cyan-hi" : "w-1.5 bg-white/40")
                }
              />
            ))}
          </div>
        )}
      </motion.div>
      {many && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((s, i) => (
            <motion.button
              key={s + i}
              type="button"
              onClick={() => go(i, true)}
              aria-label={`View image ${i + 1}`}
              whileTap={{ scale: 0.92 }}
              animate={{ scale: i === active ? 1.06 : 1 }}
              className={
                "h-16 w-16 shrink-0 overflow-hidden rounded-xl border transition-all " +
                (i === active ? "border-cyan-hi" : "border-white/10 opacity-70 hover:opacity-100")
              }
            >
              <img src={s} alt="" className="h-full w-full object-cover" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------- suggestion rail */

type SuggestLink = {
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string>;
};

export type SuggestItem = {
  key: string;
  name: string;
  image?: string | null;
  /** small eyebrow shown on the photo (usually the category) */
  label?: string;
  price?: string;
  link: SuggestLink;
};

function SuggestCard({ item, index }: { item: SuggestItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ delay: (index % 4) * 0.06, duration: 0.5 }}
      className="h-full"
    >
      <Link
        to={item.link.to as never}
        params={item.link.params as never}
        search={item.link.search as never}
        className="group flex h-full flex-col rounded-3xl overflow-hidden bg-white/[0.04] border border-white/10 hover-lift"
      >
        <div className="relative h-40 sm:h-44 overflow-hidden shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-royal/40 via-ink to-ink" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          {item.label && <div className="absolute bottom-3 left-4 micro-label">{item.label}</div>}
          {item.price && (
            <span className="absolute top-3 right-3 rounded-full border border-leaf/30 bg-black/45 px-3 py-1 text-xs font-semibold text-leaf backdrop-blur">
              {item.price}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="display-xl text-lg text-white line-clamp-2 group-hover:grad-text transition-all">
            {item.name}
          </h3>
          <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-cyan-hi">
            View details
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// "You may also like" — e-commerce cross-sell band. A swipeable snap rail on
// phones (peeking next card invites the thumb), a quiet 4-up grid on desktop.
export function SuggestRail({
  eyebrow,
  heading,
  items,
  viewAll,
}: {
  eyebrow: string;
  heading: string;
  items: SuggestItem[];
  viewAll?: { label: string } & SuggestLink;
}) {
  if (items.length === 0) return null;
  return (
    <section className="section-dark py-16 border-t border-white/10 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <MicroLabel>{eyebrow}</MicroLabel>
            <h2
              className="display-xl mt-3 grad-text"
              style={{ fontSize: "clamp(1.7rem, 4.5vw, 2.75rem)" }}
            >
              {heading}
            </h2>
          </div>
          {viewAll && (
            <Link
              to={viewAll.to as never}
              params={viewAll.params as never}
              search={viewAll.search as never}
              className="group inline-flex min-h-11 items-center gap-1.5 text-sm text-cyan-hi hover:text-white transition-colors"
            >
              {viewAll.label}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
        </div>
        <div className="mt-8 -mx-6 px-6 flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((it, i) => (
            <div
              key={it.key}
              className="w-[68vw] max-w-[300px] sm:w-[44vw] shrink-0 snap-start md:w-auto md:max-w-none"
            >
              <SuggestCard item={it} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
