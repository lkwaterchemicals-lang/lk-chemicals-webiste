import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Droplets, Play, X } from "lucide-react";
import { MicroLabel } from "@/components/site/GhostWord";
import { LiquidButton } from "@/components/site/LiquidButton";
import { useGalleryItems } from "@/lib/content";
import { useGalleryContent } from "@/lib/pages";
import { cleanCaption } from "@/lib/assets";
import { videoInfo, youTubeEmbed } from "@/lib/media";

// Uploads often arrive named "ChatGPT Image Jul 8 2026…" or "IMG_2041" —
// never surface raw file names; fall back to the item's category.
const captionOf = (it: { alt?: string; cat?: string }) =>
  cleanCaption(it.alt, it.cat ? `${it.cat} · LK Chemicals` : "LK Chemicals");

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Inside LK Chemicals" },
      {
        name: "description",
        content:
          "Inside our Cherlapally manufacturing plant, laboratory, product range and field service operations.",
      },
      { property: "og:title", content: "Inside LK Chemicals" },
      {
        property: "og:description",
        content: "A look at the plant, lab, products and field services.",
      },
    ],
  }),
  component: GalleryPage,
});

const tabs = ["All", "Factory", "Laboratory", "Products", "Services", "Team"];

function GalleryPage() {
  const { data: items } = useGalleryItems();
  const { data: c } = useGalleryContent();
  const [tab, setTab] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const filtered = useMemo(
    () => (tab === "All" ? items : items.filter((i) => i.cat === tab)),
    [tab, items],
  );
  return (
    <>
      <section className="section-dark pt-40 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 caustics opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="00">Gallery</MicroLabel>
          <h1 className="display-xl mt-4 text-6xl md:text-9xl grad-text">{c.heroHeading}</h1>
          {/* Filter chips: one scrollable row on phones; quiet glass tiles so
              they read as filters, not a wall of buttons. */}
          <div className="mt-10 -mx-6 px-6 md:mx-0 md:px-0 flex gap-2 overflow-x-auto md:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={
                  "shrink-0 text-[11px] uppercase tracking-widest px-4 py-2 rounded-full transition-all " +
                  (tab === t
                    ? "bg-cyan-hi text-ink shadow-[0_8px_24px_-10px_var(--cyan-hi)]"
                    : "bento-tile text-foreground opacity-70 hover:opacity-100")
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-dark pb-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          {/* Masonry columns: every photo keeps its own aspect ratio instead
              of being cropped into uniform grid cells. */}
          <div className="columns-2 md:columns-3 xl:columns-4 gap-4">
            {filtered.map((it, idx) => (
              <motion.button
                key={idx + it.src}
                onClick={() => setOpen(idx)}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-6%" }}
                transition={{ duration: 0.5, delay: (idx % 4) * 0.05 }}
                className="relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-3xl group hover-lift"
                whileHover={{ scale: 1.01 }}
              >
                <img
                  src={it.src}
                  alt={captionOf(it)}
                  loading="lazy"
                  className="w-full h-auto group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {videoInfo(it.video) && (
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                      <Play className="h-6 w-6 fill-current translate-x-0.5" />
                    </span>
                  </span>
                )}
                <div className="absolute bottom-3 left-4 micro-label text-cyan-hi">{it.cat}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <LifeAtLK />

      <AnimatePresence>
        {open !== null && filtered[open] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink-2/95 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setOpen(null)}
          >
            <button
              aria-label="Close"
              className="absolute top-6 right-6 z-10 grid h-11 w-11 place-items-center rounded-full glass text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Prev / next — buttons on desktop, swipe on touch */}
            {filtered.length > 1 && (
              <>
                <button
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((open + filtered.length - 1) % filtered.length);
                  }}
                  className="hidden sm:grid absolute left-5 top-1/2 -translate-y-1/2 z-10 h-11 w-11 place-items-center rounded-full glass text-white hover:text-cyan-hi"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((open + 1) % filtered.length);
                  }}
                  className="hidden sm:grid absolute right-5 top-1/2 -translate-y-1/2 z-10 h-11 w-11 place-items-center rounded-full glass text-white hover:text-cyan-hi"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {(() => {
              const video = videoInfo(filtered[open].video);
              if (video) {
                return (
                  <motion.div
                    key={filtered[open].src + "-video"}
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
                    className="w-full max-w-4xl overflow-hidden rounded-3xl shadow-2xl bg-black"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative aspect-video">
                      {video.kind === "youtube" ? (
                        <iframe
                          title={captionOf(filtered[open])}
                          src={youTubeEmbed(video.id, true)}
                          className="absolute inset-0 h-full w-full"
                          style={{ border: 0 }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={video.url}
                          poster={filtered[open].src}
                          className="absolute inset-0 h-full w-full object-contain"
                          controls
                          autoPlay
                          playsInline
                        />
                      )}
                    </div>
                  </motion.div>
                );
              }
              return (
                <motion.img
                  key={filtered[open].src}
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
                  src={filtered[open].src}
                  alt={captionOf(filtered[open])}
                  drag={filtered.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -56 || info.velocity.x < -420)
                      setOpen((open + 1) % filtered.length);
                    else if (info.offset.x > 56 || info.velocity.x > 420)
                      setOpen((open + filtered.length - 1) % filtered.length);
                  }}
                  className="max-h-[76vh] max-w-full rounded-3xl object-contain shadow-2xl cursor-grab active:cursor-grabbing"
                  onClick={(e) => e.stopPropagation()}
                />
              );
            })()}

            {/* Caption + counter */}
            <div
              className="absolute bottom-6 inset-x-0 px-6 flex items-center justify-center gap-3 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="glass rounded-full px-4 py-2 text-xs text-white/85 max-w-[70vw] truncate">
                {captionOf(filtered[open])}
              </span>
              {filtered.length > 1 && (
                <span className="glass rounded-full px-3 py-2 text-[11px] tabular-nums text-white/70">
                  {open + 1} / {filtered.length}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* =============== LIFE AT LK — diamond mosaic =============== */

// Diamond lattice slots (col, row) on a 13%-step grid; each diamond's bounding
// box is 26% of the container, so neighbours kiss edge-to-edge. One slot is
// reserved for the brand diamond; a circular motto badge floats over the
// cluster's heart.
const MOSAIC_SLOTS: [number, number][] = [
  [2, 0],
  [1, 1],
  [3, 1],
  [5, 1],
  [0, 2],
  [4, 2],
  [1, 3],
  [3, 3],
  [5, 3],
  [2, 4],
  [4, 4],
];

function LifeAtLK() {
  const { data: items } = useGalleryItems();
  // A spread of photos across categories reads livelier than one album.
  const photos = useMemo(() => {
    const srcs = [...new Set(items.map((i) => i.src))];
    return MOSAIC_SLOTS.map((_, k) => srcs[k % Math.max(1, srcs.length)]);
  }, [items]);
  if (photos.length === 0 || !photos[0]) return null;

  return (
    <section className="section-light relative overflow-hidden py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8 grid gap-14 lg:grid-cols-12 items-center">
        {/* Copy */}
        <div className="lg:col-span-5">
          <MicroLabel n="02" className="!text-royal">
            Plant insights
          </MicroLabel>
          <h2
            className="display-xl mt-4 leading-[0.95]"
            style={{ fontSize: "clamp(2.4rem, 7vw, 4.5rem)" }}
          >
            Life at LK.
            <br />
            <span className="grad-leaf-text">Every drop counts.</span>
          </h2>
          <p className="mt-6 max-w-md text-ink/70">
            A working floor of chemists, engineers and field crews — batch tests at dawn, drums on
            the dock by noon, a service van already on the road. LK is more than a plant; it's where
            clean water begins.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LiquidButton to="/careers">Join the team</LiquidButton>
            <LiquidButton to="/contact" variant="ghost">
              Visit the plant
            </LiquidButton>
          </div>
        </div>

        {/* Mosaic */}
        <div className="lg:col-span-7">
          <div className="relative mx-auto w-full max-w-[560px] aspect-[91/79]">
            {/* Brand diamond */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="absolute"
              style={{ left: "52%", top: "0%", width: "26%" }}
            >
              <div className="mosaic-diamond mosaic-brand aspect-square">
                <div className="mosaic-inner grid place-items-center text-center">
                  <div>
                    <Droplets className="mx-auto h-6 w-6" aria-hidden />
                    <div className="mt-1.5 text-[10px] font-bold tracking-[0.22em]">
                      LK
                      <br />
                      CHEMICALS
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {MOSAIC_SLOTS.map(([c, r], k) => (
              <motion.div
                key={`${c}-${r}`}
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 22,
                  delay: (k % 6) * 0.06,
                }}
                className="absolute"
                style={{ left: `${c * 13}%`, top: `${r * 13}%`, width: "26%" }}
              >
                <div className="mosaic-diamond aspect-square group">
                  <img
                    src={photos[k]}
                    alt=""
                    loading="lazy"
                    className="mosaic-photo transition-transform duration-700 group-hover:scale-[1.55]"
                  />
                </div>
              </motion.div>
            ))}

            {/* Motto badge over the cluster's heart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.35 }}
              className="absolute z-10"
              style={{ left: "33.5%", top: "27%", width: "24%" }}
            >
              <div className="mosaic-badge aspect-square rounded-full grid place-items-center text-center">
                <div className="leading-tight">
                  <div className="text-[8px] font-semibold tracking-[0.3em]">TEST</div>
                  <div className="display-xl text-sm sm:text-base tracking-wide">BLEND</div>
                  <div className="text-[8px] font-semibold tracking-[0.3em]">DELIVER</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
