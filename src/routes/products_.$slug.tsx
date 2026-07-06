import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Check } from "lucide-react";
import { findProduct, type Product } from "@/data/products";
import { useCategories, useProducts } from "@/lib/content";
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
      <Link to="/products" className="mt-6 inline-block text-cyan-hi">Back to catalog →</Link>
    </div>
  ),
  component: ProductDetail,
});

function ProductNotFound() {
  return (
    <div className="min-h-[60vh] pt-40 text-center px-6">
      <MicroLabel>404</MicroLabel>
      <h1 className="display-xl text-5xl mt-4 grad-text">Product not found.</h1>
      <Link to="/products" className="mt-6 inline-block text-cyan-hi">Back to catalog →</Link>
    </div>
  );
}

function ProductDetail() {
  const { product: staticProduct, slug } = Route.useLoaderData();
  const { data: products, isFetching } = useProducts();
  const { data: categories } = useCategories();

  const product: Product | null = staticProduct ?? products.find((p) => p.slug === slug) ?? null;
  if (!product) {
    // Firestore may still be loading an admin-added product; only 404 once settled.
    return isFetching ? <div className="min-h-[60vh] pt-40" /> : <ProductNotFound />;
  }

  const cat = categories.find((c) => c.slug === product.category) ??
    { slug: product.category, number: "–", name: product.category, tagline: "", description: "", image: resinImg };
  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);
  const msg = `Hi LK Chemicals, I'd like a quote for ${product.name}.`;

  return (
    <>
      <section className="section-dark relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 caustics opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <Link to="/products" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to formulary
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="micro-label">{cat.number} · {cat.name}</span>
          </div>
          <h1 className="display-xl mt-4 text-5xl md:text-7xl grad-text max-w-4xl">{product.name}</h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70">{product.description}</p>

          <div className="mt-14 grid lg:grid-cols-5 gap-10 items-start">
            <div className="lg:col-span-2">
              <motion.div
                whileHover={{ rotateY: 8, rotateX: -6, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative rounded-3xl overflow-hidden glass-dark"
              >
                <img src={cat.image} alt="" className="h-72 w-full object-cover" />
                <img src={drumImg} alt={product.name} className="absolute inset-0 h-full w-full object-contain p-8 mix-blend-screen" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
              </motion.div>
            </div>
            <div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
              <Panel title="Features">
                <ul className="space-y-2">
                  {product.features.map((f: string) => (
                    <li key={f} className="flex gap-2 text-white/80 text-sm"><Check className="h-4 w-4 text-leaf shrink-0 mt-0.5" /> {f}</li>
                  ))}
                </ul>
              </Panel>
              <Panel title="Applications">
                <div className="flex flex-wrap gap-2">
                  {product.applications.map((a: string) => (
                    <span key={a} className="text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/15 text-white/80">{a}</span>
                  ))}
                </div>
              </Panel>
              <Panel title="Packing" className="md:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {product.packing.map((p: string) => (
                    <div key={p} className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-sm text-white/80">{p}</div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>

          <div className="mt-10 sticky bottom-4 z-20 glass-dark rounded-full px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-white/80 text-sm px-2">
              <span className="micro-label">Enquire · {product.name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <LiquidButton href={waLink(msg)} external variant="leaf">WhatsApp</LiquidButton>
              <LiquidButton href="tel:+919866600699" variant="ghost">Call</LiquidButton>
              <LiquidButton href="#enquire" variant="primary">Send enquiry</LiquidButton>
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
              Feed water conditions, flow rate, dosing question — we'll come back with a specific recommendation.
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
                <Link key={r.slug} to="/products/$slug" params={{ slug: r.slug }} className="group rounded-2xl bg-white/[0.04] border border-white/10 p-5 hover-lift">
                  <div className="micro-label">{cat.number}</div>
                  <h3 className="display-xl text-lg text-white mt-2 group-hover:grad-text">{r.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={"rounded-3xl glass-dark p-6 " + className}>
      <div className="micro-label mb-3">{title}</div>
      {children}
    </div>
  );
}