import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowLeft, Check, Download, Phone } from "lucide-react";
import { findProduct, type Product } from "@/data/products";
import { useCategories, useProducts, useSiteSettings } from "@/lib/content";
import { MicroLabel } from "@/components/site/GhostWord";
import { WhatsAppButton } from "@/components/site/WhatsApp";
import { RequestCallButton } from "@/components/site/RequestCall";
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

  // While this page is open, phones swap the floating contact cluster for the
  // fixed action dock (they'd overlap) — see body[data-dock] in styles.css.
  useEffect(() => {
    document.body.dataset.dock = "1";
    return () => {
      delete document.body.dataset.dock;
    };
  }, []);

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
          {/* Mobile-first hierarchy: compact title, then the PHOTO (what buyers
              look for first), then facts, with the long description tucked
              behind a read-more so it never buries the product. */}
          <h1 className="display-xl mt-4 text-3xl sm:text-5xl md:text-7xl grad-text max-w-4xl">
            {product.name}
          </h1>

          <div className="mt-6 lg:mt-10 grid lg:grid-cols-5 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-2">
              <ProductGallery images={images} catImage={cat.image} name={product.name} />
            </div>
            <div className="lg:col-span-3 space-y-6">
              <ProductDescription text={product.description} />
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

/* ------------------------------------------------------- description clamp */

// Long copy buries the product on phones — clamp it behind a read-more there,
// show it in full on desktop.
function ProductDescription({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 180;
  return (
    <div>
      <p
        className={
          "text-base lg:text-lg text-white/70 " +
          (!open && long ? "line-clamp-3 lg:line-clamp-none" : "")
        }
      >
        {text}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden mt-1.5 text-sm font-medium text-cyan-hi"
        >
          {open ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ image stage */

// Directional cinematic transition: the incoming photo slides and folds in
// from the side you're heading toward, the outgoing one falls away.
const stageVariants: Variants = {
  enter: (d: number) => ({ x: d * 72, opacity: 0, scale: 1.05, rotateY: d * 10 }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: { type: "spring", stiffness: 220, damping: 27 },
  },
  exit: (d: number) => ({
    x: d * -72,
    opacity: 0,
    scale: 0.97,
    rotateY: d * -8,
    transition: { duration: 0.28, ease: "easeIn" },
  }),
};

// Animated product gallery — crossfading Ken-Burns stage with swipe support
// on touch devices, hover tilt on desktop, and a polite auto-play that stops
// the moment the visitor takes over. Falls back to the category photo when a
// product has no images of its own.
function ProductGallery({
  images,
  catImage,
  name,
}: {
  images: string[];
  catImage: string;
  name: string;
}) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const lastUser = useRef(0);
  const many = images.length > 1;

  const go = (i: number, user = false) => {
    if (user) lastUser.current = Date.now();
    const next = ((i % images.length) + images.length) % images.length;
    setDir(next > active || (active === images.length - 1 && next === 0) ? 1 : -1);
    setActive(next);
  };

  // Auto-advance keeps the stage alive on phones (no hover there), but never
  // fights the user: any touch/click pauses it for a while.
  useEffect(() => {
    if (reduced || !many) return;
    const id = setInterval(() => {
      if (document.hidden || Date.now() - lastUser.current < 9000) return;
      setDir(1);
      setActive((a) => (a + 1) % images.length);
    }, 5000);
    return () => clearInterval(id);
  }, [images.length, many, reduced]);

  const src = images[active] ?? images[0] ?? null;

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        whileHover={reduced ? undefined : { rotateY: 6, rotateX: -4, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 150, damping: 16 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative h-72 rounded-3xl overflow-hidden glass-dark"
      >
        <AnimatePresence initial={false} custom={dir}>
          {src ? (
            <motion.div
              key={src + active}
              custom={dir}
              variants={reduced ? undefined : stageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag={many ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDragStart={() => (lastUser.current = Date.now())}
              onDragEnd={(_, info) => {
                lastUser.current = Date.now();
                if (info.offset.x < -56 || info.velocity.x < -420) go(active + 1, true);
                else if (info.offset.x > 56 || info.velocity.x > 420) go(active - 1, true);
              }}
              className={"absolute inset-0 " + (many ? "cursor-grab active:cursor-grabbing" : "")}
            >
              <motion.img
                src={src}
                alt={name}
                draggable={false}
                animate={reduced ? undefined : { scale: [1, 1.07] }}
                transition={
                  reduced
                    ? undefined
                    : { duration: 9, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                }
                className="h-full w-full object-cover"
              />
            </motion.div>
          ) : (
            <div key="fallback" className="absolute inset-0">
              <img src={catImage} alt="" className="h-full w-full object-cover" />
              <img
                src={drumImg}
                alt={name}
                className="absolute inset-0 h-full w-full object-contain p-8 mix-blend-screen"
              />
            </div>
          )}
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
        {many && (
          <div className="pointer-events-none absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={
                  "h-1.5 rounded-full transition-all duration-300 " +
                  (i === active ? "w-6 bg-cyan-hi" : "w-1.5 bg-white/40")
                }
              />
            ))}
          </div>
        )}
      </motion.div>
      {many && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((s, i) => (
            <motion.button
              key={s + i}
              type="button"
              onClick={() => go(i, true)}
              aria-label={`View image ${i + 1}`}
              whileTap={{ scale: 0.92 }}
              animate={{ scale: i === active ? 1.06 : 1 }}
              className={
                "h-16 w-16 shrink-0 overflow-hidden rounded-xl border transition-all " +
                (i === active ? "border-cyan-hi" : "border-white/10 opacity-70 hover:opacity-100")
              }
            >
              <img src={s} alt="" className="h-full w-full object-cover" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
