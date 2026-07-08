import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Check, Download } from "lucide-react";
import { findProduct, type Product } from "@/data/products";
import { useCategories, useProducts, useSiteSettings } from "@/lib/content";
import { MicroLabel } from "@/components/site/GhostWord";
import { LiquidButton } from "@/components/site/LiquidButton";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { waLink } from "@/components/site/WaCluster";
import drumImg from "@/assets/drum.jpg";
import resinImg from "@/assets/resin.jpg";

export const Route = createFileRoute("/products_/$slug")({
  // Built-in products resolve on the server for SSR + meta tags; admin-added
  // products (Firestore-only) resolve client-side in the component below.
  loader: ({ params }) => ({ product: findProduct(params.slug) ?? null, slug: params.slug }),
  head: ({ loaderData }) => ({
    meta: loaderData?.product
      ? [
          { title: `${loaderData.product.name} — LK Chemicals` },
          { name: "description", content: loaderData.product.description.slice(0, 155) },
          { property: "og:title", content: `${loaderData.product.name} — LK Chemicals` },
          { property: "og:description", content: loaderData.product.description.slice(0, 155) },
        ]
      : [{ title: "Product — LK Chemicals" }],
  }),
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
  const { data: settings } = useSiteSettings();
  const [activeImg, setActiveImg] = useState(0);

  const product: Product | null = staticProduct ?? products.find((p) => p.slug === slug) ?? null;
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
  const mainImg = images[activeImg] ?? images[0] ?? null;

  // Related: explicit picks first, otherwise same-category siblings.
  const relatedSlugs = product.related ?? [];
  const related = (
    relatedSlugs.length
      ? (relatedSlugs.map((s) => products.find((p) => p.slug === s)).filter(Boolean) as Product[])
      : products.filter((p) => p.category === product.category && p.slug !== product.slug)
  ).slice(0, 4);
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
          <h1 className="display-xl mt-4 text-5xl md:text-7xl grad-text max-w-4xl">
            {product.name}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70">{product.description}</p>

          <div className="mt-14 grid lg:grid-cols-5 gap-10 items-start">
            <div className="lg:col-span-2">
              <motion.div
                whileHover={{ rotateY: 8, rotateX: -6, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative rounded-3xl overflow-hidden glass-dark"
              >
                {mainImg ? (
                  <img src={mainImg} alt={product.name} className="h-72 w-full object-cover" />
                ) : (
                  <>
                    <img src={cat.image} alt="" className="h-72 w-full object-cover" />
                    <img
                      src={drumImg}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-contain p-8 mix-blend-screen"
                    />
                  </>
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
            <div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
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

          <div className="mt-10 sticky bottom-4 z-20 glass-dark rounded-full px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-white/80 text-sm px-2">
              <span className="micro-label">Enquire · {product.name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <LiquidButton href={waLink(msg)} external variant="leaf">
                WhatsApp
              </LiquidButton>
              <LiquidButton href={`tel:${settings.phone.replace(/\s+/g, "")}`} variant="ghost">
                Call
              </LiquidButton>
              <LiquidButton href="#enquire" variant="primary">
                Send enquiry
              </LiquidButton>
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
          </div>
          <div className="lg:col-span-3">
            <EnquiryForm source={`product:${product.slug}`} productRef={product.name} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-dark py-16 border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <MicroLabel>Related in {cat.name}</MicroLabel>
            <div className="mt-6 grid md:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to="/products/$slug"
                  params={{ slug: r.slug }}
                  className="group rounded-2xl bg-white/[0.04] border border-white/10 p-5 hover-lift"
                >
                  <div className="micro-label">{cat.number}</div>
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
