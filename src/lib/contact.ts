// Contact link builders — one place that turns free-text Site settings into
// links that actually open.
//
// Every field behind these ("+91 73311 34031", " lk.waterchemicals@gmail.com ")
// is typed by a human into a dashboard box, so nothing here may assume a
// canonical format. wa.me in particular takes the number as a PATH SEGMENT: a
// single space in the stored value produced `https://wa.me/91 7331134031`,
// which WhatsApp answered with its 404 page — the site's most-used call to
// action, dead. Sanitising at the link layer (not at the input) means the fix
// holds no matter how the number is typed or re-typed later.
import { staticSettings, type SiteSettings } from "@/data/content";

/** Everything that isn't a digit, gone. "+91 73311 34031" → "917331134031". */
export const digitsOnly = (v: unknown): string => String(v ?? "").replace(/\D+/g, "");

/** A live cache of the admin's settings, kept fresh by useSiteSettings so the
 * plain (non-hook) builders below stay correct wherever they are called. */
let current: SiteSettings = staticSettings;

/** Called by useSiteSettings on every resolve — see src/lib/content.ts. */
export function primeContactSettings(s: SiteSettings) {
  current = s;
}

/** International number for wa.me, with the country code guaranteed.
 * A 10-digit Indian mobile typed without "91" still has to reach WhatsApp. */
export function waNumber(raw?: string): string {
  const d = digitsOnly(raw ?? current.whatsapp);
  if (!d) return "";
  return d.length === 10 ? `91${d}` : d;
}

/** Chat link. Falls back to the built-in number if settings are empty. */
export function waLink(msg = "Hi LK Chemicals, I would like to enquire."): string {
  const n = waNumber() || digitsOnly(staticSettings.whatsapp);
  return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`;
}

/** tel: keeps the leading + so mobile diallers treat it as international. */
export function telHref(raw?: string): string {
  const d = digitsOnly(raw ?? current.phone);
  if (!d) return "";
  return `tel:+${d.length === 10 ? `91${d}` : d}`;
}

/** mailto: with the address trimmed — a stray space breaks the whole link. */
export function mailHref(raw?: string, subject?: string): string {
  const address = String(raw ?? current.email ?? "").trim();
  if (!address) return "";
  return subject ? `mailto:${address}?subject=${encodeURIComponent(subject)}` : `mailto:${address}`;
}

/** The address a visitor should actually reach. Reads Site settings, so the
 * dashboard stays the single source of truth. */
export const primaryEmail = (): string => String(current.email ?? "").trim();
