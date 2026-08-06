import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import logoUrl from "@/assets/lk-logo.png";
import { absUrl } from "../lib/site";
import { Nav } from "../components/site/Nav";
import { Footer } from "../components/site/Footer";
import { WaCluster } from "../components/site/WaCluster";
import { ScrollProgress } from "../components/site/ScrollProgress";
import { SmoothScroll } from "../components/site/SmoothScroll";
import { WaterCanvas } from "../components/site/WaterCanvas";
import { BackToTop } from "../components/site/BackToTop";
import { BootVeil } from "../components/site/BootVeil";
import { PageFx } from "../components/site/PageFx";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

// On reload the router restores the window offset synchronously, but
// Firestore-backed sections stream in afterwards — the page can still be
// shorter than the stored offset at that moment, so the browser clamps the
// scroll and the visitor lands mid-page instead of where they were. Until the
// user interacts (or a short window elapses), keep re-applying the stored
// position as the document grows.
function InitialScrollRestore() {
  useEffect(() => {
    let target: number | null = null;
    try {
      const cache = JSON.parse(
        sessionStorage.getItem("tsr-scroll-restoration-v1_3") || "{}",
      ) as Record<string, { window?: { scrollY?: number } }>;
      const stateKey = (history.state as { __TSR_key?: string } | null)?.__TSR_key;
      const href = location.pathname + location.search + location.hash;
      const entry = (stateKey && cache[stateKey]) || cache[href];
      const y = entry?.window?.scrollY;
      if (typeof y === "number" && y > 0) target = y;
    } catch {
      /* sessionStorage unavailable — nothing to restore */
    }
    if (target === null) return;

    const cleanupFns: (() => void)[] = [];
    const cleanup = () => cleanupFns.splice(0).forEach((fn) => fn());
    const stop = () => {
      target = null;
      cleanup();
    };
    const apply = () => {
      if (target === null) return;
      const fits = document.documentElement.scrollHeight >= target + window.innerHeight;
      if (fits && Math.abs(window.scrollY - target) > 2) {
        window.scrollTo({ top: target, behavior: "instant" });
      }
    };

    const ro = new ResizeObserver(apply);
    ro.observe(document.documentElement);
    cleanupFns.push(() => ro.disconnect());
    // Any real user input means they've taken over — never yank the page.
    for (const ev of ["wheel", "touchstart", "keydown", "pointerdown"] as const) {
      addEventListener(ev, stop, { passive: true });
      cleanupFns.push(() => removeEventListener(ev, stop));
    }
    const timer = setTimeout(stop, 3500);
    cleanupFns.push(() => clearTimeout(timer));
    apply();
    return cleanup;
  }, []);
  return null;
}

// Analytics & Search Console are activated purely by env config — set
// VITE_GA_ID (G-XXXXXXX) and/or VITE_GSC_VERIFICATION in .env and rebuild.
const GA_ID = (import.meta.env.VITE_GA_ID as string | undefined) || "";
const GSC_TOKEN = (import.meta.env.VITE_GSC_VERIFICATION as string | undefined) || "";

