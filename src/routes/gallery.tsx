import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { MicroLabel } from "@/components/site/GhostWord";
import { useGalleryItems } from "@/lib/content";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Inside LK Chemicals" },
      { name: "description", content: "Inside our Cherlapally manufacturing plant, laboratory, product range and field service operations." },
      { property: "og:title", content: "Inside LK Chemicals" },
      { property: "og:description", content: "A look at the plant, lab, products and field services." },
    ],
  }),
  component: GalleryPage,
});

const tabs = ["All", "Factory", "Laboratory", "Products", "Services", "Team"];

function GalleryPage() {
  const { data: items } = useGalleryItems();
  const [tab, setTab] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const filtered = useMemo(() => (tab === "All" ? items : items.filter((i) => i.cat === tab)), [tab, items]);
  return (
    <>
      <section className="section-dark pt-40 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 caustics opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="00">Gallery</MicroLabel>
          <h1 className="display-xl mt-4 text-6xl md:text-9xl grad-text">Inside LK.</h1>
          <div className="mt-10 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={
                  "text-xs uppercase tracking-widest px-4 py-2 rounded-full border transition-all " +
                  (tab === t ? "bg-cyan-hi text-ink border-cyan-hi" : "border-white/15 text-white/70 hover:border-cyan-hi")
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
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-4">
            {filtered.map((it, idx) => (
              <motion.button
                layout
                key={idx + it.src}
                onClick={() => setOpen(idx)}
                className={
                  "relative overflow-hidden rounded-3xl group hover-lift " +
                  (it.wide ? "md:col-span-2 " : "") +
                  (it.tall ? "row-span-2 " : "")
                }
                whileHover={{ scale: 1.01 }}
              >
                <img src={it.src} alt={it.alt} className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-4 micro-label text-cyan-hi">{it.cat}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink-2/95 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setOpen(null)}
          >
            <button aria-label="Close" className="absolute top-6 right-6 grid h-11 w-11 place-items-center rounded-full glass text-white">
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              src={filtered[open].src}
              alt={filtered[open].alt}
              className="max-h-[80vh] max-w-full rounded-3xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}