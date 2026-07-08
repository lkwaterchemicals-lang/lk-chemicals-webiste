import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Minus } from "lucide-react";
import { MicroLabel, GhostWord } from "@/components/site/GhostWord";
import { LiquidButton } from "@/components/site/LiquidButton";
import { waLink } from "@/components/site/WaCluster";
import { useServices } from "@/lib/content";
import { useServicesContent } from "@/lib/pages";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — LK Chemicals" },
      {
        name: "description",
        content:
          "Industrial water treatment services — RO plant servicing, boiler, chiller, condenser, heat exchanger, moulds, AHU and pipeline descaling, softener and DM plant service, resin cleaning, ETP & STP services, HVAC AMCs and consultation.",
      },
      { property: "og:title", content: "Field Operations — LK Chemicals" },
      { property: "og:description", content: "We don't just supply. We service." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services } = useServices();
  const { data: c } = useServicesContent();
  const [open, setOpen] = useState<string | null>("01");
  return (
    <>
      <section className="section-dark relative pt-40 pb-16 overflow-hidden">
        <div className="absolute inset-0 caustics opacity-40" />
        <GhostWord className="absolute right-0 bottom-0 !text-[11vw] opacity-60">SERVICE</GhostWord>
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel n="00">Field operations</MicroLabel>
          <h1
            className="display-xl mt-4 grad-text"
            style={{ fontSize: "clamp(2.75rem, 11vw, 8rem)" }}
          >
            {c.heroTitleTop}
            <br />
            <span className="grad-leaf-text">{c.heroTitleBottom}</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-white/70">
            {services.length > 0
              ? `${services.length} service lines run out of Hyderabad, backed by our own chemistry, our own crew and our own vehicles.`
              : "Our field operations, backed by our own chemistry, crew and vehicles."}
          </p>
        </div>
      </section>

      <section className="section-dark py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          {services.length === 0 && (
            <div className="rounded-3xl glass-dark p-10 text-center">
              <h2 className="display-xl text-2xl text-white">Services are being set up.</h2>
              <p className="mt-2 text-white/60">
                Service lines appear here as soon as they're published from the dashboard.
              </p>
            </div>
          )}
          {services.map((s) => {
            const isOpen = open === s.n;
            return (
              <motion.div
                key={s.n}
                layout
                onClick={() => setOpen(isOpen ? null : s.n)}
                className={
                  "cursor-pointer border-b border-white/10 py-8 md:py-10 group " +
                  (isOpen ? "" : "")
                }
              >
                <motion.div layout className="flex items-center gap-3 sm:gap-4 md:gap-8">
                  <span className="display-xl text-2xl sm:text-3xl md:text-5xl text-white/40 group-hover:text-cyan-hi transition-colors shrink-0">
                    {s.n}
                  </span>
                  <h2
                    className="display-xl flex-1 min-w-0 text-white group-hover:grad-text transition-colors"
                    style={{ fontSize: "clamp(1.35rem, 4.5vw, 3.5rem)" }}
                  >
                    {s.t}
                  </h2>
                  <span className="grid h-11 w-11 place-items-center rounded-full glass shrink-0">
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </motion.div>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-8 grid md:grid-cols-2 gap-8 overflow-hidden"
                  >
                    <img
                      src={s.img}
                      alt=""
                      className="w-full h-64 md:h-80 object-cover rounded-3xl"
                    />
                    <div>
                      <p className="text-white/80 text-lg">{s.body}</p>
                      <div className="mt-4 micro-label">What's included</div>
                      <ul className="mt-3 space-y-2 text-white/70">
                        {s.inc.map((i) => (
                          <li key={i}>— {i}</li>
                        ))}
                      </ul>
                      <div className="mt-8 flex gap-3">
                        <LiquidButton
                          href={waLink(`Hi LK Chemicals, I'd like a service quote for ${s.t}.`)}
                          external
                          variant="leaf"
                        >
                          WhatsApp
                        </LiquidButton>
                        <LiquidButton to="/contact">Send enquiry</LiquidButton>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="section-light py-28 relative overflow-hidden">
        <GhostWord className="absolute top-0 right-0 !text-[12vw] opacity-50">PROCESS</GhostWord>
        <div className="relative mx-auto max-w-7xl px-6 md:px-8">
          <MicroLabel className="!text-royal">Service process</MicroLabel>
          <h2 className="display-xl mt-3" style={{ fontSize: "clamp(2.25rem, 8vw, 5rem)" }}>
            {c.processHeading}
          </h2>
          <div className="mt-14 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {c.processSteps.map((step, i) => (
              <div
                key={step.title}
                className="group relative overflow-hidden rounded-2xl bg-white border border-ink/10 p-5 hover-lift"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-royal via-cyan-hi to-leaf opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="micro-label !text-royal">{String(i + 1).padStart(2, "0")}</div>
                <div className="display-xl text-xl mt-2 text-ink">{step.title}</div>
                <p className="mt-2 text-xs text-ink/60 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
