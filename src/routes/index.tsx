import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import { ArrowDown, ArrowLeft, ArrowRight, Droplets, Quote, Star } from "lucide-react";
import { useCategories, useTestimonials, useSiteSettings } from "@/lib/content";
import { useHomeContent } from "@/lib/pages";
import { iconByName } from "@/lib/icons";
import { homeContent, type WhyItem } from "@/data/site";
import { LiquidButton } from "@/components/site/LiquidButton";
import { Waterline } from "@/components/site/Waterline";
import { GhostWord, MicroLabel } from "@/components/site/GhostWord";
import { ServiceIndex } from "@/components/site/ServiceIndex";
import { RequestCallButton } from "@/components/site/RequestCall";
import { WhatsAppButton } from "@/components/site/WhatsApp";
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
    // The hero photo is the LCP element (painted as a CSS background, which
    // browsers discover late) — preload it at high priority so first paint
    // doesn't wait a full network round-trip.
    links: [{ rel: "preload", as: "image", href: homeContent.heroImage, fetchpriority: "high" }],
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
  const { data: categories } = useCategories();
  const { data: c } = useHomeContent();

  // #1 — the hero photo never moves: no parallax, no zoom, no cursor drift. On
  // desktop it's painted with `background-attachment: fixed` (see .hero-photo),
  // so it stays anchored to the viewport while the hero copy scrolls up over
  // it, yet stays clipped to the hero box — a `position: fixed` layer would
  // escape `overflow` and bleed through the translucent sections below.
  //
  // Background images can't use onError, so probe the URL and fall back to the
  // built-in photo if the stored one 404s (a stale hashed asset URL).
  const [src, setSrc] = useState(c.heroImage);
  useEffect(() => {
    setSrc(c.heroImage);
    if (!c.heroImage || c.heroImage === homeContent.heroImage) return;
    const probe = new Image();
    probe.onerror = () => setSrc(homeContent.heroImage);
    probe.src = c.heroImage;
  }, [c.heroImage]);

  return (
    <section
      id="home-hero"
      // min-h (not h): on short laptop windows the centred content used to
      // overflow its padding box UPWARD and collide with the fixed nav — the
      // section must grow with its content, never let content escape.
      className="relative min-h-[100svh] overflow-hidden bg-ink-2 flex flex-col"
    >
      {/* Backdrop — photo + overlays + bubbles ride together */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          aria-hidden
          style={{ backgroundImage: `url("${src}")` }}
          className="hero-photo hero-lighten absolute inset-0 opacity-70"
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
      </div>

      {/* Corner-anchored category chips — jump straight to that category's
          catalog. Only at ultra-wide where the safe zones exist. */}
      <div className="absolute inset-0 hidden 2xl:block z-[5]">
        {categories.slice(0, 4).map((cat, i) => {
          const positions = [
            { top: "7rem", left: "1.25rem" },
            { top: "7rem", right: "1.25rem" },
            // Right column bottom chip clears the fixed call/WhatsApp buttons.
            { bottom: "1.5rem", left: "1.25rem" },
            { bottom: "1.5rem", right: "7.5rem" },
          ] as const;
          const pos = positions[i];
          return (
            <Link
              key={cat.slug}
              to="/products"
              search={{ cat: cat.slug }}
              aria-label={`Browse ${cat.name}`}
              className="absolute hero-chip rounded-full px-4 py-2 text-[10px] tracking-widest uppercase animate-float-slow whitespace-nowrap pointer-events-auto hover:brightness-125 transition inline-flex items-center justify-center"
              style={{ ...pos, animationDelay: `${i * 0.6}s` }}
            >
              <span className="hero-chip-n">{cat.number}</span>
              <span className="mx-1.5 opacity-40">·</span>
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Content — top padding always clears the fixed nav (~5.5rem) */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 md:px-8 flex-1 flex flex-col justify-center pt-28 sm:pt-32 pb-20 sm:pb-20">
        <MicroLabel n="00">{c.heroLabel}</MicroLabel>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
          className="display-xl mt-4 sm:mt-6 leading-[0.85] tracking-tighter"
          // Capped by viewport HEIGHT too, so a wide-but-short laptop window
          // never inflates the headline until it crowds the nav.
          style={{ fontSize: "clamp(2.75rem, min(13vw, 18svh), 12rem)" }}
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
    let onScreen = true;
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
    // Pause the drift loop entirely when the hero is scrolled away — no reason
    // to spend a rAF every frame moving an off-screen rail.
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
    io.observe(rail);
    const tick = () => {
      if (onScreen && !document.hidden) {
        const half = rail.scrollWidth / 2;
        if (half > rail.clientWidth) {
          if (!engaged && Date.now() - lastUser > 2200) rail.scrollLeft += 0.5;
          // seamless wrap in both directions
          if (rail.scrollLeft >= half) rail.scrollLeft -= half;
          else if (rail.scrollLeft <= 0) rail.scrollLeft += half;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
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
        <Link
          key={c.slug + i}
          to="/products"
          search={{ cat: c.slug }}
          aria-label={`Browse ${c.name}`}
          // inline-flex + items-center: the coarse-pointer rule grows these
          // links to a 44px target, and without flex centering the text sat
          // pinned to the top edge of the pill.
          className="shrink-0 hero-chip rounded-full px-4 py-2 text-[10px] tracking-widest uppercase whitespace-nowrap inline-flex items-center justify-center"
        >
          <span className="hero-chip-n">{c.number}</span>
          <span className="mx-1.5 opacity-40">·</span>
          {c.name}
        </Link>
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
                loading="lazy"
                decoding="async"
                src={img(0)}
                alt="Manufacturing plant"
                className="h-48 sm:h-56 w-full rounded-2xl object-cover shadow-xl"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              />
              <motion.img
                loading="lazy"
                decoding="async"
                src={img(1)}
                alt="Laboratory"
                className="h-48 sm:h-56 w-full rounded-2xl object-cover shadow-xl"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              />
              <motion.img
                loading="lazy"
                decoding="async"
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
                loading="lazy"
                decoding="async"
                src={img(0)}
                alt="Manufacturing plant"
                className="absolute top-0 left-0 h-72 w-72 rounded-3xl object-cover shadow-2xl hover-lift"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ transform: "rotate(-4deg)" }}
              />
              <motion.img
                loading="lazy"
                decoding="async"
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
                loading="lazy"
                decoding="async"
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
      {/* wwm-media scales with viewport HEIGHT so the pinned rail always fits
          short laptop screens — the fixed heights used to clip the buttons. */}
      <div className="relative wwm-media overflow-hidden shrink-0">
        <img
          src={c.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
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
          {/* Short fixed label: "Explore Cooling Tower Chemicals" wrapped to
              two lines on narrow cards and broke the card rhythm. */}
          <LiquidButton
            to="/products"
            search={{ cat: c.slug }}
            size="md"
            className="whitespace-nowrap"
          >
            Explore range
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
        className="display-xl mt-2.5 grad-text max-w-4xl"
        // Height-capped: inside a pinned 100svh band the heading must share
        // the viewport with a full card row, even on short laptop screens.
        style={{ fontSize: "clamp(1.9rem, min(5vw, 7.5svh), 3.75rem)" }}
      >
        {c.makeHeading}
      </h2>
    </div>
  );
}

// One signature interaction at EVERY breakpoint: the section pins in the
// viewport and the card rail glides horizontally, driven by the visitor's own
// vertical scroll — phones included. Native scroll stays in charge (nothing is
// hijacked; reverse scrolling rewinds), a progress line shows how much of the
// rail remains, and the cards render at full fidelity.
function WhatWeMake() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { data: categories } = useCategories();

  // The cards arrive from Firestore after mount, so the track grows without a
  // window resize ever firing — observe the track itself (and re-measure when
  // the category count changes) or the rail pins with zero travel and the
  // cards just sit there.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [categories.length]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const progressX = useTransform(scrollYProgress, [0, 1], [0.06, 1]);

  return (
    <section
      ref={sectionRef}
      className="section-dark relative"
      style={{ height: `calc(100svh + ${distance}px)` }}
    >
      <div className="wwm-sticky sticky top-0 h-[100svh] flex flex-col justify-center overflow-hidden py-14 lg:py-16">
        <WhatWeMakeHeading />
        {/* Horizontal progress — tells the visitor this band travels sideways
            and exactly how much of it is left. */}
        <div className="mx-auto max-w-7xl px-6 md:px-8 w-full shrink-0">
          <div className="mt-4 flex items-center gap-3 max-w-xs">
            <div className="h-[3px] flex-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                style={{ scaleX: progressX }}
                className="h-full w-full origin-left rounded-full bg-gradient-to-r from-royal via-cyan-hi to-leaf"
              />
            </div>
            <span className="micro-label !text-[9px] whitespace-nowrap opacity-70">
              Scroll to explore
            </span>
          </div>
        </div>
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="mt-6 lg:mt-8 flex gap-4 lg:gap-5 pl-5 sm:pl-6 md:pl-8 w-max"
        >
          {categories.slice(0, 5).map((c) => (
            <div
              key={c.slug}
              className="w-[80vw] max-w-[340px] sm:w-[52vw] md:w-[40vw] lg:w-[26vw] xl:w-[22vw] lg:max-w-none shrink-0"
            >
              <CategoryCard c={c} />
            </div>
          ))}
          <div className="w-[80vw] max-w-[340px] sm:w-[52vw] md:w-[40vw] lg:w-[26vw] xl:w-[22vw] lg:max-w-none shrink-0">
            <ViewAllCard />
          </div>
          <div className="shrink-0 w-1 lg:pr-6 md:pr-8" aria-hidden />
        </motion.div>
      </div>
    </section>
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
  const { data: c } = useHomeContent();
  const stations = c.journey;
  return (
    <section className="section-dark relative overflow-hidden py-24 md:py-28">
      <div className="mx-auto max-w-7xl w-full px-6 md:px-8">
        <MicroLabel n="06">How water gets treated</MicroLabel>
        <h2
          className="display-xl mt-3 grad-text max-w-4xl"
          style={{ fontSize: "clamp(2.25rem, 8vw, 5rem)" }}
        >
          {c.journeyHeading}
        </h2>
        <p className="mt-4 max-w-xl text-white/60">{c.journeySubtitle}</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5 mt-12">
          {stations.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ delay: (i % 5) * 0.08 }}
              className="relative overflow-hidden rounded-2xl p-5 min-h-[180px] flex flex-col justify-end glass"
            >
              <img
                src={s.img}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
              <div className="relative micro-label">{String(i + 1).padStart(2, "0")}</div>
              <div className="relative display-xl text-xl mt-2 text-on-media">{s.title}</div>
              <p className="relative text-sm mt-2 text-on-media-soft">{s.body}</p>
            </motion.div>
          ))}
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
                      loading="lazy"
                      decoding="async"
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
      {/* Decorative watermark: in normal flow below the grid on phones (it
          used to sit behind the last card and read as a cropped glitch);
          bottom-right anchored only where there's clear space. */}
      <GhostWord className="max-md:mt-10 max-md:text-center md:absolute md:bottom-2 md:right-0 text-[22vw]">
        PURITY
      </GhostWord>
    </section>
  );
}

/* =============== 07 PROOF =============== */

// Accent tints rotate per card; every third card flips to a solid gradient so
// the rail reads as a designed set, not a repeated template.
const QUOTE_HUES = ["var(--cyan-hi)", "var(--leaf)", "var(--royal)"];

function QuoteCard({ t, i }: { t: import("@/data/content").Testimonial; i: number }) {
  const solid = i % 3 === 1;
  const hue = QUOTE_HUES[i % QUOTE_HUES.length];
  const stars = Math.min(5, Math.max(0, Number(t.rating ?? 0) || 0));
  return (
    <figure
      className={
        "relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-3xl p-6 sm:p-7 " +
        (solid ? "quote-card-solid" : "bento-tile")
      }
    >
      {!solid && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(120% 90% at 90% -10%, color-mix(in oklab, ${hue} 18%, transparent), transparent 60%)`,
          }}
        />
      )}
      <Quote
        aria-hidden
        className={"h-6 w-6 shrink-0 " + (solid ? "text-white/70" : "text-cyan-hi")}
      />
      {stars > 0 && (
        <span className="mt-3 flex gap-0.5" aria-label={`${stars} star rating`}>
          {Array.from({ length: stars }).map((_, k) => (
            <Star key={k} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          ))}
        </span>
      )}
      <blockquote
        className={
          "relative mt-3 flex-1 text-[15px] leading-relaxed font-medium " +
          (solid ? "text-white" : "text-foreground")
        }
      >
        “{t.q}”
      </blockquote>
      <figcaption className="relative mt-6 flex items-center gap-3">
        {t.image ? (
          <img
            src={t.image}
            alt=""
            loading="lazy"
            className="h-10 w-10 rounded-full object-cover border border-white/25"
          />
        ) : (
          <span
            className={
              "grid h-10 w-10 place-items-center rounded-full font-display font-bold text-sm " +
              (solid ? "bg-white/20 text-white" : "bg-cyan-hi/15 text-cyan-hi")
            }
          >
            {(t.who ?? "?").trim().charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <div
            className={
              "text-[11px] font-semibold tracking-[0.14em] uppercase truncate " +
              (solid ? "text-white" : "text-foreground")
            }
          >
            {t.who}
          </div>
          {t.company && (
            <div className={"mt-0.5 text-xs truncate " + (solid ? "text-white/70" : "text-ink/60")}>
              {t.company}
            </div>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

// Testimonials as a swipeable card rail with arrow paging — every quote is a
// tinted card (one card per view on phones, three on desktop) instead of one
// blockquote on a timer nobody controls.
function Proof() {
  const { data: quotes } = useTestimonials();
  const { data: c } = useHomeContent();
  const railRef = useRef<HTMLUListElement>(null);
  const [ends, setEnds] = useState({ start: true, end: false });

  // Arrow enable/disable tracks the rail's real position (rAF-coalesced).
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      setEnds({
        start: rail.scrollLeft < 24,
        end: rail.scrollLeft > rail.scrollWidth - rail.clientWidth - 24,
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    rail.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(rail);
    return () => {
      cancelAnimationFrame(raf);
      rail.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [quotes.length]);

  const page = (dir: 1 | -1) => {
    const rail = railRef.current;
    const card = rail?.querySelector("li");
    if (!rail || !card) return;
    rail.scrollBy({ left: dir * (card.clientWidth + 16), behavior: "smooth" });
  };

  const row = [...c.certs, ...c.certs];
  return (
    <section className="section-light py-28 relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <MicroLabel n="08" className="!text-royal">
              Proof
            </MicroLabel>
            <h2
              className="display-xl mt-3 max-w-2xl"
              style={{ fontSize: "clamp(2rem, 7vw, 4rem)" }}
            >
              What our clients say <span className="grad-leaf-text">about us.</span>
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => page(-1)}
              disabled={ends.start}
              aria-label="Previous testimonials"
              className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 text-foreground transition-all hover:border-cyan-hi hover:text-cyan-hi disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => page(1)}
              disabled={ends.end}
              aria-label="Next testimonials"
              className="grid h-11 w-11 place-items-center rounded-full bg-ink text-white transition-all hover:bg-cyan-hi hover:text-ink disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-bleed rail so cards peek at the viewport edge and invite a swipe */}
      <ul
        ref={railRef}
        aria-label="Client testimonials"
        className="mt-10 flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 md:px-[max(2rem,calc((100vw-80rem)/2+2rem))] pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {quotes.map((t, i) => (
          <li
            key={(t.who ?? "") + i}
            className="w-[85vw] max-w-[400px] sm:w-[46vw] lg:w-[31%] shrink-0 snap-start list-none"
          >
            <QuoteCard t={t} i={i} />
          </li>
        ))}
      </ul>

      {/* Certification strip — badge pills on a brisk marquee (pause on hover) */}
      <div className="mt-14 overflow-hidden" aria-label="Certifications">
        <div className="flex gap-3 w-max marquee-certs">
          {row.map((cert, k) => (
            <span
              key={cert + k}
              className="bento-tile shrink-0 inline-flex items-center gap-2.5 rounded-full px-5 py-2.5"
            >
              <Droplets className="h-4 w-4 text-cyan-hi shrink-0" />
              <span className="micro-label !text-[10px] whitespace-nowrap">{cert}</span>
            </span>
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
            loading="lazy"
            decoding="async"
            className="col-span-6 md:col-span-3 h-64 md:h-96 w-full object-cover rounded-3xl hover-lift"
          />
          <img
            src={img(1)}
            alt="Lab"
            loading="lazy"
            decoding="async"
            className="col-span-3 md:col-span-2 h-40 md:h-64 w-full object-cover rounded-3xl hover-lift"
          />
          <img
            src={img(2)}
            alt="Water"
            loading="lazy"
            decoding="async"
            className="col-span-3 md:col-span-1 h-40 md:h-64 w-full object-cover rounded-3xl hover-lift"
          />
          <img
            src={img(3)}
            alt="RO"
            loading="lazy"
            decoding="async"
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
            <WhatsAppButton href={waLink()}>WhatsApp us</WhatsAppButton>
            <RequestCallButton source="home:talk-to-us" />
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
