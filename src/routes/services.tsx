import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUpRight, Wrench } from "lucide-react";
import { MicroLabel, GhostWord } from "@/components/site/GhostWord";
import { RequestCallButton } from "@/components/site/RequestCall";
import { useServiceCategories, useServices } from "@/lib/content";
import { useServicesContent } from "@/lib/pages";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — LK Chemicals" },
      {
        name: "description",
        content:
          "Industrial water treatment services — RO plant servicing, boiler, chiller, condenser, heat exchanger, moulds, AHU and pipeline descaling, softener and DM plant service, resin cleaning, ETP & STP services, HVAC AMCs and consultation.",
      },
      { property: "og:title", content: "Field Operations — LK Chemicals" },
      { property: "og:description", content: "We don't just supply. We service." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: categories } = useServiceCategories();
  const { data: services } = useServices();
  const { data: c } = useServicesContent();

  const countFor = (slug: string) => services.filter((s) => s.serviceCategory === slug).length;
  const hasCatalog = categories.length > 0;

  return (
    <>
      {/* Hero */}
      <section className="section-dark relative pt-40 pb-16 overflow-hidden">
        <div className="absolute inset-0 caustics opacity-40" />
        <GhostWord className="absolute right-0 bottom-0 !text-[11vw] opacity-60">SERVICE</GhostWord>
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="00">Field operations</MicroLabel>
          <h1
            className="display-xl mt-4 grad-text"
            style={{ fontSize: "clamp(2.75rem, 11vw, 8rem)" }}
          >
            {c.heroTitleTop}
            <br />
            <span className="grad-leaf-text">{c.heroTitleBottom}</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-white/70">
            {services.length > 0
              ? `${services.length} service lines across ${categories.length} ${
                  categories.length === 1 ? "category" : "categories"
                }, backed by our own chemistry, our own crew and our own vehicles.`
              : "Our field operations, backed by our own chemistry, crew and vehicles."}
          </p>
          <div className="mt-8">
            <RequestCallButton source="services-page" />
          </div>
        </div>
      </section>

      {/* Service categories */}
      <section className="section-dark py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="01">Browse by category</MicroLabel>

          {!hasCatalog && (
            <div className="mt-10 rounded-3xl glass-dark p-10 text-center">
              <h2 className="display-xl text-2xl text-white">Services are being set up.</h2>
              <p className="mt-2 text-white/60">
                Service categories appear here as soon as they're published from the dashboard.
              </p>
            </div>
          )}

          {hasCatalog && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-8%" }}
                  transition={{ delay: (i % 3) * 0.07, duration: 0.55 }}
                >
                  <Link
                    to="/services/$category"
                    params={{ category: cat.slug }}
                    className="group relative block text-left rounded-3xl overflow-hidden hover-lift min-h-[230px] flex flex-col justify-end p-6"
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-royal/40 via-ink to-ink" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
                    <div className="absolute top-5 left-6 display-xl text-4xl text-on-media opacity-60">
                      {cat.number}
                    </div>
                    <div className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-full bg-white/10 backdrop-blur text-on-media transition-transform group-hover:rotate-45">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                    <h2 className="relative display-xl text-2xl sm:text-3xl text-on-media">
                      {cat.name}
                    </h2>
                    <p className="relative mt-1.5 text-sm text-on-media-soft line-clamp-2">
                      {cat.tagline}
                    </p>
                    <span className="relative mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-cyan-hi/20 border border-cyan-hi/30 px-3 py-1 text-[11px] tracking-widest uppercase text-on-media">
                      <Wrench className="h-3 w-3" />
                      {countFor(cat.slug)} services
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Service process */}
      <section className="section-light py-28 relative overflow-hidden">
        <GhostWord className="absolute top-0 right-0 !text-[12vw] opacity-50">PROCESS</GhostWord>
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel className="!text-royal">Service process</MicroLabel>
          <h2 className="display-xl mt-3" style={{ fontSize: "clamp(2.25rem, 8vw, 5rem)" }}>
            {c.processHeading}
          </h2>
          <div className="mt-14 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {c.processSteps.map((step, i) => (
              <div
                key={step.title}
                className="group relative overflow-hidden rounded-2xl bg-white border border-ink/10 p-5 hover-lift"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-royal via-cyan-hi to-leaf opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="micro-label !text-royal">{String(i + 1).padStart(2, "0")}</div>
                <div className="display-xl text-xl mt-2 text-ink">{step.title}</div>
                <p className="mt-2 text-xs text-ink/60 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