// Webfonts load WITHOUT blocking first paint: a plain <link rel="stylesheet">
// to fonts.googleapis.com held up rendering for a third-party round trip on
// every cold cache — part of the first-visit freeze. A script-injected
// stylesheet loads async instead (display=swap upgrades text in place; the
// boot veil covers the swap on first loads). <noscript> keeps the blocking
// link for the JS-less. Preconnects below still warm both font origins.
const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...(GSC_TOKEN ? [{ name: "google-site-verification", content: GSC_TOKEN }] : []),
      { title: "LK Chemicals — Industrial Water Treatment Chemicals, Hyderabad" },
      {
        name: "description",
        content:
          "LK Chemicals Pvt. Ltd. — Hyderabad-based manufacturer of RO, boiler, cooling tower, chiller, descaling, ETP & STP and water treatment chemicals, plants and services since 2013.",
      },
      { name: "author", content: "LK Chemicals Pvt. Ltd." },
      {
        property: "og:title",
        content: "LK Chemicals — Industrial Water Treatment Chemicals, Hyderabad",
      },
      {
        property: "og:description",
        content:
          "LK Chemicals Pvt. Ltd. — Hyderabad-based manufacturer of RO, boiler, cooling tower, chiller, descaling, ETP & STP and water treatment chemicals, plants and services since 2013.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // Matches --ice, the light theme's page background (the site's default).
      { name: "theme-color", content: "#f4f9fc" },
      {
        name: "twitter:title",
        content: "LK Chemicals — Industrial Water Treatment Chemicals, Hyderabad",
      },
      {
        name: "twitter:description",
        content:
          "LK Chemicals Pvt. Ltd. — Hyderabad-based manufacturer of RO, boiler, cooling tower, chiller, descaling, ETP & STP and water treatment chemicals, plants and services since 2013.",
      },
      // Crawlers require absolute og/twitter image URLs.
      { property: "og:image", content: absUrl("/og-image.png") },
      { name: "twitter:image", content: absUrl("/og-image.png") },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "icon", href: "/logo-192.png", type: "image/png", sizes: "192x192" },
      // Boot-veil logo — fetch it alongside the CSS so it's decoded by first paint.
      { rel: "preload", as: "image", href: logoUrl },
      { rel: "apple-touch-icon", href: "/logo-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    ],
    scripts: [
      // Async font CSS (see FONTS_URL note) — script-injected stylesheets
      // never block the parser or first paint.
      {
        children: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='${FONTS_URL}';document.head.appendChild(l);})();`,
      },
      ...(GA_ID
        ? [
            { src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, async: true },
            {
              children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:true});`,
            },
          ]
        : []),
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <noscript>
          <link rel="stylesheet" href={FONTS_URL} />
        </noscript>
        <script
          dangerouslySetInnerHTML={{
            // Light is the site's default presentation — the OS preference no
            // longer decides first paint, only an explicit choice the visitor
            // made here does. Runs before the boot veil paints, so there is
            // never a dark flash on the way to light.
            __html: `(function(){try{var t=localStorage.getItem('lk-theme');if(t!=='dark'&&t!=='light'){t='light';}document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('light');}try{if(sessionStorage.getItem('lk-boot')){document.documentElement.classList.add('lk-seen');}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        {/* The site has exactly ONE opening animation: <BootVeil />. It is a
            normal component, so it ships inside the SSR HTML and is styled by
            the render-blocking stylesheet — it is on screen at first paint,
            which is the only thing the old raw-HTML splash island bought us.
            Running both meant two different logo treatments cross-fading into
            each other on the home page; that is the "mixed animation" glitch. */}
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");

  // SPA navigations don't reload the page — report each route change to GA4.
  useEffect(() => {
    if (GA_ID) window.gtag?.("event", "page_view", { page_path: pathname });
  }, [pathname]);

  // Stale-deploy self-healing: after a redeploy the old HTML still references
  // the previous hashed chunks, so the next route navigation 404s its dynamic
  // import and the page just hangs on the veil ("About never opens"). Vite
  // surfaces that as `vite:preloadError` — reload once to pick up fresh HTML
  // with the new asset hashes. Time-gated so a genuinely broken deploy can't
  // put the browser in a reload loop.
  useEffect(() => {
    const onPreloadError = (e: Event) => {
      try {
        const KEY = "lk-chunk-reload-at";
        const last = Number(sessionStorage.getItem(KEY) || 0);
        if (Date.now() - last < 20_000) return; // just tried — let the error surface
        sessionStorage.setItem(KEY, String(Date.now()));
      } catch {
        /* private mode — still worth one reload attempt */
      }
      e.preventDefault();
      window.location.reload();
    };
    window.addEventListener("vite:preloadError", onPreloadError);
    return () => window.removeEventListener("vite:preloadError", onPreloadError);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <InitialScrollRestore />
      {isAdmin ? (
        <Outlet />
      ) : (
        <>
          <BootVeil />
          <PageFx />
          <SmoothScroll />
          <WaterCanvas />
          <div className="site-shell">
            <ScrollProgress />
            <Nav />
            <main>
              <Outlet />
            </main>
            <Footer />
            <WaCluster />
            <BackToTop />
          </div>
        </>
      )}
    </QueryClientProvider>
  );
}
