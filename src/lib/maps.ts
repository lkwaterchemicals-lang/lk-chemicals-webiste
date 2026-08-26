// Map links, derived entirely from Site settings.
//
// The map used to be pinned by hard-coded coordinates, which is exactly the
// kind of thing that goes stale silently: the company moved to the Officers
// Colony address and the pin still pointed at the old unit, with nobody able
// to correct it from the dashboard. Now there are two editable inputs and
// nothing else — the postal address, and the Google Maps link the admin gets
// from Google's own Share button — and every button and the embedded map are
// computed from those.
import { extractMapEmbedSrc } from "@/lib/media";
import type { SiteSettings } from "@/data/content";

/** A pasted Google Maps link, cleaned up. Accepts a share.google short link,
 * a maps.app.goo.gl link, a full google.com/maps URL, or a whole `<iframe …>`
 * snippet — the four things an admin can plausibly end up with. */
export function mapsLink(s: Pick<SiteSettings, "mapsLink" | "mapQuery">): string {
  const raw = (s.mapsLink ?? "").trim();
  if (raw) {
    const fromIframe = raw.match(/src\s*=\s*["']([^"']+)["']/i);
    return (fromIframe ? fromIframe[1] : raw).trim();
  }
  // Legacy: `mapQuery` held a search *term* originally, but at least one saved
  // value is a full Google URL. Accept either rather than building
  // `maps?q=https://www.google.com/search?...` out of it.
  const legacy = (s.mapQuery ?? "").trim();
  return /^https?:\/\//i.test(legacy) ? legacy : "";
}

/** Where "Open in Google Maps" should go. Prefers the admin's own link. */
export function mapsViewUrl(s: SiteSettings): string {
  const link = mapsLink(s);
  if (link) return link;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchTerm(s))}`;
}

/** Where "Get directions" should go. Google resolves a place link as the
 * destination, so the admin's link is used verbatim when there is one. */
export function mapsDirectionsUrl(s: SiteSettings): string {
  const link = mapsLink(s);
  if (link) return link;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(searchTerm(s))}`;
}

/** The `src` for the embedded map.
 *
 * Short share links cannot be framed (Google refuses them with
 * X-Frame-Options), so the iframe is driven by an explicit "Embed a map" URL
 * when the admin has pasted one, and otherwise by the postal address — which
 * is the thing the admin is already keeping accurate. */
export function mapsEmbedSrc(s: SiteSettings, pastedEmbed?: string): string {
  const explicit = extractMapEmbedSrc(pastedEmbed);
  if (explicit) return explicit;
  const zoom = (s.mapZoom ?? "17").trim() || "17";
  return `https://www.google.com/maps?q=${encodeURIComponent(searchTerm(s))}&z=${zoom}&hl=en&output=embed`;
}

/** What to hand Google when there is no link — the address, plus the company
 * name so a bare plot number can't match a different suburb. */
function searchTerm(s: SiteSettings): string {
  const address = (s.address ?? "").trim();
  return address ? `LK Chemicals Private Limited, ${address}` : "LK Chemicals Private Limited";
}
