import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/lk-logo.png";
import { Waterline } from "./Waterline";
import { MapPin, Phone, Mail } from "lucide-react";
import { useSiteSettings } from "@/lib/content";

export function Footer() {
  const { data: s } = useSiteSettings();
  return (
    <footer className="relative section-dark overflow-hidden pt-16 pb-8">
      <Waterline className="absolute top-0 left-0" />
      <div className="pointer-events-none absolute inset-0 caustics opacity-40" />
      {/* Ghost brand mark — desktop only; on phones it cropped behind the
          copyright row */}
      <div className="ghost-word hidden md:block absolute -bottom-10 left-1/2 -translate-x-1/2 text-[26vw] leading-none opacity-40">
        LK
      </div>
      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
                style={{ filter: "drop-shadow(0 0 16px color-mix(in oklab, var(--cyan-hi) 45%, transparent))" }}
              />
              <div>
                <div className="font-display text-lg text-white font-bold">LK Chemicals Pvt. Ltd.</div>
                <div className="micro-label mt-1">Since 2009 · Hyderabad</div>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm text-white/60">
              Industrial water treatment chemicals and services. Engineered in Hyderabad, trusted across India.
            </p>
          </div>
          <div>
            <div className="micro-label mb-4">Explore</div>
            <ul className="space-y-2 text-sm">
              {[
                ["/about", "About"],
                ["/products", "Products"],
                ["/services", "Services"],
                ["/gallery", "Gallery"],
                ["/contact", "Contact"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-white/70 hover:text-cyan-hi transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="micro-label mb-4">Reach us</div>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5 text-cyan-hi"/> {s.address}</li>
              <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 mt-0.5 text-cyan-hi"/> <a href={`tel:${s.phone.replace(/\s+/g, "")}`} className="hover:text-white">{s.phone}</a></li>
              <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 mt-0.5 text-cyan-hi"/> <a href={`mailto:${s.email}`} className="hover:text-white">{s.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} LK Chemicals Pvt. Ltd. All rights reserved.</p>
          <p>Engineered for water. Built in Hyderabad.</p>
        </div>
      </div>
    </footer>
  );
}