import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL } from "@/lib/site";
import { listDocsRest } from "@/lib/firestore-rest";

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly" | "yearly";
  priority?: string;
  lastmod?: string;
  image?: string;
}

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Firestore's document updateTime → W3C date (YYYY-MM-DD) for <lastmod>. */
const day = (v: unknown) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : undefined;

/** Only absolute http(s) image URLs are valid in an image sitemap. */
const img = (v: unknown) => (typeof v === "string" && /^https?:\/\//.test(v) ? v : undefined);

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // The catalog lives in Firestore — list it so every published
        // product/service page is discoverable. Failures degrade to the
        // static pages (never a broken sitemap).
        const [products, serviceCategories, services] = await Promise.all([
          listDocsRest("products"),
          listDocsRest("serviceCategories"),
          listDocsRest("services"),
        ]);

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.8" },
          { path: "/products", changefreq: "weekly", priority: "0.9" },
          { path: "/services", changefreq: "monthly", priority: "0.8" },
          { path: "/gallery", changefreq: "monthly", priority: "0.6" },
          { path: "/careers", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "yearly", priority: "0.7" },
          { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
          { path: "/terms-and-conditions", changefreq: "yearly", priority: "0.3" },
          { path: "/shipping-policy", changefreq: "yearly", priority: "0.3" },
          { path: "/refund-policy", changefreq: "yearly", priority: "0.3" },
          { path: "/warranty-policy", changefreq: "yearly", priority: "0.3" },
          ...products
            .filter((p) => p.slug ?? p.__id)
            .map((p) => ({
              path: `/products/${String(p.slug ?? p.__id)}`,
              changefreq: "monthly" as const,
              priority: "0.8",
              lastmod: day(p.__updated),
              image: img(p.image),
            })),
          ...serviceCategories
            .filter((c) => c.slug ?? c.__id)
            .map((c) => ({
              path: `/services/${String(c.slug ?? c.__id)}`,
              changefreq: "monthly" as const,
              priority: "0.7",
              lastmod: day(c.__updated),
              image: img(c.banner) ?? img(c.image),
            })),
          ...services
            .filter((s) => (s.slug ?? s.__id) && s.serviceCategory)
            .map((s) => ({
              path: `/services/${String(s.serviceCategory)}/${String(s.slug ?? s.__id)}`,
              changefreq: "monthly" as const,
              priority: "0.7",
              lastmod: day(s.__updated),
              image: img(s.image),
            })),
        ];
        const urls = entries
          .map((e) =>
            [
              "  <url>",
              `    <loc>${xmlEscape(`${SITE_URL}${e.path}`)}</loc>`,
              e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : "",
              `    <changefreq>${e.changefreq}</changefreq>`,
              `    <priority>${e.priority}</priority>`,
              e.image
                ? `    <image:image><image:loc>${xmlEscape(e.image)}</image:loc></image:image>`
                : "",
              "  </url>",
            ]
              .filter(Boolean)
              .join("\n"),
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
