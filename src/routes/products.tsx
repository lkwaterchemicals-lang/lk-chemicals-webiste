import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowUpRight, LayoutGrid, Search } from "lucide-react";
import { useCategories, useProducts } from "@/lib/content";
import { MicroLabel } from "@/components/site/GhostWord";
import resinImg from "@/assets/resin.jpg";

type ProductsSearch = { cat?: string };

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): ProductsSearch => ({
    cat: typeof s.cat === "string" && s.cat ? s.cat : undefined,
  }),
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
  const { cat } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [q, setQ] = useState("");
  const gridRef = useRef<HTMLElement>(null);

  const activeCat = categories.find((c) => c.slug === cat);
  const browsing = !!cat || q.trim().length > 0;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (cat && cat !== "all" && p.category !== cat) return false;
      if (!q.trim()) return true;
      const s = (p.name + " " + p.description).toLowerCase();
      return s.includes(q.toLowerCase());
    });
  }, [q, cat, products]);

  const countFor = (slug: string) => products.filter((p) => p.category === slug).length;
  const openCat = (slug: string) => navigate({ search: { cat: slug }, resetScroll: false });
  const closeCat = () => navigate({ search: {}, resetScroll: false });

  // When a category opens, glide the catalog into view.
  useEffect(() => {
    if (cat) gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [cat]);

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
            {products.length}+ formulations across {categories.length} categories. Pick a category below, or search the whole catalog.
          </p>
          <div className="mt-10 glass-dark rounded-full flex items-center px-5 py-3 max-w-xl">
            <Search className="h-4 w-4 text-cyan-hi" />
            <input
              className="ml-3 flex-1 bg-transparent outline-none text-white placeholder:text-white/40 min-h-11"
              placeholder="Search antiscalant, biocide, descaler…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Category overview — the front door of the catalog */}
      {!browsing && (
        <section className="section-dark py-16">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <MicroLabel n="01">Browse by category</MicroLabel>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c, i) => (
                <motion.button
                  key={c.slug}
                  type="button"
                  onClick={() => openCat(c.slug)}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-8%" }}
                  transition={{ delay: (i % 3) * 0.07, duration: 0.55 }}
                  className="group relative text-left rounded-3xl overflow-hidden hover-lift min-h-[230px] flex flex-col justify-end p-6"
                >
                  <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
                  <div className="absolute top-5 left-6 display-xl text-4xl text-on-media opacity-60">{c.number}</div>
                  <div className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-full bg-white/10 backdrop-blur text-on-media transition-transform group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <h2 className="relative display-xl text-2xl sm:text-3xl text-on-media">{c.name}</h2>
                  <p className="relative mt-1.5 text-sm text-on-media-soft line-clamp-2">{c.tagline}</p>
                  <span className="relative mt-3 inline-flex w-fit items-center rounded-full bg-cyan-hi/20 border border-cyan-hi/30 px-3 py-1 text-[11px] tracking-widest uppercase text-on-media">
                    {countFor(c.slug)} products
                  </span>
                </motion.button>
              ))}
              {/* Everything at once */}
              <motion.button
                type="button"
                onClick={() => openCat("all")}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{ delay: 0.14, duration: 0.55 }}
                className="bento-tile group relative text-left rounded-3xl min-h-[230px] flex flex-col justify-end p-6 hover-lift"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-hi/15 text-cyan-hi">
                  <LayoutGrid className="h-5 w-5" />
                </span>
                <h2 className="display-xl text-2xl sm:text-3xl text-foreground mt-4">All products</h2>
                <p className="mt-1.5 text-sm text-ink/70">The complete formulary in one grid.</p>
                <span className="mt-3 inline-flex w-fit items-center rounded-full bg-cyan-hi/15 border border-cyan-hi/25 px-3 py-1 text-[11px] tracking-widest uppercase text-cyan-hi">
                  {products.length} products
                </span>
              </motion.button>
            </div>
          </div>
        </section>
      )}

      {/* Catalog grid — shown for a chosen category or an active search */}
      {browsing && (
        <section ref={gridRef} className="section-dark py-16 scroll-mt-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <button
              type="button"
              onClick={closeCat}
              className="inline-flex min-h-11 items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> All categories
            </button>

            {/* Quick category switcher */}
            <div className="mt-5 -mx-6 px-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <FilterChip active={cat === "all" || (!cat && !!q.trim())} onClick={() => openCat("all")}>
                All ({products.length})
              </FilterChip>
              {categories.map((c) => (
                <FilterChip key={c.slug} active={cat === c.slug} onClick={() => openCat(c.slug)}>
                  {c.number} · {c.name}
                </FilterChip>
              ))}
            </div>

            <h2 className="display-xl mt-8 grad-text" style={{ fontSize: "clamp(1.9rem, 5.5vw, 3.5rem)" }}>
              {q.trim()
                ? `Results for "${q.trim()}"`
                : activeCat ? activeCat.name : "All products"}
              <span className="ml-3 align-middle text-base font-normal tracking-normal text-white/50">
                {filtered.length} {filtered.length === 1 ? "product" : "products"}
              </span>
            </h2>
            {activeCat && !q.trim() && (
              <p className="mt-2 max-w-2xl text-white/60">{activeCat.description}</p>
            )}

            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 text-center">
                  <div className="display-xl text-4xl grad-text">Nothing matches.</div>
                  <p className="mt-2 text-white/60">Try clearing the search or picking another category.</p>
                </motion.div>
              ) : (
                <motion.div key={(cat ?? "") + q} layout className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                          <div className="relative h-44 sm:h-48 overflow-hidden">
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
      )}
    </>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "shrink-0 whitespace-nowrap text-xs uppercase tracking-widest px-4 py-2 rounded-full border transition-all " +
        (active
          ? "bg-cyan-hi text-ink border-cyan-hi"
          : "border-white/15 text-white/70 hover:border-cyan-hi hover:text-white")
      }
    >
      {children}
    </button>
  );
}
