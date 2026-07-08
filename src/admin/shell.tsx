// Admin shell — sidebar (fixed → rail → drawer), topbar, ⌘K command palette,
// keyboard shortcuts and toasts. Wraps every admin page.
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { signOut, type User } from "firebase/auth";
import { Command } from "cmdk";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import {
  Activity,
  ChevronsLeft,
  ExternalLink,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { auth } from "@/integrations/firebase/client";
import logoUrl from "@/assets/lk-logo.png";
import { MODULES } from "./registry";
import { useCol, useEnquiries } from "./api";
import type { AdminTheme } from "./theme";
import { IconBtn } from "./ui";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  key: string;
  badge?: number;
  count?: number;
};
type NavSection = { label: string; items: NavItem[] };

function useNav(): NavSection[] {
  const products = useCol("products").data?.length;
  const categories = useCol("categories").data?.length;
  const services = useCol("services").data?.length;
  const gallery = useCol("gallery").data?.length;
  const testimonials = useCol("testimonials").data?.length;
  const enquiries = useEnquiries().data;
  const newEnq = enquiries?.filter((e) => !e.status || e.status === "new").length ?? 0;

  return [
    {
      label: "Overview",
      items: [
        { to: "/admin", label: "Dashboard", icon: LayoutDashboard, key: "d" },
        {
          to: "/admin/enquiries",
          label: "Enquiries",
          icon: Inbox,
          key: "e",
          badge: newEnq || undefined,
        },
        { to: "/admin/activity", label: "Activity", icon: Activity, key: "a" },
      ],
    },
    {
      label: "Catalog",
      items: [
        {
          to: "/admin/products",
          label: "Products",
          icon: MODULES[0].icon,
          key: "p",
          count: products,
        },
        {
          to: "/admin/categories",
          label: "Categories",
          icon: MODULES[1].icon,
          key: "c",
          count: categories,
        },
      ],
    },
    {
      label: "Content",
      items: [
        { to: "/admin/content", label: "Website pages", icon: FileText, key: "w" },
        {
          to: "/admin/services",
          label: "Services",
          icon: MODULES[2].icon,
          key: "s",
          count: services,
        },
        { to: "/admin/gallery", label: "Media", icon: MODULES[3].icon, key: "m", count: gallery },
        {
          to: "/admin/testimonials",
          label: "Testimonials",
          icon: MODULES[4].icon,
          key: "t",
          count: testimonials,
        },
      ],
    },
    {
      label: "System",
      items: [{ to: "/admin/settings", label: "Settings", icon: Settings, key: "," }],
    },
  ];
}

/* ---------------------------------------------------------------- sidebar */

