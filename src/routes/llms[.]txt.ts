import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL } from "@/lib/site";
import { listDocsRest } from "@/lib/firestore-rest";
import { staticSettings as s } from "@/data/content";

// /llms.txt — a plain-text map of the site for AI assistants (ChatGPT,
// Perplexity, Gemini, Claude) so they can describe and cite LK Chemicals
// accurately. Built from the same published Firestore catalog as the sitemap.
const line = (name: unknown, path: string, desc: unknown) => {
  const d = typeof desc === "string" ? desc.replace(/\s+/g, " ").trim() : "";
  return `- [${String(name)}](${SITE_URL}${path})${d ? `: ${d}` : ""}`;
};

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const [products, serviceCategories, services] = await Promise.all([
          listDocsRest("products"),
          listDocsRest("serviceCategories"),
          listDocsRest("services"),
        ]);
        const productLines = products
          .filter((p) => p.slug ?? p.__id)
          .map((p) =>
            line(
              p.name,
              `/products/${String(p.slug ?? p.__id)}`,
              p.metaDescription ?? p.shortDescription,
            ),
          );
        const serviceLines = [
          ...serviceCategories
            .filter((c) => c.slug ?? c.__id)
            .map((c) =>
              line(
                c.name,
                `/services/${String(c.slug ?? c.__id)}`,
                c.metaDescription ?? c.description,
              ),
            ),
          ...services
            .filter((x) => (x.slug ?? x.__id) && x.serviceCategory)
            .map((x) =>
              line(
                x.name,
                `/services/${String(x.serviceCategory)}/${String(x.slug ?? x.__id)}`,
                x.metaDescription ?? x.shortDescription,
              ),
            ),
        ];

        const body = [
          "# LK Chemicals Pvt. Ltd.",
          "",
          "> Hyderabad-based manufacturer and supplier of industrial water treatment chemicals since 2013: RO antiscalants and membrane cleaning chemicals, boiler, cooling tower, chiller, descaling, ETP and STP chemicals, plus water treatment plants (RO, DM, softener, STP, ETP) and on-site services.",
          "",
          `- Address: ${s.address}, Telangana, India`,
          `- Phone / WhatsApp: ${s.phone}`,
          `- Email: ${s.email}`,
          `- Hours: ${s.hours}`,
          `- Google Maps: ${s.mapsLink}`,
          "",
          "## Main pages",
          line("Home", "/", "Company overview, product families, industries served."),
          line("About", "/about", "Company story, team, facilities and milestones."),
          line("Products", "/products", "Full catalog of water treatment chemicals."),
          line("Services", "/services", "Plant servicing, descaling and water treatment services."),
          line("Gallery", "/gallery", "Manufacturing plant, laboratory and site work."),
          line("Careers", "/careers", "Open roles in Hyderabad."),
          line("Contact", "/contact", "Address, phone, email, map and enquiry form."),
          line(
            "Water treatment chemicals in Hyderabad",
            "/water-treatment-chemicals-hyderabad",
            "Buying from the Cherlapally plant: products, services, industries, hours and FAQ.",
          ),
          "",
          ...(productLines.length ? ["## Products", ...productLines, ""] : []),
          ...(serviceLines.length ? ["## Services", ...serviceLines, ""] : []),
          "## Optional",
          line("Privacy policy", "/privacy-policy", ""),
          line("Terms and conditions", "/terms-and-conditions", ""),
          "",
        ].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
