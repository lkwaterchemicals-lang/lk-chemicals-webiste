// Careers — join-the-crew page. Openings are fully admin-managed (the
// `careers` module in the dashboard); the page renders published roles with
// an in-page application form (saved to `applications`, reviewed in the
// admin), WhatsApp as the fast lane, and a speculative CTA when nothing is
// open.
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Clock,
  FlaskConical,
  GraduationCap,
  MapPin,
  Send,
  Truck,
  Users,
} from "lucide-react";
import { GhostWord, MicroLabel } from "@/components/site/GhostWord";
import { LiquidButton } from "@/components/site/LiquidButton";
import { ApplyDialog } from "@/components/site/ApplyDialog";
import { waLink } from "@/components/site/WaCluster";
import { useCareers, type CareerOpening } from "@/lib/content";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — LK Chemicals, Hyderabad" },
      {
        name: "description",
        content:
          "Join LK Chemicals — field service, water chemistry, plant operations and sales roles in Hyderabad. Do the work water depends on.",
      },
      { property: "og:title", content: "Careers at LK Chemicals" },
      {
        property: "og:description",
        content: "Field service, chemistry and plant operation roles in Hyderabad.",
      },
    ],
  }),
  component: CareersPage,
});

const PERKS = [
  {
    icon: Truck,
    title: "Field-first learning",
    body: "Real plants, real breakdowns, real fixes — you learn water treatment where it actually happens.",
  },
  {
    icon: FlaskConical,
    title: "Chemistry with a name on it",
    body: "Every drum we make carries a batch certificate and a person behind it. Your work is visible.",
  },
  {
    icon: GraduationCap,
    title: "Grow with the loop",
    body: "From dosing pumps to full RO trains — structured mentoring from engineers who answer at 11 PM.",
  },
  {
    icon: Users,
    title: "Small team, big plants",
    body: "No layers between you and the founder. Good work gets seen in weeks, not years.",
  },
];

function CareersPage() {
  const { data: openings } = useCareers();
  // The apply dialog target: a specific opening, "general" for a speculative
  // application, or null when closed.
  const [applyFor, setApplyFor] = useState<CareerOpening | "general" | null>(null);

  return (
    <>
      {/* Hero */}
      <section className="section-dark relative pt-40 pb-16 overflow-hidden">
        <div className="absolute inset-0 caustics opacity-40" />
        <GhostWord className="absolute right-0 bottom-0 !text-[11vw] opacity-60">CREW</GhostWord>
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="00">Careers</MicroLabel>
          <h1
            className="display-xl mt-4 grad-text"
            style={{ fontSize: "clamp(2.75rem, 10vw, 7.5rem)" }}
          >
            Do the work
            <br />
            <span className="grad-leaf-text">water depends on.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-white/70">
            Power plants, pharma, steel and sugar mills run on the water our crew keeps clean. Join
            a Hyderabad team where the chemistry, the service vans and the phone that answers are
            all ours.
          </p>
        </div>
      </section>

      {/* Why join */}
      <section className="section-light py-24 relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="01" className="!text-royal">
            Why LK
          </MicroLabel>
          <h2 className="display-xl mt-3" style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}>
            Small crew. <span className="grad-leaf-text">Serious water.</span>
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PERKS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ delay: (i % 4) * 0.07, duration: 0.5 }}
                className="bento-tile rounded-3xl p-6 hover-lift"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-hi/15 text-cyan-hi">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="display-xl mt-4 text-xl text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Openings */}
      <section className="section-dark py-24 relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="02">Open positions</MicroLabel>
          <h2 className="display-xl mt-3 grad-text" style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}>
            {openings.length > 0 ? "We're hiring." : "The bench is full — for now."}
          </h2>

          {openings.length === 0 ? (
            <div className="mt-10 rounded-3xl glass-dark p-10 text-center max-w-2xl">
              <h3 className="display-xl text-2xl text-white">No open roles right now.</h3>
              <p className="mt-2 text-white/60">
                Good people don't wait for listings — send your profile and we'll call when the
                right seat opens.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <LiquidButton onClick={() => setApplyFor("general")} variant="primary">
                  Send your resume
                </LiquidButton>
                <LiquidButton
                  href={waLink(
                    "Hi LK Chemicals, I'd like to share my profile for future openings.",
                  )}
                  external
                  variant="leaf"
                >
                  WhatsApp us
                </LiquidButton>
              </div>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {openings.map((job, i) => (
                <motion.article
                  key={job.slug ?? job.title}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-8%" }}
                  transition={{ delay: (i % 2) * 0.08, duration: 0.55 }}
                  className="group relative overflow-hidden rounded-3xl glass-dark p-7 hover-lift flex flex-col"
                >
                  <div className="pointer-events-none absolute inset-0 dot-grid opacity-20" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      {job.department && <div className="micro-label">{job.department}</div>}
                      <h3 className="display-xl mt-1.5 text-2xl sm:text-3xl text-white">
                        {job.title}
                      </h3>
                    </div>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cyan-hi/15 text-cyan-hi transition-transform duration-500 group-hover:rotate-45">
                      <Briefcase className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="relative mt-4 flex flex-wrap gap-2">
                    {job.location && <Chip icon={MapPin}>{job.location}</Chip>}
                    {job.type && <Chip icon={Clock}>{job.type}</Chip>}
                    {job.experience && <Chip icon={GraduationCap}>{job.experience}</Chip>}
                  </div>
                  {job.summary && (
                    <p className="relative mt-4 text-sm text-white/70">{job.summary}</p>
                  )}
                  {(job.responsibilities ?? []).length > 0 && (
                    <ul className="relative mt-4 space-y-1.5 text-sm text-white/60">
                      {(job.responsibilities ?? []).slice(0, 4).map((r) => (
                        <li key={r} className="flex gap-2">
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-hi" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  )}
                  {(job.requirements ?? []).length > 0 && (
                    <div className="relative mt-4">
                      <div className="micro-label">What we look for</div>
                      <ul className="mt-2 space-y-1.5 text-sm text-white/60">
                        {(job.requirements ?? []).slice(0, 4).map((r) => (
                          <li key={r} className="flex gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="relative mt-6 flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setApplyFor(job)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cyan-hi px-5 py-2.5 text-sm font-medium text-ink shadow-[0_10px_30px_-10px_var(--cyan-hi)] transition-all hover:brightness-110"
                    >
                      <Send className="h-4 w-4" /> Apply now
                    </button>
                    <a
                      href={waLink(`Hi LK Chemicals, I'd like to apply for ${job.title}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/80 transition-colors hover:border-cyan-hi hover:text-white"
                    >
                      WhatsApp <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {openings.length > 0 && (
            <p className="mt-10 text-sm text-white/50">
              Didn't find your role?{" "}
              <button
                type="button"
                onClick={() => setApplyFor("general")}
                className="text-cyan-hi underline underline-offset-4 hover:text-white transition-colors"
              >
                Send us your resume anyway
              </button>{" "}
              — good people get remembered.
            </p>
          )}
        </div>
      </section>

      <ApplyDialog
        open={applyFor !== null}
        job={applyFor === "general" ? null : applyFor}
        onClose={() => setApplyFor(null)}
      />
    </>
  );
}

function Chip({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11px] uppercase tracking-widest text-white/75">
      <Icon className="h-3 w-3 text-cyan-hi" /> {children}
    </span>
  );
}
