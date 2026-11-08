# LK Chemicals website — Handoff

Last updated: 2026-11-08

## State
- Live site: https://lk-chemicals.vercel.app (NOT lkchemicals.in — that is the client's IndiaMART storefront).
- SEO pass committed and pushed to `main` (GitHub lkwaterchemicals-lang/lk-chemicals-webiste):
  - bbe8df7 canonical + og:url on every page (root head, from route pathname), /admin noindex,
    site-wide Organization/LocalBusiness/WebSite JSON-LD (`src/lib/seo.ts`), Product brand/url,
    Service schema, absolute breadcrumbs, generated `/robots.txt` + `/llms.txt` routes,
    sitemap lastmod + image entries, keyword titles (home/about/products/services/gallery).
  - e9e4293 proper JSON-LD escaping (`ldJson`).
  - 821fc5d `engines.node: 22.x` (attempt to fix Vercel; did NOT fix it).
- Google Search Console: URL-prefix property https://lk-chemicals.vercel.app/ added in the
  lk.waterchemicals@gmail.com account, auto-verified via the GA4 tag (G-GF53GRYMW2 — don't remove it).
  Sitemap submitted: Success, 33 pages.
- Bing Webmaster: site imported from GSC (same Google login). First sitemap read errored
  ("Bingbot was not able to access"), resubmitted 2026-11-08.

## Blocker
- EVERY Vercel deploy fails since the last success on 2026-09-09 (56af5ea) — including the
  user's own bcd091f (eslint-only). Same commits build fine locally (`npm ci` + `VERCEL=1 npm run build`).
  Both Vercel projects (`lk-chemicals`, `lk-chemicals-webiste`, team lk-chemicals-webiste) fail.
  Logs need a Vercel login (`npx vercel inspect <dpl> --logs`). Not logged in on this PC or in the LK Chrome.

## Next steps
1. Get the Vercel build log (log in to Vercel in the "Lk Chemicals" Chrome), fix the cause, redeploy.
2. When live: verify https://lk-chemicals.vercel.app/robots.txt shows the vercel.app sitemap,
   /llms.txt is 200, home has `<link rel="canonical">`; then in GSC URL Inspection → Request indexing for home.
3. Check Bing sitemap status (should show 33 URLs).
4. If engines pin is not the fix, consider reverting 821fc5d.
5. Optional: connect a real domain later → set VITE_SITE_URL and add it as a new GSC property.

## Gotchas
- Root `head()` builds canonical from `matches[matches.length-1].pathname`.
- The Bash tool collapses `\\` in heredocs — write backslashes via python `chr(92)` when exact escapes matter.
