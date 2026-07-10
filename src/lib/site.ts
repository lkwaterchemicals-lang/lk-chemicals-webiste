// Canonical site origin + absolute-URL helpers.
//
// Social crawlers (WhatsApp, Facebook, Google) require absolute URLs in
// og:image / sitemap entries. On the client we trust the real origin; during
// SSR we fall back to the configured canonical origin.
import { useEffect } from "react";

export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/+$/, "") ||
  "https://lk-chemicals.vercel.app";

export function absUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof location !== "undefined") return `${location.origin}${p}`;
  return `${SITE_URL}${p}`;
}

/** Keep the live document head in sync for records that only exist in
 * Firestore (route `head()` can't see them during SPA navigation). Browser
 * share sheets read og:* straight from the DOM, so this is what puts the
 * product photo + real title on the share card. */
export function useLiveMeta(
  meta: { title: string; description?: string; image?: string | null; url?: string } | null,
) {
  const title = meta?.title ?? "";
  const description = meta?.description ?? "";
  const image = meta?.image ?? "";
  const url = meta?.url ?? "";
  useEffect(() => {
    if (!title) return;
    const set = (attr: "name" | "property", key: string, content: string) => {
      if (!content) return;
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    document.title = title;
    set("property", "og:title", title);
    set("name", "twitter:title", title);
    set("name", "description", description);
    set("property", "og:description", description);
    if (image) {
      set("property", "og:image", absUrl(image));
      set("name", "twitter:image", absUrl(image));
      set("name", "twitter:card", "summary_large_image");
    }
    if (url) set("property", "og:url", absUrl(url));
  }, [title, description, image, url]);
}
