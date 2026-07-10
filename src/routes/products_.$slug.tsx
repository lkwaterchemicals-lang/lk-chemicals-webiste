import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, Check, Download, Phone } from "lucide-react";
import { findProduct, type Product, type Service } from "@/data/products";
import {
  useCategories,
  useProducts,
  useServiceCategories,
  useServices,
  useSiteSettings,
} from "@/lib/content";
import { fetchDocRest } from "@/lib/firestore-rest";
import { absUrl, useLiveMeta } from "@/lib/site";
import { MicroLabel } from "@/components/site/GhostWord";
import {
  ClampedText,
  MediaGallery,
  Panel,
  PriceChip,
  ShareButton,
  SuggestRail,
  type SuggestItem,
} from "@/components/site/Detail";
import { WhatsAppButton } from "@/components/site/WhatsApp";
import { RequestCallButton } from "@/components/site/RequestCall";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { waLink } from "@/components/site/WaCluster";
import drumImg from "@/assets/drum.jpg";
import resinImg from "@/assets/resin.jpg";

export const Route = createFileRoute("/products_/$slug")({
  // Built-in products resolve instantly; admin-added (Firestore-only) products
  // are fetched over REST on the server so crawlers and share sheets get the
  // real title, description and photo in the SSR HTML. On the client the
  // query cache resolves them instead — the loader stays instant.
  loader: async ({ params }) => {
    let product = findProduct(params.slug) ?? null;
    if (!product && typeof document === "undefined") {
      product = (await fetchDocRest("products", params.slug)) as Product | null;
    }
    return { product, slug: params.slug };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "Product — LK Chemicals" }] };
    const title = p.metaTitle || `${p.name} — LK Chemicals`;
    const description = (p.metaDescription || p.description || "").slice(0, 155);
    const image = absUrl(p.ogImage || p.image || "/og-image.png");
    const url = absUrl(`/products/${loaderData.slug}`);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:image", content: image },
      ],
    };
  },
  errorComponent: () => (
    <div className="min-h-[60vh] pt-40 text-center px-6">
      <h1 className="display-xl text-4xl">Couldn't load this product.</h1>
      <Link to="/products" className="mt-6 inline-block text-cyan-hi">
        Back to catalog →
      </Link>
    </div>
  ),
  component: ProductDetail,
});

function ProductNotFound() {
  return (
    <div className="min-h-[60vh] pt-40 text-center px-6">
      <MicroLabel>404</MicroLabel>
      <h1 className="display-xl text-5xl mt-4 grad-text">Product not found.</h1>
      <Link to="/products" className="mt-6 inline-block text-cyan-hi">
        Back to catalog →
      </Link>
    </div>
  );
}

