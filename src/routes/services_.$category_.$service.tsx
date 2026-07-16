import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Check, ChevronDown, Download } from "lucide-react";
import { useCategories, useProducts, useServiceCategories, useServices } from "@/lib/content";
import { type Product, type Service } from "@/data/products";
import { fetchDocRest } from "@/lib/firestore-rest";
import { absUrl, useLiveMeta } from "@/lib/site";
import { MicroLabel } from "@/components/site/GhostWord";
import {
  ClampedText,
  MediaGallery,
  Panel,
  ShareButton,
  SuggestRail,
  type SuggestItem,
} from "@/components/site/Detail";
import { RequestCallButton } from "@/components/site/RequestCall";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { ContactDock } from "@/components/site/ContactDock";

export const Route = createFileRoute("/services_/$category_/$service")({
  // Services live only in Firestore — fetch on the server so crawlers and
  // share sheets see the real title, description and photo in the SSR HTML.
  loader: async ({ params }) => {
    const service =
      typeof document === "undefined"
        ? ((await fetchDocRest("services", params.service)) as Service | null)
        : null;
    return { service, category: params.category, slug: params.service };
  },
  head: ({ loaderData }) => {
    const s = loaderData?.service;
    if (!s) return { meta: [{ title: "Service — LK Chemicals" }] };
    const title = s.metaTitle || `${s.name} — LK Chemicals`;
    const description = (s.metaDescription || s.description || "").slice(0, 155);
    const image = absUrl(s.ogImage || s.image || "/og-image.png");
    const url = absUrl(`/services/${loaderData.category}/${loaderData.slug}`);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:image", content: image },
      ],
    };
  },
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
  const { service: ssrService } = Route.useLoaderData();
  const { category, service: serviceSlug } = Route.useParams();
  const { data: services, isFetching } = useServices();
  const { data: categories } = useServiceCategories();
  const { data: products } = useProducts();
  const { data: productCategories } = useCategories();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const service: Service | null =
    services.find((s) => s.slug === serviceSlug) ?? ssrService ?? null;

  // Keep the live head tags accurate during SPA navigation so browser share
  // sheets pick up the real service photo and title.
  useLiveMeta(
    service
      ? {
          title: service.metaTitle || `${service.name} — LK Chemicals`,
          description: (service.metaDescription || service.description || "").slice(0, 155),
          image: service.ogImage || service.image || null,
          url: `/services/${service.serviceCategory || category}/${service.slug}`,
        }
      : null,
  );

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

  // Related: explicit picks first, otherwise same-category siblings.
  const relatedSlugs = service.related ?? [];
  const related = (
    relatedSlugs.length
      ? (relatedSlugs.map((s) => services.find((x) => x.slug === s)).filter(Boolean) as Service[])
      : services.filter(
          (s) => s.serviceCategory === service.serviceCategory && s.slug !== service.slug,
        )
  ).slice(0, 4);

  const relatedItems: SuggestItem[] = related.map((r) => ({
    key: r.slug,
    name: r.name,
    image: r.image ?? categories.find((c) => c.slug === r.serviceCategory)?.image ?? null,
    label: categories.find((c) => c.slug === r.serviceCategory)?.name ?? catName,
    link: {
      to: "/services/$category/$service",
      params: { category: r.serviceCategory || catSlug, service: r.slug },
    },
  }));

  // Cross-sell the formulary: featured products first, capped at four.
  const pairedProducts: SuggestItem[] = [...products]
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    .slice(0, 4)
    .map((p: Product) => {
      const pc = productCategories.find((c) => c.slug === p.category);
      return {
        key: p.slug,
        name: p.name,
        image: p.image ?? pc?.image ?? null,
        label: pc?.name ?? "Product",
        price: p.price,
        link: { to: "/products/$slug", params: { slug: p.slug } },
      };
    });

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

          {/* Hero: copy and photo share the stage. Desktop puts the headline,
              share and description beside the gallery (the old stacked layout
              left a viewport of dead space to the right of the copy); phones
              keep the buyer's scan order — photo first, then a compact title. */}
          <div className="mt-4 lg:mt-8 grid gap-6 lg:grid-cols-12 lg:gap-12 items-center">
            <div className="hidden lg:block lg:col-span-7">
              <h1 className="display-xl text-6xl xl:text-7xl grad-text">{service.name}</h1>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <ShareButton name={service.name} image={images[0] ?? null} />
              </div>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
                {service.description}
              </p>
            </div>
            <div className="lg:col-span-5">
              <MediaGallery
                images={images}
                name={service.name}
                fallbackImage={cat?.image ?? null}
              />
            </div>
            <div className="lg:hidden">
              <h1 className="display-xl text-2xl sm:text-3xl grad-text">{service.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <ShareButton name={service.name} image={images[0] ?? null} />
              </div>
              <div className="mt-4">
                <ClampedText text={service.description} />
              </div>
            </div>
          </div>

          {/* Facts — full-width panels under the hero */}
          <div className="mt-8 lg:mt-12">
            <div className="grid md:grid-cols-2 gap-6">
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
        </div>
      </section>

      {/* WhatsApp · Call · Enquiry — fixed to the screen on every viewport;
          Enquiry opens the booking form in a dialog, no scroll hunt. */}
      <ContactDock
        source={`service:${service.slug}`}
        message={msg}
        productRef={service.name}
        label={`Enquire · ${service.name}`}
      />

      <section id="enquire" className="section-dark py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8 grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <MicroLabel>Send enquiry</MicroLabel>
            <h2 className="display-xl text-4xl md:text-5xl grad-text mt-3">Book {service.name}.</h2>
            <p className="mt-3 text-white/60">
              Tell us your site, equipment and timeline — we'll come back with a specific scope and
              quote.
            </p>
            <div className="mt-6">
              <RequestCallButton source={`service:${service.slug}`} />
            </div>
          </div>
          <div className="lg:col-span-3">
            <EnquiryForm source={`service:${service.slug}`} productRef={service.name} />
          </div>
        </div>
      </section>

      {/* E-commerce cross-sell: sibling services, then the formulary. */}
      <SuggestRail
        eyebrow={`More in ${catName}`}
        heading="You may also need."
        items={relatedItems}
        viewAll={{
          label: `All ${catName} services`,
          to: "/services/$category",
          params: { category: catSlug },
        }}
      />
      <SuggestRail
        eyebrow="From the formulary"
        heading="Chemicals that pair well."
        items={pairedProducts}
        viewAll={{ label: "View all products", to: "/products" }}
      />
    </>
  );
}