function SideNav({
  sections,
  collapsed,
  onNavigate,
}: {
  sections: NavSection[];
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = (to: string) =>
    to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);
  return (
    <nav aria-label="Admin sections" className="px-3 pb-4">
      {sections.map((sec) => (
        <div key={sec.label}>
          {!collapsed && <div className="a-side-section">{sec.label}</div>}
          {collapsed && <div className="my-3 a-divider" />}
          <div className="space-y-0.5">
            {sec.items.map((it) => (
              <Link
                key={it.to}
                to={it.to}
                onClick={onNavigate}
                data-active={active(it.to)}
                className="a-side-link"
                title={collapsed ? it.label : undefined}
              >
                <it.icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{it.label}</span>
                    {it.badge ? (
                      <span className="a-badge a-badge-accent !px-1.5">{it.badge}</span>
                    ) : it.count !== undefined ? (
                      <span
                        className="text-[11px] tabular-nums"
                        style={{ color: "var(--a-text3)" }}
                      >
                        {it.count}
                      </span>
                    ) : null}
                  </>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link to="/admin" className="flex items-center gap-2.5 px-1 min-w-0">
      <img
        src={logoUrl}
        alt=""
        width={30}
        height={30}
        className="h-[30px] w-[30px] object-contain shrink-0"
      />
      {!compact && (
        <span className="min-w-0 leading-tight">
          <span
            className="block truncate text-[13px] font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            LK Chemicals
          </span>
          <span
            className="block text-[10px] font-semibold tracking-[0.14em] uppercase"
            style={{ color: "var(--a-text3)" }}
          >
            Admin Console
          </span>
        </span>
      )}
    </Link>
  );
}

/* ---------------------------------------------------------------- palette */

function CommandPalette({
  open,
  onClose,
  toggleTheme,
}: {
  open: boolean;
  onClose: () => void;
  toggleTheme: () => void;
}) {
  const navigate = useNavigate();
  const sections = useNav();
  const products = useCol("products").data ?? [];
  const services = useCol("services").data ?? [];
  const ProductIcon = MODULES[0].icon;
  const ServiceIcon = MODULES[2].icon;

  if (!open) return null;

  const go = (fn: () => void) => {
    onClose();
    fn();
  };

  return (
    <div className="a-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mx-auto mt-[12vh] w-full max-w-lg px-4">
        <Command
          label="Command palette"
          className="a-card a-cmdk a-pop overflow-hidden"
          style={{ boxShadow: "var(--a-shadow-lg)" }}
        >
          <div
            className="flex items-center gap-2 px-4"
            style={{ borderBottom: "1px solid var(--a-border)" }}
          >
            <Search className="h-4 w-4 shrink-0" style={{ color: "var(--a-text3)" }} />
            <Command.Input
              autoFocus
              placeholder="Search modules, records, actions…"
              className="w-full bg-transparent py-3.5 text-sm outline-none"
              style={{ color: "var(--a-text)" }}
            />
            <span className="a-kbd shrink-0">esc</span>
          </div>
          <Command.List className="max-h-[46vh] overflow-y-auto p-2">
            <Command.Empty
              className="py-8 text-center text-[13px]"
              style={{ color: "var(--a-text3)" }}
            >
              No results.
            </Command.Empty>
            <Command.Group heading="Go to">
              {sections
                .flatMap((s) => s.items)
                .map((it) => (
                  <Command.Item
                    key={it.to}
                    value={`go ${it.label}`}
                    onSelect={() => go(() => navigate({ to: it.to }))}
                  >
                    <it.icon className="h-4 w-4" /> {it.label}
                    <span className="ml-auto flex items-center gap-1">
                      <span className="a-kbd">g</span>
                      <span className="a-kbd">{it.key}</span>
                    </span>
                  </Command.Item>
                ))}
            </Command.Group>
            <Command.Group heading="Create">
              {MODULES.map((m) => (
                <Command.Item
                  key={m.id}
                  value={`new ${m.singular} create add`}
                  onSelect={() =>
                    go(() => navigate({ to: `/admin/${m.id}`, search: { new: "1" } as never }))
                  }
                >
                  <Plus className="h-4 w-4" /> New {m.singular}
                </Command.Item>
              ))}
            </Command.Group>
            {(products.length > 0 || services.length > 0) && (
              <Command.Group heading="Records">
                {products.slice(0, 40).map((p) => (
                  <Command.Item
                    key={p.__id}
                    value={`product ${String(p.name ?? p.__id)}`}
                    onSelect={() =>
                      go(() =>
                        navigate({
                          to: "/admin/products",
                          search: { q: String(p.name ?? "") } as never,
                        }),
                      )
                    }
                  >
                    <ProductIcon className="h-4 w-4" />
                    <span className="truncate">{String(p.name ?? p.__id)}</span>
                  </Command.Item>
                ))}
                {services.slice(0, 20).map((s) => (
                  <Command.Item
                    key={s.__id}
                    value={`service ${String(s.t ?? s.__id)}`}
                    onSelect={() =>
                      go(() =>
                        navigate({
                          to: "/admin/services",
                          search: { q: String(s.t ?? "") } as never,
                        }),
                      )
                    }
                  >
                    <ServiceIcon className="h-4 w-4" />
                    <span className="truncate">{String(s.t ?? s.__id)}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            <Command.Group heading="General">
              <Command.Item value="toggle theme dark light" onSelect={() => go(toggleTheme)}>
                <Sun className="h-4 w-4" /> Toggle theme
              </Command.Item>
              <Command.Item
                value="view public site"
                onSelect={() => go(() => window.open("/", "_blank"))}
              >
                <ExternalLink className="h-4 w-4" /> View public site
              </Command.Item>
              <Command.Item value="sign out log out" onSelect={() => go(() => signOut(auth))}>
                <LogOut className="h-4 w-4" /> Sign out
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ shell */

export function AdminShell({
  user,
  theme,
  toggleTheme,
  children,
}: {
  user: User;
  theme: AdminTheme;
  toggleTheme: () => void;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const sections = useNav();

  useEffect(() => {
    setCollapsed(localStorage.getItem("adm-side") === "1");
  }, []);
  const toggleCollapsed = () => {
    setCollapsed((c) => {
      localStorage.setItem("adm-side", c ? "0" : "1");
      return !c;
    });
  };

  // Global shortcuts: ⌘K palette, g-then-key navigation.
  useEffect(() => {
    let pendingG = 0;
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "g") {
        pendingG = Date.now();
        return;
      }
      if (pendingG && Date.now() - pendingG < 900) {
        const item = sections.flatMap((s) => s.items).find((i) => i.key === e.key);
        if (item) {
          e.preventDefault();
          navigate({ to: item.to });
        }
        pendingG = 0;
      }
    };
    addEventListener("keydown", h);
    return () => removeEventListener("keydown", h);
  }, [navigate, sections]);

  // Close user menu on outside click.
  useEffect(() => {
    if (!userMenu) return;
    const h = (e: MouseEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) setUserMenu(false);
    };
    addEventListener("mousedown", h);
    return () => removeEventListener("mousedown", h);
  }, [userMenu]);

  const initial = (user.email ?? "?")[0]?.toUpperCase();

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 sticky top-0 h-screen transition-[width] duration-200 ${collapsed ? "w-[68px]" : "w-60"}`}
        style={{ borderRight: "1px solid var(--a-border)", background: "var(--a-surface)" }}
      >
        <div
          className={`flex items-center py-4 ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}
        >
          <Brand compact={collapsed} />
          {!collapsed && (
            <IconBtn
              label="Collapse sidebar"
              icon={ChevronsLeft}
              size="sm"
              onClick={toggleCollapsed}
            />
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <SideNav sections={sections} collapsed={collapsed} />
        </div>
        {collapsed && (
          <div
            className="grid place-items-center py-3"
            style={{ borderTop: "1px solid var(--a-border)" }}
          >
            <IconBtn label="Expand sidebar" icon={Menu} size="sm" onClick={toggleCollapsed} />
          </div>
        )}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="a-overlay lg:hidden"
          onMouseDown={(e) => e.target === e.currentTarget && setMobileOpen(false)}
        >
          <div
            className="a-slide-left fixed inset-y-0 left-0 flex w-[82vw] max-w-[300px] flex-col"
            style={{ background: "var(--a-surface)", borderRight: "1px solid var(--a-border)" }}
          >
            <div className="flex items-center justify-between px-4 py-4">
              <Brand />
              <IconBtn label="Close menu" icon={X} onClick={() => setMobileOpen(false)} />
            </div>
            <div className="flex-1 overflow-y-auto">
              <SideNav
                sections={sections}
                collapsed={false}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header
          className="sticky top-0 z-40 flex items-center gap-2 px-4 sm:px-6 py-2.5"
          style={{
            background: "color-mix(in oklab, var(--a-bg) 85%, transparent)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid var(--a-border)",
          }}
        >
          <IconBtn
            label="Open menu"
            icon={Menu}
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          />
          <span className="lg:hidden">
            <Brand compact />
          </span>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="ml-auto lg:ml-0 flex items-center gap-2 rounded-[10px] px-3 py-2 text-[13px] transition-colors min-w-0 lg:w-72"
            style={{
              border: "1px solid var(--a-border)",
              background: "var(--a-surface)",
              color: "var(--a-text3)",
              boxShadow: "var(--a-shadow-sm)",
            }}
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline flex-1 text-left truncate">Search or jump to…</span>
            <span className="hidden sm:flex items-center gap-1">
              <span className="a-kbd">⌘</span>
              <span className="a-kbd">K</span>
            </span>
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="a-btn a-btn-bare a-btn-sm hidden sm:inline-flex"
              title="View public site"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View site
            </a>
            <IconBtn
              label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              icon={theme === "dark" ? Sun : Moon}
              onClick={toggleTheme}
            />
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenu((v) => !v)}
                aria-label="Account"
                className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold"
                style={{
                  background: "var(--a-accent-soft)",
                  color: "var(--a-accent)",
                  border: "1px solid var(--a-border)",
                }}
              >
                {initial}
              </button>
              {userMenu && (
                <div
                  className="a-card a-pop absolute right-0 top-full z-50 mt-1.5 w-56 p-2"
                  style={{ boxShadow: "var(--a-shadow-lg)" }}
                >
                  <div className="px-2.5 py-2">
                    <div className="text-xs font-semibold truncate">{user.email}</div>
                    <div className="text-[11px]" style={{ color: "var(--a-text3)" }}>
                      Administrator
                    </div>
                  </div>
                  <hr className="a-divider my-1" />
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] hover:bg-[var(--a-hover)]"
                    style={{ color: "var(--a-danger)" }}
                    onClick={() => signOut(auth)}
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-5 sm:py-6 max-w-[1440px] w-full mx-auto">
          {children}
        </main>

        <footer
          className="px-4 sm:px-6 py-4 text-[11px] flex flex-wrap gap-x-4 gap-y-1 items-center"
          style={{ color: "var(--a-text3)" }}
        >
          <span>LK Chemicals Admin 3.0</span>
          <span className="hidden sm:flex items-center gap-1">
            Press <span className="a-kbd">⌘</span>
            <span className="a-kbd">K</span> to search · <span className="a-kbd">g</span> + key to
            navigate · <span className="a-kbd">/</span> to filter tables
          </span>
        </footer>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        toggleTheme={toggleTheme}
      />

      <Toaster
        position="bottom-right"
        theme={theme}
        toastOptions={{
          style: {
            background: "var(--a-surface)",
            color: "var(--a-text)",
            border: "1px solid var(--a-border)",
            boxShadow: "var(--a-shadow-lg)",
            borderRadius: "12px",
            fontSize: "13px",
          },
        }}
      />
    </div>
  );
}
