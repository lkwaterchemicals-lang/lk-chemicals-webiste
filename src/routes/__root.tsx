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

// Analytics & Search Console are activated purely by env config — set
// VITE_GA_ID (G-XXXXXXX) and/or VITE_GSC_VERIFICATION in .env and rebuild.
const GA_ID = (import.meta.env.VITE_GA_ID as string | undefined) || "";
const GSC_TOKEN = (import.meta.env.VITE_GSC_VERIFICATION as string | undefined) || "";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __lkSplashHide?: () => void;
  }
}

// First-load splash. It ships inside the SSR HTML — inline styles, markup and
// dismiss script — so it paints before any bundle downloads and never flashes
// unstyled. Water ripples + logo tile + brand progress line; animations are
// transform/opacity only (compositor-friendly, no main-thread cost). Dark is
// the default (:root = ink); html.light overrides. The hex fallbacks track
// --ink/--ice for the instant before styles.css applies. Dismissed by
// RootComponent's mount effect (hydration = interactive), with window "load"
// and a 7s timer as fail-safes; a minimum 900ms hold prevents a broken-looking
// sub-100ms flash on cached loads.
const SPLASH_HTML = `
<script>if(window.location.pathname!=='/')document.documentElement.classList.add('no-splash');</script>
<style>
html.no-splash #lk-splash{display:none!important}
#lk-splash{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;overflow:hidden;
  background:radial-gradient(640px 480px at 50% 44%,oklch(0.3 0.09 235 / 0.32),transparent 70%),var(--ink,#0a0f1e);}
html.light #lk-splash{
  background:radial-gradient(640px 480px at 50% 44%,oklch(0.93 0.03 220 / 0.7),transparent 70%),var(--ice,#f7fafc);}
#lk-splash .lk-splash-core{display:flex;flex-direction:column;align-items:center;gap:30px;
  animation:lk-splash-enter .7s cubic-bezier(.2,.7,.2,1) both;}
.lk-splash-puck-wrap{position:relative;display:grid;place-items:center;}
.lk-splash-ring{position:absolute;inset:-12%;border-radius:50%;pointer-events:none;
  border:1.5px solid oklch(0.82 0.16 210 / 0.38);opacity:0;transform:scale(.7);
  animation:lk-splash-ripple 2.7s cubic-bezier(.25,.55,.35,1) infinite;}
.lk-splash-ring:nth-of-type(2){animation-delay:.9s}
.lk-splash-ring:nth-of-type(3){animation-delay:1.8s}
html.light .lk-splash-ring{border-color:oklch(0.48 0.2 240 / 0.25);}
.lk-splash-puck{position:relative;width:clamp(96px,26vw,124px);aspect-ratio:1;display:grid;place-items:center;
  border-radius:27%;background:linear-gradient(165deg,#fff 0%,#eaf3fa 100%);
  box-shadow:0 0 0 1px rgba(255,255,255,.16),0 26px 64px -24px oklch(0.82 0.16 210 / 0.55),0 0 44px -6px oklch(0.82 0.16 210 / 0.28);
  animation:lk-splash-float 3.6s ease-in-out infinite;}
html.light .lk-splash-puck{background:#fff;
  box-shadow:0 0 0 1px oklch(0.22 0.06 258 / 0.08),0 22px 48px -22px oklch(0.3 0.1 258 / 0.45),0 0 40px -10px oklch(0.62 0.17 232 / 0.2);}
.lk-splash-puck img{width:72%;height:72%;object-fit:contain;}
.lk-splash-bar{position:relative;width:clamp(140px,32vw,180px);height:3px;border-radius:999px;overflow:hidden;
  background:rgba(255,255,255,.13);}
html.light .lk-splash-bar{background:oklch(0.22 0.06 258 / 0.12);}
.lk-splash-bar i{position:absolute;top:0;left:0;height:100%;width:42%;border-radius:inherit;
  background:linear-gradient(90deg,#4c9b2f,#8dc63f 38%,#29a8e0 78%,#1464ac);
  animation:lk-splash-sweep 1.3s cubic-bezier(.45,.15,.4,.85) infinite;}
@keyframes lk-splash-enter{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}
@keyframes lk-splash-ripple{0%{opacity:0;transform:scale(.7)}20%{opacity:1}100%{opacity:0;transform:scale(1.85)}}
@keyframes lk-splash-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes lk-splash-sweep{from{transform:translateX(-110%)}to{transform:translateX(250%)}}
#lk-splash.lk-splash-done{opacity:0;pointer-events:none;transition:opacity .55s cubic-bezier(.4,0,.2,1) .3s;}
#lk-splash.lk-splash-done .lk-splash-core{animation:none;transform:scale(1.04);transition:transform .6s cubic-bezier(.4,0,.2,1) .3s;}
#lk-splash.lk-splash-done .lk-splash-bar i{animation:none;transform:none;width:100%;transition:width .28s ease;}
@media (prefers-reduced-motion:reduce){
  .lk-splash-core,.lk-splash-puck{animation:none!important}
  .lk-splash-ring{display:none}
  .lk-splash-bar i{animation:lk-splash-breathe 1.8s ease-in-out infinite;width:100%;transform:none}
  #lk-splash.lk-splash-done .lk-splash-core{transform:none}
  @keyframes lk-splash-breathe{0%,100%{opacity:.35}50%{opacity:.9}}
}
</style>
<div id="lk-splash" role="status" aria-label="LK Chemicals is loading">
  <div class="lk-splash-core">
    <div class="lk-splash-puck-wrap">
      <span class="lk-splash-ring"></span>
      <span class="lk-splash-ring"></span>
      <span class="lk-splash-ring"></span>
      <div class="lk-splash-puck">
        <img src="${logoUrl}" alt="" width="128" height="128" fetchpriority="high" />
      </div>
    </div>
    <div class="lk-splash-bar"><i></i></div>
  </div>
</div>
<noscript><style>#lk-splash{display:none}</style></noscript>
<script>
(function(){
  if(window.location.pathname!=='/'){
    window.__lkSplashHide=function(){};
    var el=document.getElementById('lk-splash');
    if(el&&el.parentNode)el.parentNode.removeChild(el);
    return;
  }
  var t0=performance.now(),hidden=false;
  function hide(){
    if(hidden)return;hidden=true;
    setTimeout(function(){
      var el=document.getElementById('lk-splash');
      if(!el)return;
      el.classList.add('lk-splash-done');
      setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},1200);
    },Math.max(0,900-(performance.now()-t0)));
  }
  window.__lkSplashHide=hide;
  if(document.readyState==='complete'){hide();}
  else{window.addEventListener('load',hide);}
  setTimeout(hide,7000);
})();
</script>
`;

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
      { name: "theme-color", content: "#0a0f1e" },
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
      // Splash logo — fetch it alongside the CSS so it's decoded by first paint.
      { rel: "preload", as: "image", href: logoUrl },
      { rel: "apple-touch-icon", href: "/og-image.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
    scripts: GA_ID
      ? [
          { src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, async: true },
          {
            children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:true});`,
          },
        ]
      : [],
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('lk-theme');if(!t){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body>
        {/* Raw-HTML island: React never diffs inside dangerouslySetInnerHTML,
            so the splash script can mutate/remove its own nodes without
            hydration mismatches. */}
        <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: SPLASH_HTML }} />
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

  // React is interactive — lift the first-load splash (min-hold + exit
  // animation are handled inside the splash's own script/CSS).
  useEffect(() => {
    if (window.__lkSplashHide) window.__lkSplashHide();
    else document.getElementById("lk-splash")?.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {isAdmin ? (
        <Outlet />
      ) : (
        <>
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
