// Site-wide search-engine data: the business identity Google, Bing and AI
// assistants read on every page (schema.org JSON-LD), plus canonical-URL
// helpers. Every fact here is the client's own published data (site settings
// in src/data/content.ts, the Google Business listing linked from mapsLink).
import { staticSettings } from "@/data/content";
import { SITE_URL } from "@/lib/site";

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Absolute canonical URL for a pathname: no query, no hash, no trailing slash
 * (except the home page). Uses the configured origin so SSR and browser agree. */
export function canonicalUrl(pathname: string): string {
  const clean = (pathname || "/").split(/[?#]/)[0].replace(/\/+$/, "");
  return `${SITE_URL}${clean || "/"}`;
}

/** Breadcrumb JSON-LD with absolute item URLs (Google ignores relative ones). */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: canonicalUrl(it.path),
    })),
  };
}

/** A category's display name. During SSR the category list may not have
 * loaded, so the name can still be the raw slug ("descaling-services") —
 * turn that into words ("Descaling Services") for search snippets. */
export function displayName(name: string | undefined, slug: string): string {
  const n = (name ?? "").trim();
  if (n && n !== slug) return n;
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const s = staticSettings;

/** Organization + LocalBusiness + WebSite graph, emitted once in the root head. */
export function siteJsonLd() {
  const sameAs = [s.facebook, s.instagram, s.youtube, s.linkedin, s.mapsLink].filter(
    (u): u is string => Boolean(u),
  );
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness"],
        "@id": ORG_ID,
        name: "LK Chemicals Pvt. Ltd.",
        legalName: "LK Chemicals Private Limited",
        alternateName: ["LK Chemicals", "LK Water Chemicals"],
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/logo-192.png`,
        image: `${SITE_URL}/og-image.png`,
        description:
          "Hyderabad-based manufacturer and supplier of industrial water treatment chemicals — RO antiscalants and membrane cleaners, boiler, cooling tower, chiller, descaling, ETP and STP chemicals — plus water treatment plants and on-site services, since 2013.",
        foundingDate: "2013",
        founder: { "@type": "Person", name: s.contactPerson },
        telephone: s.phone.replace(/\s+/g, ""),
        email: s.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Plot No. 157, Officers Colony, Cherlapally",
          addressLocality: "Hyderabad",
          addressRegion: "Telangana",
          postalCode: "500051",
          addressCountry: "IN",
        },
        hasMap: s.mapsLink,
        areaServed: [
          { "@type": "City", name: "Hyderabad" },
          { "@type": "State", name: "Telangana" },
          { "@type": "Country", name: "India" },
        ],
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "09:30",
            closes: "18:00",
          },
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            telephone: s.phone.replace(/\s+/g, ""),
            email: s.email,
            areaServed: "IN",
          },
        ],
        knowsAbout: [
          "RO antiscalant",
          "RO membrane cleaning chemicals",
          "Boiler water treatment chemicals",
          "Cooling tower treatment chemicals",
          "Chiller chemicals",
          "Descaling chemicals",
          "ETP chemicals",
          "STP chemicals",
          "Water treatment plants",
        ],
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${SITE_URL}/`,
        name: "LK Chemicals",
        inLanguage: "en-IN",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

/** Serialise JSON-LD for a <script> tag. "<", ">" and "&" become JSON unicode
 * escapes (still valid JSON, same parsed value) so admin-entered text
 * containing "</script>" can never close the tag early. U+2028/2029 are
 * escaped for older JS parsers. */
export const ldJson = (data: unknown): string =>
  JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
