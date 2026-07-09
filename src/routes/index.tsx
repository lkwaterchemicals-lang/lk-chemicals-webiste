import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import { ArrowDown, Droplets } from "lucide-react";
import { useCategories, useTestimonials, useSiteSettings } from "@/lib/content";
import { useHomeContent } from "@/lib/pages";
import { iconByName } from "@/lib/icons";
import type { WhyItem } from "@/data/site";
import { LiquidButton } from "@/components/site/LiquidButton";
import { Waterline } from "@/components/site/Waterline";
import { GhostWord, MicroLabel } from "@/components/site/GhostWord";
import { Coverflow3D } from "@/components/site/Coverflow3D";
import { ServiceIndex } from "@/components/site/ServiceIndex";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { waLink } from "@/components/site/WaCluster";
import { WaterCore } from "@/components/site/WaterCore";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LK Chemicals — We Engineer Water" },
      {
        name: "description",
        content:
          "Industrial water treatment chemicals, plants and services from Hyderabad since 2013. RO, boiler, cooling tower, chiller, descaling, ETP & STP chemicals, plus RO/DM/softener/STP/ETP plants.",
      },
      { property: "og:title", content: "LK Chemicals — We Engineer Water" },
      {
        property: "og:description",
        content:
          "Industrial water treatment chemicals, plants and services from Hyderabad since 2013.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <WaterlineTransition />
      <WhoWeAre />
      <WhatWeMake />
      <ServiceIndex />
      <WhereWeWork />
      <HowWaterGetsTreated />
      <WhyLK />
      <Proof />
      <SeeThePlant />
      <TalkToUs />
      <WaterCore />
    </>
  );
}

/* =============== 01 HERO =============== */

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const { data: categories } = useCategories();
  const { data: c } = useHomeContent();

  return (
    <section
      ref={ref}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setMouse({
          x: (e.clientX - r.left) / r.width - 0.5,
          y: (e.clientY - r.top) / r.height - 0.5,
        });
      }}
      className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink-2 flex flex-col"
    >
      {/* Depth image */}
      <motion.img
        src={c.heroImage}
        alt=""
        aria-hidden
        style={{ y, scale, x: mouse.x * -30, translateY: `calc(${mouse.y * -30}px + 0%)` }}
        className="absolute inset-0 h-full w-full object-cover object-[68%_center] md:object-center opacity-70 hero-lighten"
      />
      {/* Vignette + caustics */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-2/60 via-transparent to-ink hero-lighten-overlay" />
      <div className="absolute inset-0 caustics opacity-40 mix-blend-screen" />

      {/* Rising bubbles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute bottom-0 rounded-full bg-cyan-hi/30 blur-[1px] hidden sm:block"
          style={{
            left: `${(i * 73) % 100}%`,
            width: `${6 + (i % 5) * 4}px`,
            height: `${6 + (i % 5) * 4}px`,
            animation: `bubble-rise ${8 + (i % 6) * 2}s linear ${i * 0.7}s infinite`,
          }}
        />
      ))}

      {/* Corner-anchored decorative chips — only at ultra-wide where safe zones exist */}
      <div className="pointer-events-none absolute inset-0 hidden 2xl:block z-[5]">
        {categories.slice(0, 4).map((c, i) => {
          const positions = [
            { top: "7rem", left: "1.25rem" },
            { top: "7rem", right: "1.25rem" },
            // Right column bottom chip clears the fixed call/WhatsApp buttons.
            { bottom: "1.5rem", left: "1.25rem" },
            { bottom: "1.5rem", right: "7.5rem" },
          ] as const;
          const pos = positions[i];
          return (
            <div
              key={c.slug}
              className="absolute hero-chip rounded-full px-3.5 py-2 text-[10px] tracking-widest uppercase animate-float-slow whitespace-nowrap"
              style={{ ...pos, animationDelay: `${i * 0.6}s` }}
            >
              <span className="hero-chip-n">{c.number}</span>
              <span className="mx-1.5 opacity-40">·</span>
              {c.name}
            </div>
          );
        })}
      </div>

      {/* Content — flex column that always fits viewport */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 md:px-8 flex-1 flex flex-col justify-center pt-24 sm:pt-28 pb-24 sm:pb-20 min-h-0">
        <MicroLabel n="00">{c.heroLabel}</MicroLabel>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
          className="display-xl mt-4 sm:mt-6 leading-[0.85] tracking-tighter"
          style={{ fontSize: "clamp(3rem, 13vw, 12rem)" }}
        >
          <span className="grad-text">{c.heroTitleTop}</span>
          <br />
          <span className="grad-leaf-text">{c.heroTitleBottom}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-4 sm:mt-6 max-w-xl text-white/70"
          style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.125rem)" }}
        >
          {c.heroSubtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4"
        >
          <LiquidButton to="/products" size="md">
            Explore Products
          </LiquidButton>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 text-white/80 hover:text-white text-sm min-h-11"
          >
            <span>Request a formulation</span>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/20 group-hover:bg-white group-hover:text-ink transition-all">
              →
            </span>
          </Link>
        </motion.div>

        {/* Mobile / tablet chip rail — a living marquee: drifts on its own,
            obeys the thumb instantly, resumes when released */}
        <div className="2xl:hidden mt-6 -mx-5 sm:-mx-6 md:-mx-8">
          <ChipMarquee categories={categories} />
        </div>
      </div>

      {/* Scroll indicator — hidden on short viewports to prevent overlap */}
      <div className="hidden sm:flex absolute bottom-4 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 text-white/50 z-10 pointer-events-none">
        <span className="micro-label text-[9px]">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="grid h-5 w-5 place-items-center rounded-full bg-cyan-hi/20"
        >
          <ArrowDown className="h-3 w-3 text-cyan-hi" />
        </motion.span>
      </div>
    </section>
  );
}

