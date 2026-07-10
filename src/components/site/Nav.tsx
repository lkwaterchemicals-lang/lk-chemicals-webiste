// Site navigation.
//
// Desktop: "Products" and "Services" are mega-menu triggers — hovering (or
// focusing) drops a panel of the live categories straight from Firestore, so
// a visitor reaches any category in one move without passing through an index
// page. Clicking the trigger still navigates to the index. Mobile: the
// full-screen takeover gains drill-in submenus — tap Products/Services, a
// panel slides in with a Back button and the category list.
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowUpRight, ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import logoUrl from "@/assets/lk-logo.png";
import { useCategories, useServiceCategories } from "@/lib/content";
import { iconByName } from "@/lib/icons";
import { LiquidButton } from "./LiquidButton";
import { ThemeToggle } from "./ThemeToggle";

type MegaItem = {
  key: string;
  name: string;
  tagline?: string;
  iconName?: string;
  link: { to: string; params?: Record<string, string>; search?: Record<string, string> };
};

const PLAIN_LINKS: { to: string; label: string }[] = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/gallery", label: "Gallery" },
  { to: "/careers", label: "Careers" },
  { to: "/contact", label: "Contact" },
];

function useMegaData() {
  const { data: categories } = useCategories();
  const { data: serviceCategories } = useServiceCategories();
  const products: MegaItem[] = categories.map((c) => ({
    key: c.slug,
    name: c.name,
    tagline: c.tagline,
    iconName: c.iconName,
    link: { to: "/products", search: { cat: c.slug } },
  }));
  const services: MegaItem[] = serviceCategories.map((c) => ({
    key: c.slug,
    name: c.name,
    tagline: c.tagline,
    iconName: c.iconName,
    link: { to: "/services/$category", params: { category: c.slug } },
  }));
  return { products, services };
}

/* ------------------------------------------------------- desktop dropdown */

