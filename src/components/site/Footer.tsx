import { Link, useRouterState } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import logoUrl from "@/assets/lk-logo.png";
import { Waterline } from "./Waterline";
import { WhatsAppIcon } from "./WhatsApp";
import { waLink } from "./WaCluster";
import { useCategories, useServiceCategories, useSiteSettings } from "@/lib/content";
import { useGlobalContent, useHomeContent } from "@/lib/pages";

// "Phase-2" vs "Phase-II" etc. — treat cosmetic variants of the same address
// as duplicates so it never renders twice.
const normAddr = (s: string) =>
  s
    .toLowerCase()
    .replace(/phase[\s-]*ii/g, "phase 2")
    .replace(/[^a-z0-9]/g, "");

const mapsUrl = (addr: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;

export function Footer() {
  const { data: s } = useSiteSettings();
  const { data: g } = useGlobalContent();
  const { data: home } = useHomeContent();
  const { data: categories } = useCategories();
  const { data: serviceCategories } = useServiceCategories();
  const pathname = useRouterState({ select: (st) => st.location.pathname });
  const showAddress2 = Boolean(s.address2 && normAddr(s.address2) !== normAddr(s.address));
  const phone = s.phone.replace(/\s+/g, "");

  return (
    <footer className="relative section-dark overflow-hidden pt-16 pb-24 sm:pb-8">
      <Waterline className="absolute top-0 left-0" />
      <div className="pointer-events-none absolute inset-0 caustics opacity-40" />
      {/* Ghost brand mark — fully inside the footer at every width */}
      <div className="ghost-word absolute bottom-0 left-1/2 -translate-x-1/2 text-[clamp(5rem,22vw,18rem)] leading-none opacity-40">
        LK
      </div>
      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        {/* Top band: brand story + direct channels */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
                style={{
                  filter:
                    "drop-shadow(0 0 16px color-mix(in oklab, var(--cyan-hi) 45%, transparent))",
                }}
              />
              <div>
                <div className="font-display text-lg text-white font-bold">{g.brandName}</div>
                <div className="micro-label mt-1">{g.brandLine}</div>
              </div>
            </div>
            <p className="mt-5 text-sm text-white/60">{g.footerBlurb}</p>
            {/* Credential chips — quiet, factual, scannable */}
            <div className="mt-5 flex flex-wrap gap-2">
              {home.certs.slice(0, 4).map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/70"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#fff" }}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium shadow-[0_10px_30px_-12px_rgba(37,211,102,0.8)] transition-all hover:brightness-110"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={`tel:${phone}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cyan-hi px-5 py-2.5 text-sm font-semibold text-ink shadow-[0_10px_30px_-12px_var(--cyan-hi)] transition-all hover:brightness-110"
            >
              <Phone className="h-4 w-4" /> {s.phone}
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Catalog — live from the dashboard */}
          <div>
            <div className="micro-label mb-4">Chemicals</div>
            <ul className="space-y-2 text-sm">
              {categories.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/products"
                    search={{ cat: c.slug }}
                    className="text-white/70 hover:text-cyan-hi transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/products" className="text-cyan-hi hover:underline underline-offset-4">
                  View all products →
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="micro-label mb-4">Services</div>
            <ul className="space-y-2 text-sm">
              {serviceCategories.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/services/$category"
                    params={{ category: c.slug }}
                    className="text-white/70 hover:text-cyan-hi transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/services" className="text-cyan-hi hover:underline underline-offset-4">
                  View all services →
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="micro-label mb-4">Explore</div>
            <ul className="space-y-2 text-sm">
              {[
                ["/about", "About"],
                ["/products", "Products"],
                ["/services", "Services"],
                ["/gallery", "Gallery"],
                ["/careers", "Careers"],
                ["/contact", "Contact"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={() => {
                      if (pathname === to) window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-white/70 hover:text-cyan-hi transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="micro-label mb-4">Reach us</div>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-cyan-hi" />
                <a
                  href={mapsUrl(s.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  {s.address}
                </a>
              </li>
              {showAddress2 && (
                <li className="flex gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-cyan-hi" />
                  <a
                    href={mapsUrl(s.address2!)}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white"
                  >
                    {s.address2}
                  </a>
                </li>
              )}
              <li className="flex gap-2">
                <Phone className="h-4 w-4 shrink-0 mt-0.5 text-cyan-hi" />{" "}
                <a href={`tel:${phone}`} className="hover:text-white">
                  {s.phone}
                </a>
              </li>
              {s.phone2 && (
                <li className="flex gap-2">
                  <Phone className="h-4 w-4 shrink-0 mt-0.5 text-cyan-hi" />{" "}
                  <a href={`tel:${s.phone2.replace(/\s+/g, "")}`} className="hover:text-white">
                    {s.phone2}
                  </a>
                </li>
              )}
              <li className="flex gap-2">
                <Mail className="h-4 w-4 shrink-0 mt-0.5 text-cyan-hi" />{" "}
                <a href={`mailto:${s.email}`} className="hover:text-white">
                  {s.email}
                </a>
              </li>
              <li className="flex gap-2">
                <Clock className="h-4 w-4 shrink-0 mt-0.5 text-cyan-hi" />
                <span>{s.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>
            © {new Date().getFullYear()} {g.brandName} All rights reserved.
          </p>
          <p>{g.footerNote}</p>
          <p>
            Designed &amp; developed by{" "}
            <a
              href="https://www.thedreamteamservices.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-cyan-hi hover:underline underline-offset-4"
            >
              Dream Team Services
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