function ProductDetail() {
  const { product: staticProduct, slug } = Route.useLoaderData();
  const { data: products, isFetching } = useProducts();
  const { data: categories } = useCategories();
  const { data: services } = useServices();
  const { data: serviceCategories } = useServiceCategories();
  const { data: settings } = useSiteSettings();

  // While this page is open, phones swap the floating contact cluster for the
  // fixed action dock (they'd overlap) — see body[data-dock] in styles.css.
  useEffect(() => {
    document.body.dataset.dock = "1";
    return () => {
      delete document.body.dataset.dock;
    };
  }, []);

  const product: Product | null = staticProduct ?? products.find((p) => p.slug === slug) ?? null;

  // Keep the live head tags (title, og:image…) accurate during SPA navigation
  // so browser share sheets pick up the real product photo, not the fallback.
  useLiveMeta(
    product
      ? {
          title: product.metaTitle || `${product.name} — LK Chemicals`,
          description: (product.metaDescription || product.description || "").slice(0, 155),
          image: product.ogImage || product.image || null,
          url: `/products/${product.slug}`,
        }
      : null,
  );

  if (!product) {
    // Firestore may still be loading an admin-added product; only 404 once settled.
    return isFetching ? <div className="min-h-[60vh] pt-40" /> : <ProductNotFound />;
  }

  const cat = categories.find((c) => c.slug === product.category) ?? {
    slug: product.category,
    number: "–",
    name: product.category,
    tagline: "",
    description: "",
    image: resinImg,
  };

  // Everything below is optional and admin-managed — guard every array.
  const features = product.features ?? [];
  const applications = product.applications ?? [];
  const packing = product.packing ?? [];
  const specs = product.specifications ?? [];
  const documents = product.documents ?? [];
  const images = [product.image, ...(product.gallery ?? [])].filter(Boolean) as string[];

  // Related: explicit picks first, otherwise same-category siblings.
  const relatedSlugs = product.related ?? [];
  const related = (
    relatedSlugs.length
      ? (relatedSlugs.map((s) => products.find((p) => p.slug === s)).filter(Boolean) as Product[])
      : products.filter((p) => p.category === product.category && p.slug !== product.slug)
  ).slice(0, 4);

  const relatedItems: SuggestItem[] = related.map((r) => {
    const rc = categories.find((c) => c.slug === r.category);
    return {
      key: r.slug,
      name: r.name,
      image: r.image ?? rc?.image ?? null,
      label: rc?.name ?? cat.name,
      price: r.price,
      link: { to: "/products/$slug", params: { slug: r.slug } },
    };
  });

  // Cross-sell the service arm the way a storefront pairs accessories:
  // featured services first, capped at four.
  const pairedServices: SuggestItem[] = [...services]
    .filter((s: Service) => s.serviceCategory)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    .slice(0, 4)
    .map((s) => ({
      key: s.slug,
      name: s.name,
      image: s.image ?? serviceCategories.find((c) => c.slug === s.serviceCategory)?.image ?? null,
      label: serviceCategories.find((c) => c.slug === s.serviceCategory)?.name ?? "Service",
      link: {
        to: "/services/$category/$service",
        params: { category: s.serviceCategory, service: s.slug },
      },
    }));

  const msg = `Hi LK Chemicals, I'd like a quote for ${product.name}.`;

  // Structured data for search engines (rendered client-side).
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.metaDescription || product.description,
    ...(images.length ? { image: images } : {}),
    category: cat.name,
    ...(specs.length
      ? {
          additionalProperty: specs.map((s) => ({
            "@type": "PropertyValue",
            name: s.name,
            value: [s.value, s.unit].filter(Boolean).join(" "),
          })),
        }
      : {}),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "Products", item: "/products" },
      { "@type": "ListItem", position: 3, name: cat.name, item: `/products?cat=${cat.slug}` },
      { "@type": "ListItem", position: 4, name: product.name, item: `/products/${product.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <section className="section-dark relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 caustics opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to formulary
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="micro-label">
              {cat.number} · {cat.name}
            </span>
          </div>
          {/* Desktop keeps the display headline. Phones get the PHOTO first,
              then a compact title with price + share — buyers scan image →
              price → facts, so the type never buries the product. */}
          <h1 className="hidden lg:block display-xl mt-4 text-7xl grad-text max-w-4xl">
            {product.name}
          </h1>
          <div className="hidden lg:flex mt-5 flex-wrap items-center gap-3">
            {product.price && <PriceChip price={product.price} />}
            <ShareButton name={product.name} image={images[0] ?? null} />
          </div>

          <div className="mt-4 lg:mt-10 grid lg:grid-cols-5 gap-6 lg:gap-10 items-start">
            <div className="lg:col-span-2">
              <MediaGallery
                images={images}
                name={product.name}
                fallbackImage={cat.image}
                fallbackOverlay={drumImg}
              />
            </div>
            <div className="lg:col-span-3 space-y-6">
              <div className="lg:hidden">
                <h1 className="display-xl text-2xl sm:text-3xl grad-text">{product.name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  {product.price && <PriceChip price={product.price} />}
                  <ShareButton name={product.name} image={images[0] ?? null} />
                </div>
              </div>
              <ClampedText text={product.description} />
              <div className="grid md:grid-cols-2 gap-6">
                {features.length > 0 && (
                  <Panel title="Features">
                    <ul className="space-y-2">
                      {features.map((f: string) => (
                        <li key={f} className="flex gap-2 text-white/80 text-sm">
                          <Check className="h-4 w-4 text-leaf shrink-0 mt-0.5" /> {f}
                        </li>
                      ))}
                    </ul>
                  </Panel>
                )}
                {applications.length > 0 && (
                  <Panel title="Applications">
                    <div className="flex flex-wrap gap-2">
                      {applications.map((a: string) => (
                        <span
                          key={a}
                          className="text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/15 text-white/80"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </Panel>
                )}
                {specs.length > 0 && (
                  <Panel title="Specifications" className="md:col-span-2">
                    <table className="w-full text-sm">
                      <tbody>
                        {specs.map((s, i) => (
                          <tr
                            key={(s.name ?? "") + i}
                            className="border-b border-white/10 last:border-0"
                          >
                            <td className="py-2 pr-4 text-white/60">{s.name}</td>
                            <td className="py-2 text-white/90 font-medium">
                              {s.value}
                              {s.unit ? (
                                <span className="text-white/50 font-normal"> {s.unit}</span>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Panel>
                )}
                {packing.length > 0 && (
                  <Panel title="Packing" className="md:col-span-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {packing.map((p: string) => (
                        <div
                          key={p}
                          className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-sm text-white/80"
                        >
                          {p}
                        </div>
                      ))}
                    </div>
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
          </div>

          {/* Action dock — phones get it pinned to the bottom of the screen
              from the first paint (no scrolling hunt to buy); desktop keeps
              the floating pill inside the section. The floating contact
              cluster is hidden on phones while this page is open (see the
              body[data-dock] rules in styles.css). */}
          <div className="mt-10 sticky bottom-4 z-20 max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-[60] max-lg:mt-0 max-lg:px-3 max-lg:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="glass-dark rounded-full px-4 py-3 flex flex-wrap items-center justify-between gap-3 max-lg:rounded-2xl max-lg:px-3 max-lg:py-2.5">
              <div className="hidden lg:block text-white/80 text-sm px-2">
                <span className="micro-label">Enquire · {product.name}</span>
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
            <h2 className="display-xl text-4xl md:text-5xl grad-text mt-3">
              Ask us anything about {product.name}.
            </h2>
            <p className="mt-3 text-white/60">
              Feed water conditions, flow rate, dosing question — we'll come back with a specific
              recommendation.
            </p>
            <div className="mt-6">
              <RequestCallButton source={`product:${product.slug}`} />
            </div>
          </div>
          <div className="lg:col-span-3">
            <EnquiryForm source={`product:${product.slug}`} productRef={product.name} />
          </div>
        </div>
      </section>

      {/* E-commerce cross-sell: sibling products, then the service arm. */}
      <SuggestRail
        eyebrow={`Related · ${cat.name}`}
        heading="You may also like."
        items={relatedItems}
        viewAll={{ label: "View all products", to: "/products", search: { cat: cat.slug } }}
      />
      <SuggestRail
        eyebrow="Field operations"
        heading="Pair it with a service."
        items={pairedServices}
        viewAll={{ label: "All services", to: "/services" }}
      />
    </>
  );
}
