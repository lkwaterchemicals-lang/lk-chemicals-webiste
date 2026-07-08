import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useServiceCategories, useServices } from "@/lib/content";
import { iconByName } from "@/lib/icons";
import { MicroLabel } from "@/components/site/GhostWord";

export const Route = createFileRoute("/services_/$category")({
  head: () => ({
    meta: [{ title: "Services — LK Chemicals" }],
  }),
  component: ServiceCategoryPage,
});

function ServiceCategoryPage() {
  const { category } = Route.useParams();
  const { data: categories, isFetching: catsFetching } = useServiceCategories();
  const { data: services } = useServices();

  const cat = categories.find((c) => c.slug === category);
  const list = services.filter((s) => s.serviceCategory === category);

  if (!cat) {
    // Firestore may still be loading; only show "not found" once settled.
    if (catsFetching) return <div className="min-h-[60vh] pt-40" />;
    return (
      <div className="min-h-[60vh] pt-40 text-center px-6">
        <MicroLabel>404</MicroLabel>
        <h1 className="display-xl text-5xl mt-4 grad-text">Category not found.</h1>
        <Link to="/services" className="mt-6 inline-block text-cyan-hi">
          Back to services →
        </Link>
      </div>
    );
  }

  const Icon = iconByName(cat.iconName);
  const cover = cat.banner || cat.image;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "Services", item: "/services" },
      { "@type": "ListItem", position: 3, name: cat.name, item: `/services/${cat.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Hero */}
      <section className="section-dark relative pt-40 pb-16 overflow-hidden">
        {cover ? (
          <>
            <img
              src={cover}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40 hero-lighten"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink hero-lighten-overlay" />
          </>
        ) : (
          <div className="absolute inset-0 caustics opacity-40" />
        )}
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> All services
          </Link>
          <div className="mt-6 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-hi/15 text-cyan-hi">
              <Icon className="h-5 w-5" />
            </span>
            <MicroLabel>{cat.number} · Service category</MicroLabel>
          </div>
          <h1
            className="display-xl mt-4 grad-text"
            style={{ fontSize: "clamp(2.5rem, 9vw, 6rem)" }}
          >
            {cat.name}
          </h1>
          {cat.description && (
            <p className="mt-6 max-w-2xl text-lg text-white/70">{cat.description}</p>
          )}
        </div>
      </section>

      {/* Services grid */}
      <section className="section-dark py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="01">
            {list.length} {list.length === 1 ? "service" : "services"}
          </MicroLabel>

          <AnimatePresence mode="popLayout">
            {list.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-10 rounded-3xl glass-dark p-10 text-center"
              >
                <h2 className="display-xl text-2xl text-white">No services here yet.</h2>
                <p className="mt-2 text-white/60">
                  Services in this category appear here as soon as they're published.
                </p>
              </motion.div>
            ) : (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((s, i) => (
                  <motion.div
                    key={s.slug}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i % 9) * 0.03 }}
                  >
                    <Link
                      to="/services/$category/$service"
                      params={{ category: cat.slug, service: s.slug }}
                      className="group block rounded-3xl overflow-hidden bg-white/[0.04] border border-white/10 hover-lift h-full"
                    >
                      <div className="relative h-44 sm:h-48 overflow-hidden">
                        <img
                          src={s.image || cat.image}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                        <div className="absolute bottom-3 left-4 micro-label">{cat.name}</div>
                        <div className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/10 backdrop-blur text-white transition-transform group-hover:rotate-45">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="display-xl text-xl text-white group-hover:grad-text transition-all">
                          {s.name}
                        </h3>
                        <p className="mt-2 text-sm text-white/60 line-clamp-3">{s.description}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
