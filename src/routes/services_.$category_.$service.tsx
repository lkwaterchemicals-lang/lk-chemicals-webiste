import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Check, ChevronDown, Download, Phone } from "lucide-react";
import { useServiceCategories, useServices, useSiteSettings } from "@/lib/content";
import { type Service } from "@/data/products";
import { MicroLabel } from "@/components/site/GhostWord";
import { LiquidButton } from "@/components/site/LiquidButton";
import { WhatsAppButton } from "@/components/site/WhatsApp";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { waLink } from "@/components/site/WaCluster";

export const Route = createFileRoute("/services_/$category_/$service")({
  head: () => ({ meta: [{ title: "Service — LK Chemicals" }] }),
  component: ServiceDetail,
});

function ServiceNotFound() {
  return (
    <div className="min-h-[60vh] pt-40 text-center px-6">
      <MicroLabel>404</MicroLabel>
      <h1 className="display-xl text-5xl mt-4 grad-text">Service not found.</h1>
      <Link to="/services" className="mt-6 inline-block text-cyan-hi">
        Back to services →
      </Link>
    </div>
  );
}

function ServiceDetail() {
  const { category, service: serviceSlug } = Route.useParams();
  const { data: services, isFetching } = useServices();
  const { data: categories } = useServiceCategories();
  const { data: settings } = useSiteSettings();
  const [activeImg, setActiveImg] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Phones swap the floating contact cluster for the fixed action dock while
  // this page is open — see body[data-dock] in styles.css.
  useEffect(() => {
    document.body.dataset.dock = "1";
    return () => {
      delete document.body.dataset.dock;
    };
  }, []);

  const service: Service | null = services.find((s) => s.slug === serviceSlug) ?? null;
  if (!service) {
    return isFetching ? <div className="min-h-[60vh] pt-40" /> : <ServiceNotFound />;
  }

  const cat = categories.find((c) => c.slug === service.serviceCategory);
  const catSlug = service.serviceCategory || category;
  const catName = cat?.name ?? catSlug;

  // Everything below is optional and admin-managed — guard every array.
  const highlights = service.highlights ?? [];
  const process = service.process ?? [];
  const faqs = service.faqs ?? [];
  const documents = service.documents ?? [];
  const images = [service.image, ...(service.gallery ?? [])].filter(Boolean) as string[];
  const mainImg = images[activeImg] ?? images[0] ?? cat?.image ?? null;

  // Related: explicit picks first, otherwise same-category siblings.
  const relatedSlugs = service.related ?? [];
  const related = (
    relatedSlugs.length
      ? (relatedSlugs.map((s) => services.find((x) => x.slug === s)).filter(Boolean) as Service[])
      : services.filter(
          (s) => s.serviceCategory === service.serviceCategory && s.slug !== service.slug,
        )
  ).slice(0, 4);

  const msg = `Hi LK Chemicals, I'd like a service quote for ${service.name}.`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "Services", item: "/services" },
      { "@type": "ListItem", position: 3, name: catName, item: `/services/${catSlug}` },
      {
        "@type": "ListItem",
        position: 4,
        name: service.name,
        item: `/services/${catSlug}/${service.slug}`,
      },
    ],
  };
  const faqLd = faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      <section className="section-dark relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 caustics opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <Link
            to="/services/$category"
            params={{ category: catSlug }}
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to {catName}
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="micro-label">{catName}</span>
          </div>
          <h1 className="display-xl mt-4 text-5xl md:text-7xl grad-text max-w-4xl">
            {service.name}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70">{service.description}</p>

          <div className="mt-14 grid lg:grid-cols-5 gap-10 items-start">
            {/* Media */}
            <div className="lg:col-span-2">
              <motion.div
                whileHover={{ rotateY: 8, rotateX: -6, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative rounded-3xl overflow-hidden glass-dark"
              >
                {mainImg ? (
                  <img src={mainImg} alt={service.name} className="h-72 w-full object-cover" />
                ) : (
                  <div className="h-72 w-full bg-gradient-to-br from-royal/40 via-ink to-ink" />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
              </motion.div>
              {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {images.map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      aria-label={`View image ${i + 1}`}
                      className={
                        "h-16 w-16 shrink-0 overflow-hidden rounded-xl border transition-all " +
                        (i === activeImg
                          ? "border-cyan-hi"
                          : "border-white/10 opacity-70 hover:opacity-100")
                      }
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Panels */}
            <div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
              {highlights.length > 0 && (
                <Panel title="What's included" className="md:col-span-2">
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {highlights.map((h) => (
                      <li key={h} className="flex gap-2 text-white/80 text-sm">
                        <Check className="h-4 w-4 text-leaf shrink-0 mt-0.5" /> {h}
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}

              {process.length > 0 && (
                <Panel title="How it works" className="md:col-span-2">
                  <ol className="space-y-4">
                    {process.map((step, i) => (
                      <li key={(step.title ?? "") + i} className="flex gap-4">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cyan-hi/15 text-cyan-hi text-sm font-bold tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <div className="display-xl text-lg text-white">{step.title}</div>
                          {step.body && <p className="mt-1 text-sm text-white/60">{step.body}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </Panel>
              )}

              {documents.length > 0 && (
                <Panel title="Downloads" className="md:col-span-2">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {documents.map((d, i) => (
                      <a
                        key={d.url + i}
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/10 p-3 hover:border-cyan-hi transition-colors"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-hi/15 text-cyan-hi shrink-0">
                          <Download className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-white/90">{d.label}</span>
                          {d.type && <span className="text-[11px] text-white/50">{d.type}</span>}
                        </span>
                      </a>
                    ))}
                  </div>
                </Panel>
              )}
            </div>
          </div>

          {/* FAQs */}
          {faqs.length > 0 && (
            <div className="mt-12 max-w-3xl">
              <MicroLabel>Frequently asked</MicroLabel>
              <div className="mt-5 divide-y divide-white/10 rounded-3xl glass-dark px-5">
                {faqs.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={(f.q ?? "") + i} className="py-4">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="flex w-full items-center justify-between gap-4 text-left"
                      >
                        <span className="text-white font-medium">{f.q}</span>
                        <ChevronDown
                          className={
                            "h-4 w-4 shrink-0 text-cyan-hi transition-transform " +
                            (open ? "rotate-180" : "")
                          }
                        />
                      </button>
                      {open && f.a && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3 text-sm text-white/70 overflow-hidden"
                        >
                          {f.a}
                        </motion.p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action dock — fixed to the screen bottom on phones, floating
              pill inside the section on desktop. */}
          <div className="mt-10 sticky bottom-4 z-20 max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-[60] max-lg:mt-0 max-lg:px-3 max-lg:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="glass-dark rounded-full px-4 py-3 flex flex-wrap items-center justify-between gap-3 max-lg:rounded-2xl max-lg:px-3 max-lg:py-2.5">
              <div className="hidden lg:block text-white/80 text-sm px-2">
                <span className="micro-label">Enquire · {service.name}</span>
              </div>
              <div className="flex gap-2 max-lg:w-full">
                <WhatsAppButton href={waLink(msg)} className="max-lg:flex-1 justify-center !px-4">
                  WhatsApp
                </WhatsAppButton>
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                  className="max-lg:flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm text-white/85 transition-colors hover:border-cyan-hi hover:text-white"
                >
                  <Phone className="h-4 w-4" /> Call
                </a>
                <a
                  href="#enquire"
                  className="max-lg:flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-cyan-hi px-5 py-3 text-sm font-semibold text-ink shadow-[0_10px_30px_-10px_var(--cyan-hi)] transition-all hover:brightness-110"
                >
                  Enquiry
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="enquire" className="section-dark py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8 grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <MicroLabel>Send enquiry</MicroLabel>
            <h2 className="display-xl text-4xl md:text-5xl grad-text mt-3">Book {service.name}.</h2>
            <p className="mt-3 text-white/60">
              Tell us your site, equipment and timeline — we'll come back with a specific scope and
              quote.
            </p>
          </div>
          <div className="lg:col-span-3">
            <EnquiryForm source={`service:${service.slug}`} productRef={service.name} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-dark py-16 border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <MicroLabel>More in {catName}</MicroLabel>
            <div className="mt-6 grid md:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to="/services/$category/$service"
                  params={{ category: r.serviceCategory || catSlug, service: r.slug }}
                  className="group rounded-2xl bg-white/[0.04] border border-white/10 p-5 hover-lift"
                >
                  <div className="micro-label">{catName}</div>
                  <h3 className="display-xl text-lg text-white mt-2 group-hover:grad-text">
                    {r.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Panel({
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
