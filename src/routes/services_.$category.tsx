import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowUpRight, Wrench } from "lucide-react";
import { useServiceCategories, useServices, useSiteSettings } from "@/lib/content";
import { type ServiceCategory } from "@/data/products";
import { fetchDocRest } from "@/lib/firestore-rest";
import { absUrl, useLiveMeta } from "@/lib/site";
import { iconByName } from "@/lib/icons";
import { MicroLabel } from "@/components/site/GhostWord";
import { RequestCallButton } from "@/components/site/RequestCall";
import { WhatsAppButton } from "@/components/site/WhatsApp";
import { waLink } from "@/components/site/WaCluster";

export const Route = createFileRoute("/services_/$category")({
  // Categories live only in Firestore — resolve on the server so crawlers get
  // the real title/description/photo in the SSR HTML.
  loader: async ({ params }) => {
    const category =
      typeof document === "undefined"
        ? ((await fetchDocRest("serviceCategories", params.category)) as ServiceCategory | null)
        : null;
    return { category, slug: params.category };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.category;
    if (!c) return { meta: [{ title: "Services — LK Chemicals" }] };
    const title = c.metaTitle || `${c.name} — LK Chemicals Services`;
    const description = (c.metaDescription || c.description || c.tagline || "").slice(0, 155);
    const image = absUrl(c.ogImage || c.banner || c.image || "/og-image.png");
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: absUrl(`/services/${loaderData.slug}`) },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: image },
      ],
    };
  },
  component: ServiceCategoryPage,
});

function ServiceCategoryPage() {
  const { category } = Route.useParams();
  const { category: ssrCat } = Route.useLoaderData();
  const { data: categories, isFetching: catsFetching } = useServiceCategories();
  const { data: services } = useServices();
  const { data: settings } = useSiteSettings();

  const cat = categories.find((c) => c.slug === category) ?? ssrCat ?? null;
  const list = services.filter((s) => s.serviceCategory === category);

  useLiveMeta(
    cat
      ? {
          title: cat.metaTitle || `${cat.name} — LK Chemicals Services`,
          description: (cat.metaDescription || cat.description || cat.tagline || "").slice(0, 155),
          image: cat.ogImage || cat.banner || cat.image || null,
          url: `/services/${cat.slug}`,
        }
      : null,
  );

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
  const msg = `Hi LK Chemicals, I'd like to know more about your ${cat.name}.`;

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

      {/* Hero — the photo is a FRAMED banner card and the copy lives on clean
          ground below it. The old full-bleed treatment put a paragraph of body
          text straight onto a busy work photo, which read as broken on phones. */}
      <section className="section-dark relative pt-28 lg:pt-36 pb-4 overflow-hidden">
        <div className="absolute inset-0 caustics opacity-25" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <Link
            to="/services"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> All services
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
            className="relative mt-5 overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]"
          >
            {cover ? (
              <img
                src={cover}
                alt=""
                className="h-[15rem] sm:h-[19rem] lg:h-[24rem] w-full object-cover"
              />
            ) : (
              <div className="h-[15rem] sm:h-[19rem] lg:h-[24rem] w-full bg-gradient-to-br from-royal/50 via-ink-2 to-ink" />
            )}
            {/* Legibility scrim + etched category number */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            <span
              aria-hidden
              className="display-xl absolute top-4 right-6 text-5xl sm:text-7xl text-on-media opacity-50"
            >
              {cat.number}
            </span>
            <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur text-on-media">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="micro-label !text-cyan-hi">{cat.number} · Service category</span>
              </div>
              <h1
                className="display-xl mt-3 text-on-media"
                style={{ fontSize: "clamp(2rem, 7vw, 4.5rem)" }}
              >
                {cat.name}
              </h1>
              {cat.tagline && (
                <p className="mt-2 max-w-2xl text-sm sm:text-base text-on-media-soft">
                  {cat.tagline}
                </p>
              )}
            </div>
          </motion.div>

          {/* Intro row — description on clean ground + a booking card */}
          <div className="mt-8 grid gap-6 lg:grid-cols-12 items-start">
            {cat.description && (
              <p className="lg:col-span-7 text-base lg:text-lg leading-relaxed text-white/70">
                {cat.description}
              </p>
            )}
            <div
              className={
                "glass-dark rounded-3xl p-6 " +
                (cat.description ? "lg:col-span-5" : "lg:col-span-6")
              }
            >
              <div className="micro-label">Book this crew</div>
              <p className="mt-2 text-sm text-white/70">
                Tell us your site and equipment — we'll scope the job and quote within a business
                day.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <RequestCallButton source={`service-category:${cat.slug}`} />
                <WhatsAppButton href={waLink(msg)}>WhatsApp</WhatsAppButton>
              </div>
              <p className="mt-3 text-[11px] text-white/40">{settings.hours}</p>
            </div>
          </div>
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
                      className="group flex flex-col rounded-3xl overflow-hidden bg-white/[0.04] border border-white/10 hover-lift h-full"
                    >
                      <div className="relative h-44 sm:h-48 overflow-hidden shrink-0">
                        <img
                          src={s.image || cat.image}
                          alt=""
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                        <div className="absolute bottom-3 left-4 micro-label">
                          {String(i + 1).padStart(2, "0")} · {cat.name}
                        </div>
                        <div className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/10 backdrop-blur text-on-media transition-transform group-hover:rotate-45">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="display-xl text-xl text-white group-hover:grad-text transition-all">
                          {s.name}
                        </h3>
                        <p className="mt-2 flex-1 text-sm text-white/60 line-clamp-3">
                          {s.description}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-cyan-hi">
                          <Wrench className="h-3.5 w-3.5" /> View service
                        </span>
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
