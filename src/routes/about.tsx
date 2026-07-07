import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { LiquidButton } from "@/components/site/LiquidButton";
import { MicroLabel, GhostWord } from "@/components/site/GhostWord";
import { Waterline } from "@/components/site/Waterline";
import { Coverflow3D } from "@/components/site/Coverflow3D";
import plant from "@/assets/plant.jpg";
import lab from "@/assets/lab.jpg";
import drum from "@/assets/drum.jpg";
import boiler from "@/assets/boiler.jpg";
import resin from "@/assets/resin.jpg";
import ct from "@/assets/cooling-tower.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — LK Chemicals Pvt. Ltd." },
      { name: "description", content: "The story of LK Chemicals Pvt. Ltd. — Hyderabad-based manufacturer of water treatment chemicals and plants since 2013, serving Telangana, AP, Karnataka, Tamil Nadu and Maharashtra." },
      { property: "og:title", content: "About LK Chemicals" },
      { property: "og:description", content: "Manufacturing water treatment chemistry in Hyderabad since 2013." },
    ],
  }),
  component: AboutPage,
});

const milestones = [
  { year: "2013", title: "Founded in Hyderabad", body: "Shiva Krishna Kangadekar starts LK Chemicals, supplying water treatment chemicals to local industry." },
  { year: "2015", title: "Scale Master RO range", body: "Food-grade Scale Master RO antiscalants — LK 1001, LK 1010, LK 5001 — enter series manufacturing." },
  { year: "2017", title: "Cherlapally facility", body: "EC Nagar plant commissioned; the boiler (LK 2000) and cooling tower (LK 3000) formularies are added." },
  { year: "2019", title: "Service arm launched", body: "In-house descaling, CIP and plant maintenance crews for RO, boiler, cooling tower, softener and DM plants." },
  { year: "2022", title: "Plants & projects", body: "RO, DM, softener, ETP and STP plant installations grow across Telangana, AP, Karnataka, Tamil Nadu and Maharashtra." },
  { year: "2024", title: "LK Chemicals Pvt. Ltd.", body: "Incorporated as LK Chemicals Pvt. Ltd. (formerly LK Chemicals) — ISO 9001:2015, 70+ products, 10 tons a month." },
];

function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="section-dark relative pt-40 pb-20 overflow-hidden">
        <img src={plant} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 hero-lighten" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink hero-lighten-overlay" />
        <div className="absolute inset-0 caustics opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="00">About · Est. 2013 · An ISO 9001:2015 Company</MicroLabel>
          <h1 className="display-xl mt-6 grad-text" style={{ fontSize: "clamp(2.75rem, 11vw, 8rem)" }}>The story of a formula.</h1>
          <p className="mt-8 max-w-2xl text-lg text-white/70">
            LK Chemicals began with one plant, one bore well and one problem to solve. More than a decade on, we're still solving problems — just for a hundred more plants across five states.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-dark relative py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8 grid gap-16 lg:grid-cols-[220px_1fr] items-start">
          <div className="sticky top-32 self-start hidden lg:block">
            <div className="display-xl text-8xl grad-text">2013<br/>→<br/><span className="grad-leaf-text">TODAY</span></div>
          </div>
          <ol className="relative border-l border-white/10 pl-6 md:pl-10 space-y-10">
            {milestones.map((m, i) => (
              <motion.li
                key={m.year}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ delay: i * 0.05 }}
                className="relative glass-dark rounded-2xl p-6"
              >
                <span className="absolute -left-[34px] top-6 h-3 w-3 rounded-full bg-cyan-hi shadow-[0_0_18px_var(--cyan-hi)]" />
                <div className="micro-label">{m.year}</div>
                <h3 className="display-xl text-2xl mt-2 text-white">{m.title}</h3>
                <p className="mt-2 text-white/60">{m.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <Waterline />

      {/* Mission */}
      <section className="section-light py-32 relative overflow-hidden">
        <GhostWord className="absolute top-0 left-1/2 -translate-x-1/2 text-[22vw]">MISSION</GhostWord>
        <div className="relative mx-auto max-w-6xl px-6 md:px-8">
          <MicroLabel n="01" className="!text-royal">Mission</MicroLabel>
          <p className="display-xl mt-6 leading-[0.95]" style={{ fontSize: "clamp(2rem, 7vw, 5rem)" }}>
            To make Indian industry's water <span className="grad-leaf-text">cleaner, safer and cheaper to treat</span> — one formulated drum at a time.
          </p>
        </div>
      </section>

      <section className="section-dark py-32 relative overflow-hidden">
        <GhostWord className="absolute top-0 left-1/2 -translate-x-1/2 text-[22vw]">VISION</GhostWord>
        <div className="relative mx-auto max-w-6xl px-6 md:px-8">
          <MicroLabel n="02">Vision</MicroLabel>
          <p className="display-xl mt-6 leading-[0.95] grad-text" style={{ fontSize: "clamp(2rem, 7vw, 5rem)" }}>
            To become South India's most trusted name in industrial water chemistry.
          </p>
        </div>
      </section>

      {/* Infrastructure strip */}
      <section className="section-dark py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="03">Infrastructure</MicroLabel>
          <h2 className="display-xl mt-3 grad-text" style={{ fontSize: "clamp(2.25rem, 8vw, 5rem)" }}>Built for batches.</h2>
        </div>
        <InfrastructureCarousel />
      </section>

      {/* Values orbit */}
      <section className="section-light py-32 relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <MicroLabel n="04" className="!text-royal">Values</MicroLabel>
          <h2 className="display-xl mt-3" style={{ fontSize: "clamp(2.25rem, 8vw, 5rem)" }}>What we won't compromise on.</h2>
          {/* Desktop / tablet: grid. Mobile: 3D easel rail (auto + touch). */}
          <div className="mt-16 hidden md:grid md:grid-cols-3 gap-6">
            {values.map((v) => <ValueCard key={v.t} {...v} />)}
          </div>
          <Coverflow3D
            className="mt-10 md:hidden -mx-6"
            variant="x"
            autoMs={3400}
            cardClass="w-[76vw]"
            items={values.map((v) => <ValueCard key={v.t} {...v} />)}
          />
        </div>
      </section>

      <section className="section-dark py-24 text-center">
        <div className="mx-auto max-w-3xl px-6 md:px-8">
          <h2 className="display-xl grad-text" style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}>Want to see it for yourself?</h2>
          <p className="mt-4 text-white/60">Schedule a plant visit or an on-site water survey.</p>
          <div className="mt-8 flex justify-center gap-3">
            <LiquidButton to="/contact" size="lg">Book a visit</LiquidButton>
          </div>
        </div>
      </section>
    </>
  );
}