/* Hero category chips: a seamless self-drifting marquee the user can grab.
   Duplicated track + scroll wrap = infinite loop with native touch control. */
function ChipMarquee({ categories }: { categories: import("@/data/products").Category[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let lastUser = 0;
    let engaged = false;
    const markUser = () => {
      lastUser = Date.now();
    };
    const down = () => {
      engaged = true;
      markUser();
    };
    const up = () => {
      engaged = false;
      markUser();
    };
    rail.addEventListener("pointerdown", down, { passive: true });
    rail.addEventListener("touchstart", down, { passive: true });
    addEventListener("pointerup", up, { passive: true });
    rail.addEventListener("touchend", up, { passive: true });
    rail.addEventListener("wheel", markUser, { passive: true });
    const tick = () => {
      const half = rail.scrollWidth / 2;
      if (half > rail.clientWidth) {
        if (!engaged && Date.now() - lastUser > 2200 && !document.hidden) {
          rail.scrollLeft += 0.5;
        }
        // seamless wrap in both directions
        if (rail.scrollLeft >= half) rail.scrollLeft -= half;
        else if (rail.scrollLeft <= 0) rail.scrollLeft += half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      rail.removeEventListener("pointerdown", down);
      rail.removeEventListener("touchstart", down);
      removeEventListener("pointerup", up);
      rail.removeEventListener("touchend", up);
      rail.removeEventListener("wheel", markUser);
    };
  }, []);
  const row = [...categories, ...categories];
  return (
    <div
      ref={ref}
      className="flex gap-2 overflow-x-auto px-5 sm:px-6 md:px-8 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {row.map((c, i) => (
        <span
          key={c.slug + i}
          className="shrink-0 hero-chip rounded-full px-3.5 py-2 text-[10px] tracking-widest uppercase whitespace-nowrap"
        >
          <span className="hero-chip-n">{c.number}</span>
          <span className="mx-1.5 opacity-40">·</span>
          {c.name}
        </span>
      ))}
    </div>
  );
}

/* =============== TRANSITION =============== */

function WaterlineTransition() {
  // Fades the hero's ink into the shared water world — never into a white
  // band, so dark mode stays one continuous dark environment.
  return (
    <div className="relative -mt-1 h-24 bg-gradient-to-b from-ink/70 to-transparent">
      <Waterline className="absolute inset-x-0 top-1/2 -translate-y-1/2" />
    </div>
  );
}

/* =============== 02 WHO WE ARE =============== */

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1400;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to]);
  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