function MegaDropdown({
  label,
  to,
  items,
  onNavigate,
}: {
  label: string;
  to: string;
  items: MegaItem[];
  onNavigate: (to: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(0);

  const show = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    clearTimeout(closeTimer.current);
    // Grace period so the pointer can cross the gap into the panel.
    closeTimer.current = window.setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open]);

  return (
    <div
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Link
        to={to}
        aria-expanded={open}
        onClick={() => {
          setOpen(false);
          onNavigate(to);
        }}
        className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white/70 hover:text-white transition-colors relative [&.active]:text-white"
        activeProps={{ className: "active" }}
      >
        {label}
        <ChevronDown
          className={"h-3.5 w-3.5 transition-transform duration-300 " + (open ? "rotate-180" : "")}
          aria-hidden
        />
      </Link>
      <AnimatePresence>
        {open && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
            className="absolute left-1/2 top-full z-50 w-[36rem] -translate-x-1/2 pt-3"
          >
            <div className="nav-mega-panel rounded-2xl p-2.5">
              <div className="grid grid-cols-2 gap-1">
                {items.map((it) => {
                  const Icon = iconByName(it.iconName);
                  return (
                    <Link
                      key={it.key}
                      to={it.link.to as never}
                      params={it.link.params as never}
                      search={it.link.search as never}
                      onClick={() => setOpen(false)}
                      className="nav-mega-item group flex items-center gap-3 rounded-xl px-3 py-2.5"
                    >
                      <span className="nav-mega-icon grid h-9 w-9 shrink-0 place-items-center rounded-lg">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold">{it.name}</span>
                        {it.tagline && (
                          <span className="nav-mega-sub block truncate text-[11px]">
                            {it.tagline}
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>
              <Link
                to={to}
                onClick={() => setOpen(false)}
                className="nav-mega-all mt-1.5 flex items-center justify-between rounded-xl px-4 py-2.5 text-[12px] font-semibold uppercase tracking-widest"
              >
                View all {label.toLowerCase()}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------- nav */

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<"products" | "services" | null>(null);
  const { products, services } = useMegaData();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Clicking the link for the page you're already on = back to the top.
  const samePageTop = (to: string) => {
    if (pathname === to) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 40);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) {
      // Drop focus from inside the menu before it becomes inert — a focused
      // descendant in a hidden subtree trips the browser's a11y warning.
      (document.activeElement as HTMLElement | null)?.blur?.();
      setSub(null);
    }
  }, [open]);

  const closeMenu = (to?: string) => {
    setOpen(false);
    if (to) samePageTop(to);
  };

  const subData = sub === "products" ? products : services;
  const subLabel = sub === "products" ? "Products" : "Services";
  const subAllLink = sub === "products" ? "/products" : "/services";

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
              <Link
                to="/"
                activeOptions={{ exact: true }}
                onClick={() => samePageTop("/")}
                className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors relative [&.active]:text-white"
                activeProps={{ className: "active" }}
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => samePageTop("/about")}
                className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors relative [&.active]:text-white"
                activeProps={{ className: "active" }}
              >
                About
              </Link>
              <MegaDropdown
                label="Products"
                to="/products"
                items={products}
                onNavigate={samePageTop}
              />
              <MegaDropdown
                label="Services"
                to="/services"
                items={services}
                onNavigate={samePageTop}
              />
              {PLAIN_LINKS.filter((l) => !["/", "/about"].includes(l.to)).map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => samePageTop(l.to)}
                  className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors relative [&.active]:text-white"
                  activeProps={{ className: "active" }}
                >
                  {l.label}
                </Link>
              ))}
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
        // inert alone removes the closed menu from focus/AT entirely; adding
        // aria-hidden on top is what triggered the "blocked aria-hidden on a
        // focused ancestor" console warning, so it stays off.
        inert={!open}
      >
        <div className="absolute inset-0 bg-ink-2 caustics" />
        <div className="relative h-full flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-6">
            <span className="micro-label">{sub ? subLabel : "Menu"}</span>
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

          {/* Two sliding panes: root links ↔ category drill-in */}
          <div className="relative flex-1 min-h-0">
            {/* Root pane */}
            <div
              className={
                "absolute inset-0 flex flex-col justify-center px-8 gap-1.5 transition-all duration-400 " +
                (sub
                  ? "-translate-x-10 opacity-0 pointer-events-none"
                  : "translate-x-0 opacity-100")
              }
            >
              {(
                [
                  { label: "Home", to: "/" },
                  { label: "About", to: "/about" },
                  { label: "Products", drill: "products" as const },
                  { label: "Services", drill: "services" as const },
                  { label: "Gallery", to: "/gallery" },
                  { label: "Careers", to: "/careers" },
                  { label: "Contact", to: "/contact" },
                ] as const
              ).map((l, i) => {
                const cls =
                  "display-xl text-[2.6rem] sm:text-6xl grad-text opacity-0 translate-y-3";
                const style = {
                  animation: open && !sub ? `fade-in .6s ${i * 0.05}s forwards` : "none",
                } as const;
                return "drill" in l ? (
                  <button
                    key={l.label}
                    type="button"
                    onClick={() => setSub(l.drill)}
                    className={cls + " flex items-center justify-between text-left w-full"}
                    style={style}
                  >
                    {l.label}
                    <ChevronRight className="h-7 w-7 shrink-0 text-cyan-hi" aria-hidden />
                  </button>
                ) : (
                  <Link
                    key={l.label}
                    to={l.to}
                    onClick={() => closeMenu(l.to)}
                    className={cls}
                    style={style}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>

            {/* Drill-in pane */}
            <div
              className={
                "absolute inset-0 flex flex-col px-5 pt-6 pb-4 transition-all duration-400 " +
                (sub ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0 pointer-events-none")
              }
            >
              <button
                type="button"
                onClick={() => setSub(null)}
                className="inline-flex w-fit min-h-11 items-center gap-2 rounded-full glass px-4 py-2 text-sm text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <h2 className="display-xl mt-5 text-3xl grad-text">{subLabel}</h2>
              <div className="mt-4 flex-1 overflow-y-auto space-y-2 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <Link
                  to={subAllLink}
                  onClick={() => closeMenu(subAllLink)}
                  className="flex items-center justify-between rounded-2xl border border-cyan-hi/40 bg-cyan-hi/10 px-5 py-4 text-sm font-semibold text-cyan-hi"
                >
                  All {subLabel.toLowerCase()}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                {subData.map((it) => {
                  const Icon = iconByName(it.iconName);
                  return (
                    <Link
                      key={it.key}
                      to={it.link.to as never}
                      params={it.link.params as never}
                      search={it.link.search as never}
                      onClick={() => closeMenu()}
                      className="flex items-center gap-3.5 rounded-2xl glass px-4 py-3.5"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-hi/15 text-cyan-hi">
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold text-white">
                          {it.name}
                        </span>
                        {it.tagline && (
                          <span className="block truncate text-xs text-white/55">{it.tagline}</span>
                        )}
                      </span>
                      <ChevronRight
                        className="ml-auto h-4 w-4 shrink-0 text-white/40"
                        aria-hidden
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {!sub && (
            <div className="p-6">
              <LiquidButton to="/contact" size="lg" onClick={() => setOpen(false)}>
                Get a Quote
              </LiquidButton>
            </div>
          )}
        </div>
        <style>{`@keyframes fade-in { to { opacity: 1; transform: translateY(0) } }`}</style>
      </div>
    </>
  );
}