/* =============== VALUES =============== */

const values = [
  { t: "Integrity", b: "A datasheet you can hold us to.", img: lab },
  { t: "Chemistry", b: "Formulations that work, not slogans.", img: drum },
  { t: "Response", b: "The phone answers. Every time.", img: plant },
  { t: "Safety", b: "Handling, storage and transport — no shortcuts.", img: boiler },
  { t: "Consistency", b: "Batch #4501 is identical to #0001.", img: resin },
  { t: "Partnership", b: "We show up when the plant is down.", img: ct },
];

function ValueCard({ t, b, img }: { t: string; b: string; img: string }) {
  return (
    <div className="group relative hover-lift rounded-3xl overflow-hidden min-h-[220px] h-full flex flex-col justify-end p-6">
      <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
      <h3 className="relative display-xl text-2xl text-on-media">{t}</h3>
      <p className="relative mt-2 text-sm text-on-media-soft">{b}</p>
    </div>
  );
}

/* =============== INFRASTRUCTURE 3D AUTO-SCROLL =============== */

const facilities = [
  { t: "Manufacturing", img: plant, body: "Blending, reactor and dosing lines under a single roof at Cherlapally." },
  { t: "Quality Control", img: lab, body: "Every batch tested for pH, density, active content and appearance." },
  { t: "Packaging", img: drum, body: "25 kg jerry cans to 1 ton IBCs — food-grade, UN-approved drums." },
  { t: "Warehouse", img: plant, body: "Racked bulk storage, FIFO despatch, transporter-agnostic loading bay." },
  { t: "Technical Support", img: lab, body: "A chemist on the phone, a service crew on the road." },
];

function FacilityCard({ s }: { s: (typeof facilities)[number] }) {
  return (
    <div className="glass-dark rounded-3xl overflow-hidden hover-lift h-full">
      <img src={s.img} alt={s.t} className="h-52 w-full object-cover" />
      <div className="p-6">
        <div className="micro-label">Facility</div>
        <h3 className="display-xl text-2xl text-white mt-2">{s.t}</h3>
        <p className="text-sm text-white/60 mt-2">{s.body}</p>
      </div>
    </div>
  );
}

function InfrastructureCarousel() {
  const row = [...facilities, ...facilities];
  return (
    <>
      {/* Desktop: the endless 3D drift (hover to pause) */}
      <div className="mt-12 hidden lg:block [perspective:1600px]">
        <div className="facility-track flex gap-6 w-max px-6 md:px-8 [transform-style:preserve-3d]">
          {row.map((s, i) => (
            <div
              key={s.t + i}
              className="facility-card shrink-0 w-[min(380px,46vw)]"
              style={{ transform: `rotateY(${i % 2 === 0 ? -14 : 14}deg)` }}
            >
              <FacilityCard s={s} />
            </div>
          ))}
        </div>
      </div>
      {/* Mobile / tablet: 3D coverflow rail — auto-drifts, thumb takes over */}
      <Coverflow3D
        className="mt-10 lg:hidden"
        variant="y"
        autoMs={3600}
        cardClass="w-[76vw] sm:w-[52vw]"
        items={facilities.map((s) => <FacilityCard key={s.t} s={s} />)}
      />
    </>
  );
}