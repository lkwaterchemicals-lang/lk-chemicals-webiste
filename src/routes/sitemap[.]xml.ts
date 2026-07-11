import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL } from "@/lib/site";
import { listDocsRest } from "@/lib/firestore-rest";

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly" | "yearly";
  priority?: string;
}

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
              priority: "0.7",
            })),
          ...serviceCategories
            .filter((c) => c.slug ?? c.__id)
            .map((c) => ({
              path: `/services/${String(c.slug ?? c.__id)}`,
              changefreq: "monthly" as const,
              priority: "0.7",
            })),
          ...services
            .filter((s) => (s.slug ?? s.__id) && s.serviceCategory)
            .map((s) => ({
              path: `/services/${String(s.serviceCategory)}/${String(s.slug ?? s.__id)}`,
              changefreq: "monthly" as const,
              priority: "0.7",
            })),
        ];
        const urls = entries
          .map(
            (e) =>
              `  <url>\n    <loc>${SITE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
