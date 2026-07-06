import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search } from "lucide-react";
import { useCategories, useProducts } from "@/lib/content";
import { MicroLabel } from "@/components/site/GhostWord";
import resinImg from "@/assets/resin.jpg";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — LK Chemicals Formulary" },
      { name: "description", content: "Full catalog of RO, boiler, cooling tower, descaling chemicals, ion exchange resins and process aids from LK Chemicals." },
      { property: "og:title", content: "The Formulary — LK Chemicals" },
      { property: "og:description", content: "Every product in the LK water treatment catalog." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (!q.trim()) return true;
      const s = (p.name + " " + p.description).toLowerCase();
      return s.includes(q.toLowerCase());
    });
  }, [q, cat, products]);
  return (
    <>
      {/* Hero */}
      <section className="section-dark relative pt-40 pb-16 overflow-hidden">
        <img src={resinImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 hero-lighten" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink hero-lighten-overlay" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="00">The Formulary</MicroLabel>
          <h1 className="display-xl mt-4 grad-text" style={{ fontSize: "clamp(2.75rem, 11vw, 8rem)" }}>Every drum. Every dose.</h1>
          <p className="mt-6 max-w-xl text-white/70">
            Thirty-plus formulations across five categories. Search or filter to find what fits your feed water.
          </p>
          <div className="mt-10 glass-dark rounded-full flex items-center px-5 py-3 max-w-xl">
            <Search className="h-4 w-4 text-cyan-hi" />
            <input
              className="ml-3 flex-1 bg-transparent outline-none text-white placeholder:text-white/40"
              placeholder="Search antiscalant, biocide, descaler…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <FilterChip active={cat === "all"} onClick={() => setCat("all")}>All ({products.length})</FilterChip>
            {categories.map((c) => (
              <FilterChip key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)}>
                {c.number} · {c.name}
              </FilterChip>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="section-dark py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 text-center">
                <div className="display-xl text-4xl grad-text">Nothing matches.</div>
                <p className="mt-2 text-white/60">Try clearing filters or searching a broader term.</p>
              </motion.div>
            ) : (
              <motion.div key="grid" layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p, i) => {
                  const c = categories.find((x) => x.slug === p.category) ??
                    { slug: p.category, number: "–", name: p.category, tagline: "", description: "", image: resinImg };
                  return (
                    <motion.div
                      key={p.slug}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (i % 9) * 0.03 }}
                    >
                      <Link
                        to="/products/$slug"
                        params={{ slug: p.slug }}
                        className="group block rounded-3xl overflow-hidden bg-white/[0.04] border border-white/10 hover-lift h-full"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-all duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                          <div className="absolute bottom-3 left-4 micro-label">{c.number} · {c.name}</div>
                        </div>
                        <div className="p-5">
                          <h3 className="display-xl text-xl text-white group-hover:grad-text transition-all">{p.name}</h3>
                          <p className="mt-2 text-sm text-white/60 line-clamp-3">{p.description}</p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "text-xs uppercase tracking-widest px-4 py-2 rounded-full border transition-all " +
        (active
          ? "bg-cyan-hi text-ink border-cyan-hi"
          : "border-white/15 text-white/70 hover:border-cyan-hi hover:text-white")
      }
    >
      {children}
    </button>
  );
}