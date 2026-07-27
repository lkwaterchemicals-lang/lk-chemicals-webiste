# LK Chemicals — Website

Marketing site + admin-managed content for **LK Chemicals Pvt. Ltd.** (industrial water-treatment
chemicals, Hyderabad). Built by **Dream Team Services**.

## Stack

| Layer      | Tech                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Framework  | React 19 + TanStack Start (SSR) + TanStack Router, Vite 8, Tailwind 4 |
| Content DB | **Firebase Firestore** (project `lk-chemicals`)                       |
| Auth       | **Firebase Auth** (email/password — used only for `/admin`)           |
| Media      | **Cloudinary** (cloud `do46xxegj`, unsigned preset `lk chemicals`)    |
| Deploy     | Nitro build, Cloudflare module preset (`npm run build` → `.output/`)  |

## Commands

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # production build (.output/)
npx tsc --noEmit # typecheck
```

## Content architecture (important)

Every public page reads content through hooks in `src/lib/content.ts`
(`useCategories`, `useProducts`, `useServices`, `useGalleryItems`,
`useTestimonials`, `useSiteSettings`).

**The catalog (`categories`, `products`, `services`) is fully admin-managed with
no built-in content.** These hooks render only what the dashboard has published:
an empty Firestore yields an empty (not fabricated) catalog, `draft`/`archived`
records are hidden from the public site, and results are ordered by an `order`
field (falling back to `number`). The public listing pages show a clean
"being set up" empty state until the admin creates content.

**Media, testimonials and site settings keep built-in fallbacks**
(`src/data/content.ts`) so those surfaces never blank while the client fills them
in; they fetch the Firestore collection and swap it in only if it has documents.

Firestore collections: `categories`, `products`, `services`, `gallery`,
`testimonials`, `enquiries`, `settings/site` (single doc), and `pages/*` (one
doc per public page — see below).

### Catalog data model (rich, scalable, hierarchical)

`Category` and `Product` (`src/data/products.ts`) carry a small set of required
identity fields plus a large set of **optional, admin-managed** fields, so the
catalog scales without code changes:

- **Categories** — `parent` (unlimited nesting), `status`, `featured`, `iconName`,
  `banner`, and a full SEO block (`metaTitle` / `metaDescription` / `keywords` / `ogImage`).
- **Products** — `subcategory`, `status`, `featured`, `order`, a repeatable
  **specifications** engine (`{name, value, unit}[]`), **gallery** (ordered images),
  **documents** (labelled file uploads — TDS/SDS/certs/brochures), **related**
  products (cross-sell), and the same SEO block.

The admin editor renders these via new field types in `src/admin/fields.tsx`
(`GroupInput`, `GalleryInput`, `DocumentsInput`, `MultiRefInput`) wired through
the registry's `FieldDef`. Product detail pages render specs, gallery, downloads
and related items, and emit `Product` + `BreadcrumbList` JSON-LD.

### Per-page content (`pages/*`)

The rest of each page — hero copy and imagery, stats, the industries list,
the "how water gets treated" steps, "why LK" tiles, the About timeline /
mission / vision / facilities / values, the services process, footer brand
text, etc. — is **not** hard-coded in the route files. It reads through
`src/lib/pages.ts` (`useHomeContent`, `useAboutContent`, `useServicesContent`,
`useProductsContent`, `useGalleryContent`, `useContactContent`,
`useGlobalContent`), each of which merges a `pages/<id>` Firestore document over
the built-in defaults in **`src/data/site.ts`** (same instant-fallback pattern
as above — a shallow merge, so any field the admin hasn't touched keeps its
default). Industry icons are stored by name and resolved via `src/lib/icons.ts`.

## Admin dashboard — `/admin`

- Sign in with the Firebase Auth user (created in the Firebase console).
- Tabs: Website pages, Categories, Products, Services, Gallery, Testimonials, Enquiries, Site settings.
- Each collection: add / edit / delete, plus **“Seed from built-in data”** when empty —
  copies the built-in content into Firestore so it becomes editable.
- **Website pages** (`/admin/content`) — a schema-driven editor (one card per public
  page) for all the per-page copy and imagery described above. Repeatable sections
  (stats, industries, steps, milestones, values, facilities…) can be added, reordered
  and removed; text/image fields save straight to the `pages/<id>` doc. The schema
  lives in `src/admin/content-schema.tsx`; the editor in `src/admin/page-editor.tsx`.
- Image fields upload straight to Cloudinary (progress bar) or accept a pasted URL.
- Site settings (phone, WhatsApp, email, address, hours, map query) drive the footer,
  contact page, call/WhatsApp buttons and the embedded Google Map.
- Enquiry-form submissions land in the `enquiries` collection and are listed newest-first.

> The `pages/*` docs are covered by the existing catch-all Firestore rule
> (`match /{collection}/{doc}` → public read, authenticated write), so no rules
> change is needed.

### PDF Import Center — `/admin/imports`

Drop technical (TDS) or safety (MSDS) data sheets into the **import folder** and they
become catalog records with no data entry. The folder is `PDF's/` at the project root
(override with `PDF_IMPORT_DIR`). Per file the pipeline:

1. **Scans** the folder and fingerprints each PDF (sha256) — the import ledger's key, so
   the same document dropped twice is recognised no matter what it is named.
2. **Classifies** it as Product / Product category / Service / Service category using a
   scored classifier. Every signal and its weight is recorded; anything under 55%
   confidence, or two outcomes scoring alike, is parked as **Needs review** rather than
   guessed at.
3. **Extracts** name, code, description, short description, features, applications,
   industries, specifications, dosage, packing, safety notes, keywords and SEO fields —
   from the LK MSDS layout (9 numbered sections) and both data-sheet layouts.
4. **Creates or updates** the record. Matching is by product code first (`LK CHEM 1001`),
   then slug, then exact name, so a product is never duplicated — including products that
   predate the pipeline, whose code is read out of their name. Scalars only ever fill
   blanks and lists are only extended, so a TDS and an MSDS for the same product combine
   into one complete record instead of overwriting each other.
5. **Uploads** the original to Cloudinary and attaches the returned URL as the product's
   downloadable document (labelled TDS or MSDS). The public id is derived from the code
   and content hash, so retries reuse the asset instead of piling up copies.
6. **Deletes the local file** — only after parse, content write, upload and download check
   all succeed. Any failure leaves the PDF in place and records the reason, with a Retry
   button next to it.

Notes:

- New records land as **drafts** by default, so a human can glance at them before they go
  public; flip “Publish immediately” in the Import Center to skip that.
- The route that reads the folder (`/api/pdf-import`) is **development-only** — it refuses
  to run in a production build unless `PDF_IMPORT_ENABLED=1` is set. Deployed builds have
  no folder to watch and say so.
- **Cloudinary must be allowed to serve PDFs**: console → *Settings → Security* →
  allow delivery of PDF and ZIP files. Until then every PDF URL returns 401 and the
  pipeline reports it and keeps the local file.
- `node scripts/pdf-import-dryrun.mjs --full` prints what would be extracted from every
  PDF in the folder without touching Firestore, Cloudinary or the files;
  `node scripts/pdf-import-verify.mjs` additionally reads the live catalog and shows which
  records would be created, updated or left alone.
- The engine lives in `src/lib/pdf-import/` (pure, no I/O), the orchestration in
  `src/admin/import-pipeline.ts`, the filesystem half in `src/routes/api.pdf-import.ts`.

### One-time Firebase setup (required before the admin can save)

1. Open <https://console.firebase.google.com/project/lk-chemicals/firestore> →
   **Create database** (production mode, closest region e.g. `asia-south1`).
2. In the **Rules** tab publish:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /enquiries/{doc} {
         allow create: if true;                 // public enquiry form
         allow read, update, delete: if request.auth != null;
       }
       match /imports/{doc} {
         allow read, write: if request.auth != null;  // import ledger, admin only
       }
       match /{collection}/{doc} {
         allow read: if true;                    // public site content
         allow write: if request.auth != null;   // admin only
       }
     }
   }
   ```

   The `imports` rule is optional — the catch-all below it already permits the writes —
   but without it the import history (file names and Cloudinary URLs) is publicly
   readable, which it has no reason to be.

   > ⚠️ **The rules currently published on this project do not match the block above.**
   > Verified 27 Jul 2026: an unauthenticated client — nothing but the public API key
   > that ships in the JS bundle — can create, overwrite and delete documents in every
   > collection, including `products`, `settings` and `pages`. Anyone who opens the site
   > can rewrite or wipe the catalog. Publish the rules above to close it.

3. The admin user already exists in Firebase Auth. Until steps 1–2 are done, the admin
   panel shows a “Firestore isn’t reachable” banner with a direct link, and the public
   site simply serves the built-in content.

## Key paths

```
src/routes/                 pages (TanStack file routes; products_.$slug = non-nested detail page)
src/routes/admin.tsx        entire admin dashboard (login + schema-driven CRUD)
src/lib/content.ts          Firestore-backed content hooks with fallbacks
src/data/products.ts        built-in categories + 35 products
src/data/content.ts         built-in services/gallery/testimonials/site settings
src/integrations/firebase/  Firebase app/auth/Firestore init
src/integrations/cloudinary.ts  unsigned upload helper (XHR w/ progress)
src/lib/pdf-import/          PDF → CMS engine (normalise, classify, extract, taxonomy)
src/admin/import-pipeline.ts    the seven import steps, run from the browser
src/routes/api.pdf-import.ts    dev-only filesystem half (scan / text / bytes / delete)
public/content/             stable copies of site images (used by seeded data)
src/styles.css              theme + extensive .light overrides (see notes below)
```

## Living water canvas (signature experience)

The whole public site sits inside **one continuous WebGL water field** —
`src/components/site/WaterCanvas.tsx`, mounted once in `__root.tsx` behind
`.site-shell`. There are no section dividers: `section-dark` / `section-light`
backgrounds are translucent, so every band reveals the same living water and
each section grows out of the previous one.

- **One flow field** drives everything in the shader: surface drift, caustic
  filaments, god-rays, rising micro-bubbles.
- **Scroll** translates the shader's world coordinates (underwater-camera feel)
  with inertia; fast scrolling energises the flow, stopping lets it settle.
- **Interaction**: the cursor bends the nearby flow (domain warp), presses emit
  expanding world-space ripples, hovering links/buttons emits micro-ripples.
- **Theme-aware**: abyssal navy + cyan caustics in dark; airy glacial water in
  light. Theme switches crossfade inside the shader.
- **Performance**: renders at reduced internal resolution, DPR-capped, cheaper
  shader variant on mobile, pauses when the tab is hidden. An adaptive governor
  watches real frame time and steps down (resolution → frame-skip → static
  frame) so software-rendered/GPU-less machines never jank.
- **Accessibility**: `prefers-reduced-motion` gets a single static frame.
- Keep `SCROLL_K` identical in the JS and GLSL halves of `WaterCanvas.tsx` —
  ripple/cursor world positions are computed in JS and must match the shader.

## The Living Water Core (homepage closer)

`src/components/site/WaterCore.tsx` — the last section before the footer: a
floating glass sphere rendered with analytic optics in one fragment shader
(refraction with chromatic dispersion, Beer-Lambert absorption, fresnel
reflections, a slowly swirling luminous core, rising micro-bubbles) inside a
layered water environment (caustics, light shafts, two parallax particle
layers). Cursor steers the sphere and bends the water; presses emit ripples.
Dark mode = deep engineered water; light mode = crystal daylight over marble —
two independent palettes, same motion system. Renders only while in view,
adapts resolution under load, falls back to a static frame, and honours
`prefers-reduced-motion`. The section's CSS gradient (`.water-core`) is the
no-WebGL/pre-compile art direction.

## Hard-won implementation notes

- **Light mode** is a `.light` class on `<html>` (toggle in Nav; persisted as `lk-theme`).
  Dark is the design default; `.light` overrides remap colors. Two recurring traps:
  - the `background:` **shorthand resets `background-clip`**, silently killing
    gradient text (`.grad-text`) — always use `background-image` in overrides;
  - a catch-all `[class*="from-ink"][class*="bg-gradient"]` wash replaces dark scrims in
    light mode. The hero overlay (`.hero-lighten-overlay`) opts out via a
    triple-class high-specificity rule.
- Card images must be **full opacity** with black gradient scrims for text: partial
  `opacity-*` on `<img>` blends with white cards in light mode (“white layer” bug).
- `products.$slug.tsx` → **`products_.$slug.tsx`**: the trailing underscore stops TanStack
  Router nesting the detail page inside the `/products` listing page (which made every
  detail URL render the listing).
- The route tree (`src/routeTree.gen.ts`) is generated — never edit by hand.
- Old Lovable/Supabase scaffolding was fully removed (vite config, error reporting,
  Supabase client + middleware, `@lovable.dev/*` deps).
