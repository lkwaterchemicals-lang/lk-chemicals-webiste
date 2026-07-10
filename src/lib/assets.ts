// Asset URL + caption hygiene shared by the public site and the admin.
import type { SyntheticEvent } from "react";

/* ------------------------------------------------------------ asset URLs */

// Firestore must never store Vite's hashed bundle URLs (they can change with
// a redeploy and then 404). The same images live at stable paths under
// /public/content, so remap bundle URLs to "/content/x.jpg". Non-asset
// strings pass through untouched.
export function stableAssetUrl(url: unknown): unknown {
  if (typeof url !== "string" || url.startsWith("http") || url.startsWith("/content/")) return url;
  const base = url.split("?")[0].split("/").pop() ?? "";
  const m = base.match(/^(.+?)(?:-(?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]{8})?\.(jpe?g|png|webp)$/i);
  return m ? `/content/${m[1]}.${m[2].toLowerCase() === "jpeg" ? "jpg" : m[2].toLowerCase()}` : url;
}

export function stabilizeAssets(item: Record<string, unknown>): Record<string, unknown> {
  const out = { ...item };
  for (const key of ["image", "img", "src"]) {
    if (key in out) out[key] = stableAssetUrl(out[key]);
  }
  return out;
}

/** Walk any content document and remap every image-looking string in it —
 * heals page docs that were saved with a stale hashed bundle URL. */
export function stabilizeDeep<T>(value: T): T {
  if (typeof value === "string") return stableAssetUrl(value) as T;
  if (Array.isArray(value)) return value.map((v) => stabilizeDeep(v)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, stabilizeDeep(v)]),
    ) as T;
  }
  return value;
}

/** onError handler for hero/backdrop images: swap to the built-in default
 * once (never loops) so a dead URL can't leave a broken-image hole. */
export function imgFallback(fallback: string) {
  return (e: SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (el.dataset.fellBack) return;
    el.dataset.fellBack = "1";
    el.src = fallback;
  };
}

/* -------------------------------------------------------------- captions */

// Camera/AI exports arrive with names like "ChatGPT Image Jul 8, 2026, 04 12
// 50 PM.png" or "IMG_20240712_113045.jpg" — never show those to visitors.
const JUNK_CAPTION =
  /chat\s*gpt|dall[\s·.-]?e|midjourney|stable[\s-]?diffusion|copilot|gemini|generated|screenshot|screen[\s-]?shot|whatsapp\s*image|^(img|dsc|dscf|dscn|pxl|mvimg|vid|pict?)[\s_-]*\d|^\d{6,}/i;

export function isJunkCaption(s: string): boolean {
  const t = s.trim();
  if (!t) return true;
  if (JUNK_CAPTION.test(t)) return true;
  // Timestamp-ish runs ("2026 07 08 04 12 50", "20260708-041250") or captions
  // that are mostly digits read as file names, not captions.
  if (/\d{1,4}([\s.:_-]+\d{1,4}){3,}/.test(t)) return true;
  const digits = (t.match(/\d/g) ?? []).length;
  return digits / t.length > 0.4;
}

/** Human caption from a possibly-raw file name; falls back when it's junk. */
export function cleanCaption(raw: string | undefined | null, fallback: string): string {
  const base = String(raw ?? "")
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  return isJunkCaption(base) ? fallback : base;
}
