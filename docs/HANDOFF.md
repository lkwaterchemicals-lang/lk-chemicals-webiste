# LK Chemicals website — Handoff

Last updated: 2026-11-08

## State
- Production domain: **https://www.lkchemicals.com** (apex 308 → www), served by Vercel from `main`
  of GitHub lkwaterchemicals-lang/lk-chemicals-webiste. Also reachable at lk-chemicals.vercel.app.
  lkchemicals.in is the client's IndiaMART storefront, not this site.
- `SITE_URL` (src/lib/site.ts) defaults to www.lkchemicals.com; canonical, og:url, JSON-LD, robots.txt,
  sitemap.xml and llms.txt all derive from it.
- SEO pass live (2026-11-08): canonical + og:url on every page, /admin noindex, site-wide
  Organization/LocalBusiness/WebSite JSON-LD (`src/lib/seo.ts`), Product brand/url, Service schema,
  absolute breadcrumbs, generated `/robots.txt` + `/llms.txt`, sitemap lastmod + images (33 URLs),
  keyword titles on home/about/products/services/gallery, safe JSON-LD escaping (`ldJson`).
- Vercel deploys were blocked since 2026-09-09: Vercel refuses @tanstack/react-start < 1.168.60
  (CVE-2026-102989). Fixed by pinning react-start 1.168.61 / react-router 1.170.42 /
  router-plugin 1.168.43 (exact). 1.169.5 caused hydration mismatches — don't bump blindly.
- Google Search Console (lk.waterchemicals@gmail.com): properties https://www.lkchemicals.com/ and
  https://lk-chemicals.vercel.app/, both auto-verified via the GA4 tag (G-GF53GRYMW2 — keep it).
  Sitemaps submitted; home page indexing requested on www.
- Bing Webmaster (same Google login): both sites imported from GSC; www sitemap processing.

## Next steps
1. In ~2–3 days: GSC → www property → Sitemaps should show Success (the old Nov 6 read had 33 errors
   from vercel.app URLs); Pages report for indexing; Enhancements for Breadcrumbs/Products.
2. Bing → www.lkchemicals.com → Sitemaps should show 33 URLs.
3. Optional: add a Domain property (DNS TXT) for lkchemicals.com in GSC; set up Google Business Profile
   website link to www.lkchemicals.com; real reviews only.

## Gotchas
- Vercel installs with npm (package-lock.json) on Node 24; bun.lock is unused by Vercel.
- Root `head()` builds canonical from `matches[matches.length-1].pathname`.
- Running two `vite dev` servers in this folder makes them fight over src/routeTree.gen.ts (endless reloads).
- The Bash tool collapses `\\` in heredocs — write exact backslashes via python `chr(92)`.