function WhoWeAre() {
  const { data: c } = useHomeContent();
  const imgs = c.whoImages;
  const img = (k: number) => imgs[k] ?? imgs[0] ?? "";
  return (
    <section className="relative section-light overflow-hidden py-32">
      <GhostWord className="absolute top-2 left-1/2 -translate-x-1/2 text-[22vw] opacity-100">
        {c.whoGhost}
      </GhostWord>
      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        <MicroLabel n="02" className="!text-royal">
          {c.whoLabel}
        </MicroLabel>
        <div className="mt-8 grid gap-16 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7">
            <h2
              className="display-xl leading-[0.95]"
              style={{ fontSize: "clamp(2.25rem, 8vw, 5.5rem)" }}
            >
              {c.whoHeadingLead} <span className="grad-leaf-text">{c.whoHeadingAccent}</span>
            </h2>
            <p className="mt-8 max-w-xl text-lg text-ink/70">{c.whoBody}</p>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {c.stats.map((s) => (
                <div key={s.label}>
                  <div className="display-xl text-4xl sm:text-5xl md:text-6xl">
                    <span className="grad-leaf-text">
                      <Counter to={Number(s.value) || 0} suffix={s.suffix} />
                    </span>
                  </div>
                  <div className="mt-2 micro-label !text-ink/50">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Mobile: clean 3-image grid; Desktop: overlapping collage */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:hidden">
              <motion.img
                src={img(0)}
                alt="Manufacturing plant"
                className="h-48 sm:h-56 w-full rounded-2xl object-cover shadow-xl"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              />
              <motion.img
                src={img(1)}
                alt="Laboratory"
                className="h-48 sm:h-56 w-full rounded-2xl object-cover shadow-xl"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              />
              <motion.img
                src={img(2)}
                alt="Water droplet"
                className="col-span-2 h-40 sm:h-48 w-full rounded-2xl object-cover shadow-xl"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              />
            </div>
            <div className="hidden lg:block relative h-[clamp(340px,34vw,460px)]">
              <motion.img
                src={img(0)}
                alt="Manufacturing plant"
                className="absolute top-0 left-0 h-72 w-72 rounded-3xl object-cover shadow-2xl hover-lift"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ transform: "rotate(-4deg)" }}
              />
              <motion.img
                src={img(1)}
                alt="Laboratory"
                className="absolute top-20 right-0 h-60 w-48 rounded-3xl object-cover shadow-2xl hover-lift"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                style={{ transform: "rotate(6deg)" }}
              />
              <motion.img
                src={img(2)}
                alt="Water droplet"
                className="absolute bottom-0 left-16 h-40 w-56 rounded-3xl object-cover shadow-2xl hover-lift"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =============== 03 WHAT WE MAKE =============== */

function CategoryCard({ c }: { c: import("@/data/products").Category }) {
  return (
    <article className="rounded-3xl overflow-hidden glass-dark relative flex flex-col h-full">
      <div className="relative h-40 sm:h-44 xl:h-48 overflow-hidden">
        <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/15 to-transparent" />
        <div className="absolute top-3.5 left-4 right-4 flex items-start justify-between">
          <span className="display-xl text-4xl grad-text">{c.number}</span>
          <span className="micro-label text-cyan-hi text-right">{c.name}</span>
        </div>
      </div>
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        <h3 className="display-xl text-xl sm:text-2xl text-white line-clamp-2">{c.tagline}</h3>
        <p className="mt-2.5 text-sm text-white/70 flex-1 line-clamp-3">{c.description}</p>
        <div className="mt-4">
          <LiquidButton to="/products" size="md">
            Explore {c.name}
          </LiquidButton>
        </div>
      </div>
    </article>
  );
}

// The rail shows a curated five; this closing card carries the rest of the
// formulary without ever quoting a count that goes stale.
function ViewAllCard() {
  return (
    <Link
      to="/products"
      className="group rounded-3xl overflow-hidden glass-dark relative flex flex-col items-center justify-center text-center h-full min-h-[280px] p-8 hover-lift"
    >
      <div className="absolute inset-0 caustics opacity-40" aria-hidden />
      <span className="relative grid h-16 w-16 place-items-center rounded-full bg-cyan-hi/15 text-cyan-hi transition-transform duration-500 group-hover:scale-110 group-hover:rotate-45">
        <span className="text-2xl" aria-hidden>
          →
        </span>
      </span>
      <span className="relative display-xl text-2xl sm:text-3xl text-white mt-6">
        View all categories
      </span>
      <span className="relative mt-2 text-sm text-white/60">
        Browse the complete formulary — every range, every grade.
      </span>
    </Link>
  );
}

function WhatWeMakeHeading() {
  const { data: c } = useHomeContent();
  return (
    <div className="mx-auto max-w-7xl px-6 md:px-8 w-full shrink-0">
      <MicroLabel n="03">What we make</MicroLabel>
      <h2
        className="display-xl mt-3 grad-text max-w-4xl"
        style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)" }}
      >
        {c.makeHeading}
      </h2>
    </div>
  );
}

// Desktop: the section pins in the viewport while the card row scrolls
// horizontally, driven by vertical scroll progress — a signature reveal
// instead of a plain carousel. Mobile keeps a native swipe rail (below).
function WhatWeMakePinned() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { data: categories } = useCategories();

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        setDistance(Math.max(0, trackRef.current.scrollWidth - window.innerWidth));
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  return (
    <section
      ref={sectionRef}
      className="hidden lg:block section-dark relative"
      style={{ height: `calc(100vh + ${distance}px)` }}
    >
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden py-16">
        <WhatWeMakeHeading />
        <motion.div ref={trackRef} style={{ x }} className="mt-10 flex gap-5 pl-6 md:pl-8 w-max">
          {categories.slice(0, 5).map((c) => (
            <div key={c.slug} className="w-[26vw] xl:w-[22vw] shrink-0">
              <CategoryCard c={c} />
            </div>
          ))}
          <div className="w-[26vw] xl:w-[22vw] shrink-0">
            <ViewAllCard />
          </div>
          <div className="shrink-0 w-1 lg:pr-6 md:pr-8" aria-hidden />
        </motion.div>
      </div>
    </section>
  );
}

// Mobile / tablet: 3D coverflow rail — the centred card sits flat, neighbours
// fold away in perspective. Auto-advances politely, fully touch-controllable.
function WhatWeMakeSwipe() {
  const { data: categories } = useCategories();
  return (
    <section className="lg:hidden section-dark relative py-24 overflow-hidden">
      <WhatWeMakeHeading />
      <Coverflow3D
        className="mt-8"
        variant="y"
        cardClass="w-[68vw] max-w-[300px] sm:w-[48vw] md:w-[38vw]"
        items={[
          ...categories.slice(0, 5).map((c) => <CategoryCard key={c.slug} c={c} />),
          <ViewAllCard key="view-all" />,
        ]}
      />
    </section>
  );
}

function WhatWeMake() {
  return (
    <>
      <WhatWeMakePinned />
      <WhatWeMakeSwipe />
    </>
  );
}

/* =============== 04 WHERE WE WORK =============== */

function WhereWeWork() {
  const { data: c } = useHomeContent();
  const industries = c.industries;
  const row = [...industries, ...industries];
  return (
    <section className="section-dark py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <MicroLabel n="05">Where we work</MicroLabel>
        <h2 className="display-xl mt-3 grad-text" style={{ fontSize: "clamp(2.25rem, 8vw, 5rem)" }}>
          {c.whereHeading}
        </h2>
        <p className="mt-4 max-w-xl text-white/60">{c.whereSubtitle}</p>
      </div>
      {/* Desktop / tablet: the flowing marquee rows */}
      <div className="hidden md:block mt-14 space-y-4">
        {[0, 1].map((r) => (
          <div key={r} className="relative flex overflow-hidden">
            <div
              className={"flex gap-6 shrink-0 " + (r === 0 ? "marquee-track" : "marquee-track-rev")}
            >
              {row.map((ind, idx) => {
                const Icon = iconByName(ind.icon);
                return (
                  <div
                    key={ind.name + idx}
                    className="group relative flex items-center gap-6 rounded-full glass-dark px-8 py-5 hover-lift"
                  >
                    <Icon className="h-5 w-5 text-cyan-hi shrink-0" />
                    <span className="display-xl text-2xl sm:text-3xl md:text-5xl text-white whitespace-nowrap">
                      {ind.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: a calm, tappable tile grid — each industry gets its own
          iconed card that rises into view */}
      <div className="md:hidden mt-10 mx-auto max-w-7xl px-6 grid grid-cols-2 gap-3">
        {industries.map((ind, k) => {
          const Icon = iconByName(ind.icon);
          return (
            <motion.div
              key={ind.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ delay: (k % 4) * 0.06, duration: 0.5 }}
              className="bento-tile rounded-2xl p-4 flex flex-col gap-3"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-hi/15 text-cyan-hi">
                <Icon className="h-5 w-5" />
              </span>
              <span className="display-xl text-base leading-tight text-foreground">{ind.name}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* =============== 05 HOW WATER GETS TREATED =============== */

function HowWaterGetsTreated() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const dash = useTransform(scrollYProgress, [0, 1], [1000, 0]);
  const { data: c } = useHomeContent();
  const stations = c.journey;
  return (
    <section ref={ref} className="section-dark relative" style={{ height: "260vh" }}>
      <div className="sticky top-0 min-h-screen flex flex-col overflow-hidden py-24">
        <div className="mx-auto max-w-7xl w-full px-6 md:px-8">
          <MicroLabel n="06">How water gets treated</MicroLabel>
          <h2
            className="display-xl mt-3 grad-text max-w-4xl"
            style={{ fontSize: "clamp(2.25rem, 8vw, 5rem)" }}
          >
            {c.journeyHeading}
          </h2>
          <p className="mt-4 max-w-xl text-white/60">{c.journeySubtitle}</p>
        </div>
        <div className="relative mt-10 flex-1 mx-auto max-w-7xl w-full px-6 md:px-8">
          <svg viewBox="0 0 1000 260" className="w-full h-40 md:h-56" preserveAspectRatio="none">
            <defs>
              <linearGradient id="pathG" x1="0" x2="1">
                <stop offset="0" stopColor="var(--royal)" />
                <stop offset="0.5" stopColor="var(--cyan-hi)" />
                <stop offset="1" stopColor="var(--leaf)" />
              </linearGradient>
            </defs>
            <motion.path
              d="M 20 130 C 200 30, 300 220, 500 130 S 800 30, 980 130"
              fill="none"
              stroke="url(#pathG)"
              strokeWidth="3"
              pathLength={1000}
              strokeDasharray={1000}
              style={{ strokeDashoffset: dash }}
            />
          </svg>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mt-8">
            {stations.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ delay: i * 0.1 }}
                className="relative overflow-hidden rounded-2xl p-5 min-h-[180px] flex flex-col justify-end glass"
              >
                <img src={s.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                <div className="relative micro-label">{String(i + 1).padStart(2, "0")}</div>
                <div className="relative display-xl text-xl mt-2 text-on-media">{s.title}</div>
                <p className="relative text-sm mt-2 text-on-media-soft">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =============== 06 WHY LK =============== */

// Preserve the original bento rhythm regardless of item count: the first tile
// spans 2×2, the fourth spans 2 columns, the rest are single cells.
function whySpan(i: number): string {
  if (i === 0) return "md:col-span-2 md:row-span-2";
  if (i === 3) return "md:col-span-2";
  return "";
}

function WhyLK() {
  const { data: c } = useHomeContent();
  const items = c.whyItems;
  return (
    <section className="section-light py-28 relative overflow-hidden">
      <GhostWord className="absolute bottom-2 right-0 text-[22vw]">PURITY</GhostWord>
      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        <MicroLabel n="07" className="!text-royal">
          Why LK
        </MicroLabel>
        <h2 className="display-xl mt-3" style={{ fontSize: "clamp(2.25rem, 8vw, 5rem)" }}>
          {c.whyHeadingLead} <span className="grad-leaf-text">{c.whyHeadingAccent}</span>
        </h2>
        <div className="mt-14 grid md:grid-cols-3 md:grid-rows-3 gap-4 auto-rows-[minmax(160px,auto)]">
          {items.map((it: WhyItem, i) => {
            const leaf = Boolean(it.highlight);
            return (
              <div
                key={it.title}
                className={
                  "group relative overflow-hidden rounded-3xl p-6 md:p-8 hover-lift transition-all " +
                  (leaf ? "bg-ink text-white" : "bento-tile") +
                  " " +
                  whySpan(i)
                }
              >
                {it.img && (
                  <>
                    <img
                      src={it.img}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/55 to-black/80" />
                  </>
                )}
                <div className="absolute inset-0 opacity-30 dot-grid pointer-events-none" />
                <h3
                  className={
                    "relative display-xl text-2xl md:text-3xl " +
                    (leaf ? "grad-leaf-text" : "text-foreground")
                  }
                >
                  {it.title}
                </h3>
                <p
                  className={
                    "relative mt-3 text-sm " + (leaf ? "text-on-media-soft" : "text-ink/70")
                  }
                >
                  {it.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =============== 07 PROOF =============== */

function Proof() {
  const { data: quotes } = useTestimonials();
  const { data: c } = useHomeContent();
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % quotes.length), 6000);
    return () => clearInterval(id);
  }, [quotes.length]);
  const row = [...c.certs, ...c.certs];
  return (
    <section className="section-dark py-28 relative overflow-hidden">
      <div className="absolute inset-0 caustics opacity-30" />
      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        <MicroLabel n="08">Proof</MicroLabel>
        <div className="mt-8 min-h-[280px] md:min-h-[220px]">
          <motion.blockquote
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="display-xl text-3xl md:text-5xl lg:text-6xl leading-tight grad-text max-w-5xl"
          >
            "{quotes[i % quotes.length].q}"
          </motion.blockquote>
          <div className="mt-6 micro-label">{quotes[i % quotes.length].who}</div>
          <div className="mt-8 flex gap-2">
            {quotes.map((_, k) => (
              <button
                key={k}
                aria-label={`Testimonial ${k + 1}`}
                onClick={() => setI(k)}
                className={
                  "h-1.5 rounded-full transition-all " +
                  (k === i ? "w-10 bg-cyan-hi" : "w-4 bg-white/20")
                }
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-16 overflow-hidden opacity-70">
        <div className="flex gap-12 sm:gap-16 marquee-track marquee-slow">
          {row.map((cert, k) => (
            <div key={cert + k} className="shrink-0 flex items-center gap-3 text-white/60">
              <Droplets className="h-4 w-4 text-cyan-hi" />
              <span className="micro-label whitespace-nowrap">{cert}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =============== 08 SEE THE PLANT =============== */

function SeeThePlant() {
  const { data: c } = useHomeContent();
  const p = c.plantImages;
  const img = (k: number) => p[k] ?? p[0] ?? "";
  return (
    <section className="section-light py-28 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <MicroLabel n="09" className="!text-royal">
          See the plant
        </MicroLabel>
        <div className="mt-6 flex flex-wrap justify-between items-end gap-6">
          <h2 className="display-xl max-w-3xl" style={{ fontSize: "clamp(2.25rem, 8vw, 5rem)" }}>
            {c.plantHeading}
          </h2>
          <LiquidButton to="/gallery" variant="primary">
            Enter Gallery
          </LiquidButton>
        </div>
        <div className="mt-14 grid grid-cols-6 gap-4 md:gap-6">
          <img
            src={img(0)}
            alt="Plant"
            className="col-span-6 md:col-span-3 h-64 md:h-96 w-full object-cover rounded-3xl hover-lift"
          />
          <img
            src={img(1)}
            alt="Lab"
            className="col-span-3 md:col-span-2 h-40 md:h-64 w-full object-cover rounded-3xl hover-lift"
          />
          <img
            src={img(2)}
            alt="Water"
            className="col-span-3 md:col-span-1 h-40 md:h-64 w-full object-cover rounded-3xl hover-lift"
          />
          <img
            src={img(3)}
            alt="RO"
            className="col-span-6 md:col-span-4 h-56 md:h-72 w-full object-cover rounded-3xl hover-lift"
          />
          <div className="col-span-6 md:col-span-2 rounded-3xl bg-ink p-6 flex flex-col justify-between">
            <div>
              <div className="micro-label">Live</div>
              <div className="display-xl text-4xl grad-text mt-2">{c.plantCapacity}</div>
              <div className="text-white/60 text-sm mt-1">{c.plantCapacityLabel}</div>
            </div>
            <div className="text-white/40 text-xs">{c.plantLocation}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =============== 09 TALK TO US =============== */

function TalkToUs() {
  const { data: c } = useHomeContent();
  const { data: s } = useSiteSettings();
  const tel = `tel:${s.phone.replace(/\s+/g, "")}`;
  return (
    <section className="section-dark relative overflow-hidden py-28">
      <div className="absolute inset-0 caustics opacity-40" />
      <Waterline className="absolute top-6 left-0" />
      <div className="relative mx-auto max-w-7xl px-6 md:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <MicroLabel n="10">Talk to us</MicroLabel>
          <h2
            className="display-xl mt-4 grad-text leading-[0.9]"
            style={{ fontSize: "clamp(2.5rem, 10vw, 6rem)" }}
          >
            {c.talkHeadingTop}
            <br />
            {c.talkHeadingBottom}
          </h2>
          <p className="mt-6 max-w-md text-white/70">{c.talkBody}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LiquidButton href={waLink()} external variant="leaf">
              WhatsApp us
            </LiquidButton>
            <LiquidButton href={tel} variant="ghost">
              {s.phone}
            </LiquidButton>
          </div>
        </div>
        <EnquiryForm source="home:talk-to-us" />
      </div>
    </section>
  );
}
