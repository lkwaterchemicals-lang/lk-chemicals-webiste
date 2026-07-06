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
`useTestimonials`, `useSiteSettings`). Each hook:

1. renders instantly with **built-in fallback content** (`src/data/products.ts`, `src/data/content.ts`),
2. then fetches the matching **Firestore collection** and swaps it in **only if it has documents**.

So: an empty/unreachable Firestore never blanks the site, and anything the admin
saves overrides the built-ins. Media URLs seeded into Firestore use stable
`/content/*.jpg` paths (`public/content/`), never Vite's hashed asset URLs.

Firestore collections: `categories`, `products`, `services`, `gallery`,
`testimonials`, `enquiries`, and `settings/site` (single doc).

## Admin dashboard — `/admin`

- Sign in with the Firebase Auth user (created in the Firebase console).
- Tabs: Categories, Products, Services, Gallery, Testimonials, Enquiries, Site settings.
- Each collection: add / edit / delete, plus **“Seed from built-in data”** when empty —
  copies the built-in content into Firestore so it becomes editable.
- Image fields upload straight to Cloudinary (progress bar) or accept a pasted URL.
- Site settings (phone, WhatsApp, email, address, hours, map query) drive the footer,
  contact page, call/WhatsApp buttons and the embedded Google Map.
- Enquiry-form submissions land in the `enquiries` collection and are listed newest-first.

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
       match /{collection}/{doc} {
         allow read: if true;                    // public site content
         allow write: if request.auth != null;   // admin only
       }
     }
   }
   ```

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
