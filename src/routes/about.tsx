import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState, type ComponentType } from "react";
import { BadgeCheck, Linkedin, Mail, Phone, Trophy, UsersRound, X } from "lucide-react";
import { LiquidButton } from "@/components/site/LiquidButton";
import { MicroLabel, GhostWord } from "@/components/site/GhostWord";
import { Waterline } from "@/components/site/Waterline";
import { Coverflow3D } from "@/components/site/Coverflow3D";
import { useAboutContent } from "@/lib/pages";
import { useTeam } from "@/lib/content";
import { imgFallback } from "@/lib/assets";
import {
  aboutContent,
  type Achievement,
  type Credential,
  type ValueItem,
  type Facility,
} from "@/data/site";
import type { TeamMember } from "@/data/content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — LK Chemicals Pvt. Ltd." },
      {
        name: "description",
        content:
          "The story of LK Chemicals Pvt. Ltd. — Hyderabad-based manufacturer of water treatment chemicals and plants since 2013, serving Telangana, AP, Karnataka, Tamil Nadu and Maharashtra.",
      },
      { property: "og:title", content: "About LK Chemicals" },
      {
        property: "og:description",
        content: "Manufacturing water treatment chemistry in Hyderabad since 2013.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: c } = useAboutContent();
  return (
    <>
      {/* Hero */}
      <section className="section-dark relative pt-40 pb-20 overflow-hidden">
        <img
          src={c.heroImage}
          alt=""
          onError={imgFallback(aboutContent.heroImage)}
          className="absolute inset-0 h-full w-full object-cover opacity-40 hero-lighten"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink hero-lighten-overlay" />
        <div className="absolute inset-0 caustics opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="00">{c.heroLabel}</MicroLabel>
          <h1
            className="display-xl mt-6 grad-text"
            style={{ fontSize: "clamp(2.75rem, 11vw, 8rem)" }}
          >
            {c.heroHeading}
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-white/70">{c.heroBody}</p>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-dark relative py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8 grid gap-16 lg:grid-cols-[220px_1fr] items-start">
          <div className="sticky top-32 self-start hidden lg:block">
            <div className="display-xl text-8xl grad-text">
              2013
              <br />→<br />
              <span className="grad-leaf-text">TODAY</span>
            </div>
          </div>
          <ol className="relative border-l border-white/10 pl-6 md:pl-10 space-y-10">
            {c.milestones.map((m, i) => (
              <motion.li
                key={m.year + m.title}
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
        <GhostWord className="absolute top-0 left-1/2 -translate-x-1/2 text-[22vw]">
          MISSION
        </GhostWord>
        <div className="relative mx-auto max-w-6xl px-6 md:px-8">
          <MicroLabel n="01" className="!text-royal">
            Mission
          </MicroLabel>
          <p
            className="display-xl mt-6 leading-[0.95]"
            style={{ fontSize: "clamp(2rem, 7vw, 5rem)" }}
          >
            {c.missionLead} <span className="grad-leaf-text">{c.missionAccent}</span>{" "}
            {c.missionTail}
          </p>
        </div>
      </section>

      <section className="section-dark py-32 relative overflow-hidden">
        <GhostWord className="absolute top-0 left-1/2 -translate-x-1/2 text-[22vw]">
          VISION
        </GhostWord>
        <div className="relative mx-auto max-w-6xl px-6 md:px-8">
          <MicroLabel n="02">Vision</MicroLabel>
          <p
            className="display-xl mt-6 leading-[0.95] grad-text"
            style={{ fontSize: "clamp(2rem, 7vw, 5rem)" }}
          >
            {c.visionText}
          </p>
        </div>
      </section>

      {/* Infrastructure strip */}
      <section className="section-dark py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="03">Infrastructure</MicroLabel>
          <h2
            className="display-xl mt-3 grad-text"
            style={{ fontSize: "clamp(2.25rem, 8vw, 5rem)" }}
          >
            Built for batches.
          </h2>
        </div>
        <InfrastructureCarousel facilities={c.facilities} />
      </section>

      {/* Values orbit */}
      <section className="section-light py-32 relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <MicroLabel n="04" className="!text-royal">
            Values
          </MicroLabel>
          <h2 className="display-xl mt-3" style={{ fontSize: "clamp(2.25rem, 8vw, 5rem)" }}>
            What we won't compromise on.
          </h2>
          {/* Desktop / tablet: grid. Mobile: 3D easel rail (auto + touch). */}
          <div className="mt-16 hidden md:grid md:grid-cols-3 gap-6">
            {c.values.map((v) => (
              <ValueCard key={v.title} {...v} />
            ))}
          </div>
          <Coverflow3D
            className="mt-10 md:hidden -mx-6"
            variant="x"
            autoMs={3400}
            cardClass="w-[76vw]"
            items={c.values.map((v) => (
              <ValueCard key={v.title} {...v} />
            ))}
          />
        </div>
      </section>

      {/* Proof — numbers, certificates and awards. Each hides itself until the
          dashboard has something real to show (Content → About). */}
      <AchievementsSection heading={c.achievementsHeading} items={c.achievements} />
      <CredentialsSection
        n="06"
        heading={c.certificationsHeading}
        body={c.certificationsBody}
        items={c.certifications}
        label="Certifications"
        emptyImageIcon={BadgeCheck}
      />
      <CredentialsSection
        n="07"
        heading={c.awardsHeading}
        items={c.awards}
        label="Awards"
        emptyImageIcon={Trophy}
        tone="light"
      />

      {/* Founder spotlight + team — both fully admin-managed (Content → Team) */}
      <FounderSection />
      <TeamSection heading={c.teamHeading} body={c.teamBody} />

      <section className="section-dark py-24 text-center">
        <div className="mx-auto max-w-3xl px-6 md:px-8">
          <h2 className="display-xl grad-text" style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}>
            {c.ctaHeading}
          </h2>
          <p className="mt-4 text-white/60">{c.ctaBody}</p>
          <div className="mt-8 flex justify-center gap-3">
            <LiquidButton to="/contact" size="lg">
              Book a visit
            </LiquidButton>
          </div>
        </div>
      </section>
    </>
  );
}

/* =============== PROOF: NUMBERS, CERTIFICATES, AWARDS =============== */

/** Headline numbers. Renders nothing until the dashboard supplies some — an
 * empty stat strip reads as a site that hasn't been finished. */
function AchievementsSection({ heading, items = [] }: { heading?: string; items?: Achievement[] }) {
  const rows = items.filter((a) => a?.value || a?.label);
  if (!rows.length) return null;
  return (
    <section className="section-dark py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <MicroLabel n="05">Achievements</MicroLabel>
        <h2 className="display-xl mt-3 grad-text" style={{ fontSize: "clamp(2.25rem, 8vw, 5rem)" }}>
          {heading || "By the numbers."}
        </h2>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((a, i) => (
            <motion.div
              key={`${a.label}-${i}`}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ delay: (i % 4) * 0.07, duration: 0.5 }}
              className="glass-dark rounded-3xl p-7"
            >
              <div className="display-xl grad-text text-4xl sm:text-5xl leading-none">
                {a.value}
              </div>
              <div className="mt-3 text-sm font-medium text-white/90">{a.label}</div>
              {a.body && <p className="mt-2 text-[13px] leading-relaxed text-white/55">{a.body}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Certificates and awards share a shape: a title, who issued it, a year and a
 * scan worth enlarging — so they share a component and differ only in tone. */
function CredentialsSection({
  n,
  label,
  heading,
  body,
  items = [],
  emptyImageIcon: Icon,
  tone = "dark",
}: {
  n: string;
  label: string;
  heading?: string;
  body?: string;
  items?: Credential[];
  emptyImageIcon: ComponentType<{ className?: string }>;
  tone?: "dark" | "light";
}) {
  const [zoomed, setZoomed] = useState<Credential | null>(null);
  const rows = items.filter((c) => c?.title);
  if (!rows.length) return null;

  const light = tone === "light";
  return (
    <section
      className={`${light ? "section-light" : "section-dark"} py-24 relative overflow-hidden`}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <MicroLabel n={n} className={light ? "!text-royal" : undefined}>
          {label}
        </MicroLabel>
        <h2
          className={`display-xl mt-3 ${light ? "" : "grad-text"}`}
          style={{ fontSize: "clamp(2.25rem, 8vw, 5rem)" }}
        >
          {heading || label}
        </h2>
        {body && (
          <p className={`mt-4 max-w-2xl ${light ? "text-ink/70" : "text-white/60"}`}>{body}</p>
        )}

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((c, i) => (
            <motion.div
              key={`${c.title}-${i}`}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ delay: (i % 3) * 0.07, duration: 0.5 }}
              className={`group rounded-3xl overflow-hidden ${
                light ? "bento-tile" : "glass-dark"
              } hover-lift`}
            >
              {/* Certificates are portrait documents: contain, never crop, so
                  the seal and signature stay in frame. */}
              <button
                type="button"
                onClick={() => c.img && setZoomed(c)}
                className={`relative block w-full aspect-[4/3] ${
                  light ? "bg-ink/[0.04]" : "bg-white/[0.04]"
                } ${c.img ? "cursor-zoom-in" : "cursor-default"}`}
                aria-label={c.img ? `Enlarge ${c.title}` : undefined}
              >
                {c.img ? (
                  <img
                    src={c.img}
                    alt={c.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center">
                    <Icon className={`h-10 w-10 ${light ? "text-royal/30" : "text-cyan-hi/30"}`} />
                  </span>
                )}
              </button>
              <div className="p-6">
                <h3 className={`text-base font-semibold ${light ? "text-ink" : "text-white"}`}>
                  {c.title}
                </h3>
                {(c.issuer || c.year) && (
                  <div
                    className={`mt-1 text-xs uppercase tracking-widest ${
                      light ? "text-ink/50" : "text-white/45"
                    }`}
                  >
                    {[c.issuer, c.year].filter(Boolean).join(" · ")}
                  </div>
                )}
                {c.body && (
                  <p
                    className={`mt-3 text-[13px] leading-relaxed ${
                      light ? "text-ink/70" : "text-white/60"
                    }`}
                  >
                    {c.body}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox — a certificate is only proof if it can be read. */}
      {zoomed?.img && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-ink/90 p-4 backdrop-blur-sm"
          onClick={() => setZoomed(null)}
          role="dialog"
          aria-modal="true"
          aria-label={zoomed.title}
        >
          <button
            type="button"
            onClick={() => setZoomed(null)}
            aria-label="Close"
            className="icon-orb icon-orb-media absolute right-5 top-5 h-11 w-11"
          >
            <X className="h-5 w-5" />
          </button>
          <figure className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={zoomed.img}
              alt={zoomed.title}
              className="max-h-[80vh] w-auto rounded-2xl object-contain"
            />
            <figcaption className="mt-4 text-center text-sm text-white/70">
              {[zoomed.title, zoomed.issuer, zoomed.year].filter(Boolean).join(" · ")}
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}

/* =============== FOUNDER & TEAM =============== */

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

function ContactRow({ member, className = "" }: { member: TeamMember; className?: string }) {
  const links = [
    member.linkedin && {
      href: member.linkedin,
      icon: Linkedin,
      label: `${member.name} on LinkedIn`,
    },
    member.email && { href: `mailto:${member.email}`, icon: Mail, label: `Email ${member.name}` },
    member.phone && {
      href: `tel:${member.phone.replace(/\s+/g, "")}`,
      icon: Phone,
      label: `Call ${member.name}`,
    },
  ].filter(Boolean) as { href: string; icon: typeof Mail; label: string }[];
  if (links.length === 0) return null;
  return (
    <div className={"flex flex-wrap items-center gap-2.5 " + className}>
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target={l.href.startsWith("http") ? "_blank" : undefined}
          rel={l.href.startsWith("http") ? "noreferrer" : undefined}
          aria-label={l.label}
          className="icon-orb h-11 w-11"
        >
          <l.icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

function Portrait({ member, big = false }: { member: TeamMember; big?: boolean }) {
  return member.image ? (
    <img
      src={member.image}
      alt={member.name}
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  ) : (
    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-royal/45 via-ink-2 to-ink">
      <span aria-hidden className={"display-xl grad-text " + (big ? "text-8xl" : "text-5xl")}>
        {initials(member.name)}
      </span>
    </div>
  );
}

// The founder gets a cinematic spotlight of their own: portrait card on one
// side, their words on the other. Renders only when a member is flagged
// "Founder spotlight" in the dashboard.
function FounderSection() {
  const { data: team } = useTeam();
  const founder = team.find((m) => m.founder);
  if (!founder) return null;
  return (
    <section className="section-dark py-28 relative overflow-hidden">
      <GhostWord className="absolute top-0 left-1/2 -translate-x-1/2 text-[20vw]">
        FOUNDER
      </GhostWord>
      <div className="absolute inset-0 caustics opacity-25" />
      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        <MicroLabel n="05">Founder</MicroLabel>
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5"
          >
            <div className="group relative mx-auto max-w-sm lg:max-w-none aspect-[4/5] rounded-[2rem] overflow-hidden glass-dark hover-lift">
              <Portrait member={founder} big />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6">
                <div className="display-xl text-2xl sm:text-3xl text-on-media">{founder.name}</div>
                <div className="mt-1.5 micro-label">{founder.role}</div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="lg:col-span-7"
          >
            {founder.quote && (
              <blockquote
                className="display-xl grad-text leading-[1.04]"
                style={{ fontSize: "clamp(1.75rem, 4.5vw, 3.4rem)" }}
              >
                “{founder.quote}”
              </blockquote>
            )}
            {founder.bio && (
              <p className="mt-6 max-w-2xl text-base md:text-lg text-white/70">{founder.bio}</p>
            )}
            <ContactRow member={founder} className="mt-8" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Name and role live UNDER the photo, never over it — admin uploads are
// unpredictable (logos, badges, busy promos) and overlaid text was routinely
// unreadable. A square window crops any upload predictably.
//
// Two shapes, one card. `tile` is the portrait card used inside a grid.
// `row` is the editorial variant — photo left, copy right — for when there
// are only one or two people: a lone portrait tile in a 1280px band read as
// a stranded postage stamp, while a row fills the measure and gives the bio
// somewhere to breathe. Below `md` both collapse to the same stacked card,
// so phones keep the layout that already worked.
function TeamCard({
  m,
  i,
  variant = "tile",
}: {
  m: TeamMember;
  i: number;
  variant?: "tile" | "row";
}) {
  const row = variant === "row";
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ delay: (i % 4) * 0.06, duration: 0.55 }}
      className={
        "group bento-tile flex h-full overflow-hidden rounded-[1.75rem] hover-lift " +
        (row ? "flex-col md:flex-row" : "flex-col")
      }
    >
      <div
        className={
          "relative overflow-hidden " +
          (row
            ? "aspect-square shrink-0 md:aspect-auto md:w-[38%] md:min-h-[19rem] md:self-stretch"
            : "aspect-square")
        }
      >
        <Portrait member={m} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      </div>
      <div className={"flex flex-1 flex-col " + (row ? "p-6 md:justify-center md:p-8" : "p-5")}>
        <h3
          className={
            "display-xl leading-tight text-foreground " + (row ? "text-2xl md:text-3xl" : "text-xl")
          }
        >
          {m.name}
        </h3>
        <div className="mt-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-royal">
          {m.role}
        </div>
        {m.bio && (
          <p
            className={
              "mt-3 leading-relaxed text-ink/70 " +
              (row ? "text-[15px] md:line-clamp-none" : "text-sm line-clamp-3")
            }
          >
            {m.bio}
          </p>
        )}
        <ContactRow
          member={m}
          className={row ? "mt-6 !gap-2.5" : "mt-auto pt-4 !gap-2 [&>a]:h-10 [&>a]:w-10"}
        />
      </div>
    </motion.article>
  );
}

function TeamSection({ heading, body }: { heading: string; body: string }) {
  const { data: team } = useTeam();
  const members = team.filter((m) => !m.founder);
  if (members.length === 0) return null;
  return (
    <section className="section-light py-28 relative overflow-hidden">
      <GhostWord className="absolute top-0 left-1/2 -translate-x-1/2 text-[20vw]">TEAM</GhostWord>
      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <MicroLabel n="06" className="!text-royal">
              The team
            </MicroLabel>
            <h2
              className="display-xl mt-3 max-w-3xl"
              style={{ fontSize: "clamp(2.25rem, 8vw, 5rem)" }}
            >
              {heading}
            </h2>
            {body && <p className="mt-4 max-w-2xl text-ink/70">{body}</p>}
          </div>
          <span className="bento-tile hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] uppercase tracking-widest text-ink/70">
            <UsersRound className="h-3.5 w-3.5 text-cyan-hi" /> {members.length}{" "}
            {members.length === 1 ? "person" : "people"}
          </span>
        </div>

        <TeamLayout members={members} />
      </div>
    </section>
  );
}

/* The team is admin-managed, so its size is unknown at build time and changes
   over the life of the site. A fixed 3/4-column grid handled a full roster and
   nothing else: one person sat marooned in the top-left of a four-slot row,
   two left a gaping hole. So the layout is chosen from the count.

   The rule is about which SHAPE reads best at that size, not just how many
   columns to draw:

     1–2 people  editorial rows — photo left, name/role/bio right. A single
                 portrait tile centred in a 1280px band is a postage stamp
                 marooned in white space; a row fills the measure, lets the
                 whole bio show instead of clamping to three lines, and reads
                 like a leadership page rather than a half-built grid.
     3          a 3-up grid of portrait tiles, centred.
     4+         a filling grid whose column count divides the roster so the
                 last row is never left half-empty.

   Phones ignore all of it: 1–2 stack full width, 3+ become a peeking snap
   rail (a swipe rail holding one card is a rail with nowhere to swipe). */
function TeamLayout({ members }: { members: TeamMember[] }) {
  const n = members.length;

  if (n <= 2) {
    return (
      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:mt-12">
        {members.map((m, i) => (
          <TeamCard key={m.name + i} m={m} i={i} variant="row" />
        ))}
      </div>
    );
  }

  // Three or more: a peeking snap rail on phones, and a desktop grid whose
  // widest column count is chosen to leave the shortest possible gap in the
  // last row — 5 people read far better as 3+2 than as 4+1. Four beats three
  // on a tie, so bigger rosters stay compact. Class strings are written out in
  // full because Tailwind scans source text, not computed values.
  const gap = (c: number) => (c - (n % c)) % c;
  const cols =
    n === 3
      ? "mx-auto max-w-5xl md:grid-cols-3"
      : n === 4
        ? "md:grid-cols-2 lg:grid-cols-4"
        : gap(4) <= gap(3)
          ? "md:grid-cols-2 lg:grid-cols-4"
          : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <>
      <div className="mt-10 -mx-6 flex gap-4 overflow-x-auto px-6 pb-3 snap-x snap-mandatory md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {members.map((m, i) => (
          <div key={m.name + i} className="w-[74vw] max-w-[330px] shrink-0 snap-center">
            <TeamCard m={m} i={i} />
          </div>
        ))}
      </div>
      <div className={"mt-12 hidden gap-6 md:grid " + cols}>
        {members.map((m, i) => (
          <TeamCard key={m.name + i} m={m} i={i} />
        ))}
      </div>
    </>
  );
}

/* =============== VALUES =============== */

function ValueCard({ title, body, img }: ValueItem) {
  return (
    <div className="group relative hover-lift rounded-3xl overflow-hidden min-h-[220px] h-full flex flex-col justify-end p-6">
      <img
        src={img}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
      <h3 className="relative display-xl text-2xl text-on-media">{title}</h3>
      <p className="relative mt-2 text-sm text-on-media-soft">{body}</p>
    </div>
  );
}

/* =============== INFRASTRUCTURE 3D AUTO-SCROLL =============== */

function FacilityCard({ s }: { s: Facility }) {
  return (
    <div className="glass-dark rounded-3xl overflow-hidden hover-lift h-full">
      <img src={s.img} alt={s.title} className="h-52 w-full object-cover" />
      <div className="p-6">
        <div className="micro-label">Facility</div>
        <h3 className="display-xl text-2xl text-white mt-2">{s.title}</h3>
        <p className="text-sm text-white/60 mt-2">{s.body}</p>
      </div>
    </div>
  );
}

function InfrastructureCarousel({ facilities }: { facilities: Facility[] }) {
  const row = [...facilities, ...facilities];
  return (
    <>
      {/* Desktop: the endless 3D drift (hover to pause) */}
      <div className="mt-12 hidden lg:block [perspective:1600px]">
        <div className="facility-track flex gap-6 w-max px-6 md:px-8 [transform-style:preserve-3d]">
          {row.map((s, i) => (
            <div
              key={s.title + i}
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
        items={facilities.map((s) => (
          <FacilityCard key={s.title} s={s} />
        ))}
      />
    </>
  );
}
