import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logoUrl from "@/assets/lk-logo.png";
import { LiquidButton } from "./LiquidButton";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Gallery" },
  { to: "/careers", label: "Careers" },
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
    // Drop focus from inside the menu before it becomes inert — a focused
    // descendant in a hidden subtree trips the browser's a11y warning.
    if (!open) (document.activeElement as HTMLElement | null)?.blur?.();
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
              {links.map((l) => (
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
          <div className="flex-1 flex flex-col justify-center px-8 gap-2">
            {links.map((l, i) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => {
                  setOpen(false);
                  samePageTop(l.to);
                }}
                className="display-xl text-5xl sm:text-6xl grad-text opacity-0 translate-y-3"
                style={{
                  animation: open ? `fade-in .6s ${i * 0.06}s forwards` : "none",
                }}
              >
                {l.label}
              </Link>
            ))}
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
