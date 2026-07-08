import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import logoUrl from "@/assets/lk-logo.png";
import { LiquidButton } from "./LiquidButton";
import { ThemeToggle } from "./ThemeToggle";
import { useServiceCategories, useServices } from "@/lib/content";
import { iconByName } from "@/lib/icons";

type NavLink = { to: string; label: string; mega?: boolean };

const links: NavLink[] = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/services", label: "Services", mega: true },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Clicking the link for the page you're already on = back to the top.
  const samePageTop = (to: string) => {
    if (pathname === to) window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <header
        className={
          "fixed top-0 left-0 right-0 z-40 transition-all duration-500 " +
          (scrolled ? "pt-3" : "pt-6")
        }
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <nav
            className={
              "flex items-center justify-between rounded-full px-4 md:px-6 py-2.5 transition-all duration-500 " +
              (scrolled ? "glass-dark" : "bg-transparent")
            }
          >
            <Link to="/" onClick={() => samePageTop("/")} className="flex items-center gap-3 group">
              <img
                src={logoUrl}
                alt="LK Chemicals"
                width={40}
                height={40}
                className="h-10 w-10 object-contain drop-shadow-[0_0_14px_color-mix(in_oklab,var(--cyan-hi)_55%,transparent)] transition-transform group-hover:scale-105"
                style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}
              />
              <span className="hidden sm:block text-sm">
                <span className="font-display font-bold tracking-tight text-white">LK</span>
                <span className="text-white/60"> Chemicals</span>
              </span>
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              {links.map((l) =>
                l.mega ? (
                  <ServicesMenu key={l.to} pathname={pathname} samePageTop={samePageTop} />
                ) : (
                  <Link
                    key={l.to}
                    to={l.to}
                    activeOptions={{ exact: l.to === "/" }}
                    onClick={() => samePageTop(l.to)}
                    className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors relative [&.active]:text-white"
                    activeProps={{ className: "active" }}
                  >
                    {l.label}
                  </Link>
                ),
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* On mobile the toggle lives inside the menu takeover */}
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>
              <LiquidButton
                to="/contact"
                size="md"
                variant="primary"
                className="hidden md:inline-flex"
              >
                Get Quote
              </LiquidButton>
              <button
                aria-label="Open menu"
                onClick={() => setOpen(true)}
                className="lg:hidden grid h-10 w-10 place-items-center rounded-full glass-dark text-white"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile takeover */}
      <div
        className={
          "fixed inset-0 z-50 transition-all duration-500 " +
          (open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")
        }
        aria-hidden={!open}
        // inert removes the closed menu from focus/AT entirely (fixes the
        // "aria-hidden on focused ancestor" console warning)
        inert={!open}
      >
        <div className="absolute inset-0 bg-ink-2 caustics" />
        <div className="relative h-full flex flex-col">
          <div className="flex items-center justify-between px-5 pt-6">
            <span className="micro-label">Menu</span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full glass text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center px-8 gap-2 overflow-y-auto py-8">
            {links.map((l, i) =>
              l.mega ? (
                <MobileServices
                  key={l.to}
                  index={i}
                  open={open}
                  onNavigate={() => {
                    setOpen(false);
                    samePageTop(l.to);
                  }}
                />
              ) : (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => {
                    setOpen(false);
                    samePageTop(l.to);
                  }}
                  className="display-xl text-5xl sm:text-6xl grad-text opacity-0 translate-y-3"
                  style={{ animation: open ? `fade-in .6s ${i * 0.06}s forwards` : "none" }}
                >
                  {l.label}
                </Link>
              ),
            )}
          </div>
          <div className="p-6">
            <LiquidButton to="/contact" size="lg" onClick={() => setOpen(false)}>
              Get a Quote
            </LiquidButton>
          </div>
        </div>
        <style>{`@keyframes fade-in { to { opacity: 1; transform: translateY(0) } }`}</style>
      </div>
    </>
  );
}

/* --------------------------------------------------- desktop services mega-menu */

function ServicesMenu({
  pathname,
  samePageTop,
}: {
  pathname: string;
  samePageTop: (to: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { data: categories } = useServiceCategories();
  const { data: services } = useServices();
  const active = pathname.startsWith("/services");

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        to="/services"
        onClick={() => {
          setOpen(false);
          samePageTop("/services");
        }}
        className={
          "flex items-center gap-1 px-4 py-2 text-sm transition-colors " +
          (active ? "text-white" : "text-white/70 hover:text-white")
        }
        aria-expanded={open}
      >
        Services
        <ChevronDown className={"h-3.5 w-3.5 transition-transform " + (open ? "rotate-180" : "")} />
      </Link>

      {open && categories.length > 0 && (
        <div className="absolute left-1/2 top-full -translate-x-1/2 pt-3">
          <div className="glass-dark rounded-2xl p-5 w-[min(88vw,760px)] shadow-2xl border border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
              {categories.map((cat) => {
                const Icon = iconByName(cat.iconName);
                const list = services.filter((s) => s.serviceCategory === cat.slug);
                return (
                  <div key={cat.slug} className="min-w-0">
                    <Link
                      to="/services/$category"
                      params={{ category: cat.slug }}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 text-sm font-semibold text-white hover:text-cyan-hi transition-colors"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-cyan-hi/15 text-cyan-hi">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate">{cat.name}</span>
                    </Link>
                    {list.length > 0 && (
                      <ul className="mt-2 space-y-1.5 pl-8">
                        {list.slice(0, 5).map((s) => (
                          <li key={s.slug}>
                            <Link
                              to="/services/$category/$service"
                              params={{ category: cat.slug, service: s.slug }}
                              onClick={() => setOpen(false)}
                              className="block truncate text-[13px] text-white/55 hover:text-white transition-colors"
                            >
                              {s.name}
                            </Link>
                          </li>
                        ))}
                        {list.length > 5 && (
                          <li>
                            <Link
                              to="/services/$category"
                              params={{ category: cat.slug }}
                              onClick={() => setOpen(false)}
                              className="block text-[12px] text-cyan-hi/80 hover:text-cyan-hi"
                            >
                              +{list.length - 5} more →
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------- mobile services accordion */

function MobileServices({
  index,
  open,
  onNavigate,
}: {
  index: number;
  open: boolean;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { data: categories } = useServiceCategories();
  const { data: services } = useServices();

  return (
    <div
      className="opacity-0 translate-y-3"
      style={{ animation: open ? `fade-in .6s ${index * 0.06}s forwards` : "none" }}
    >
      <div className="flex items-center gap-3">
        <Link
          to="/services"
          onClick={onNavigate}
          className="display-xl text-5xl sm:text-6xl grad-text"
        >
          Services
        </Link>
        {categories.length > 0 && (
          <button
            type="button"
            aria-label={expanded ? "Collapse services" : "Expand services"}
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full glass text-white"
          >
            <ChevronDown
              className={"h-5 w-5 transition-transform " + (expanded ? "rotate-180" : "")}
            />
          </button>
        )}
      </div>
      {expanded && categories.length > 0 && (
        <div className="mt-3 ml-1 space-y-3 border-l border-white/10 pl-4">
          {categories.map((cat) => {
            const list = services.filter((s) => s.serviceCategory === cat.slug);
            return (
              <div key={cat.slug}>
                <Link
                  to="/services/$category"
                  params={{ category: cat.slug }}
                  onClick={onNavigate}
                  className="block text-lg font-semibold text-white"
                >
                  {cat.name}
                </Link>
                {list.length > 0 && (
                  <ul className="mt-1 space-y-1">
                    {list.map((s) => (
                      <li key={s.slug}>
                        <Link
                          to="/services/$category/$service"
                          params={{ category: cat.slug, service: s.slug }}
                          onClick={onNavigate}
                          className="block text-sm text-white/55"
                        >
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
