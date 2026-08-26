// Media URL helpers shared by the public site and the admin — YouTube link
// parsing for gallery videos and Google-Maps embed extraction for the
// contact page.

/** Extracts the video id from any YouTube URL shape (watch / share / shorts /
 * embed / live). Returns null for anything that isn't a YouTube link. */
export function youTubeId(url: string): string | null {
  const v = (url ?? "").trim();
  if (!v) return null;
  const patterns = [
    /youtu\.be\/([\w-]{6,})/i,
    /youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)([\w-]{6,})/i,
  ];
  for (const re of patterns) {
    const m = v.match(re);
    if (m) return m[1];
  }
  return null;
}

export const youTubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export const youTubeEmbed = (id: string, autoplay = false) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0${autoplay ? "&autoplay=1" : ""}`;

export type VideoInfo = { kind: "youtube"; id: string } | { kind: "file"; url: string } | null;

/** Classifies a gallery item's `video` value: YouTube link, direct video file
 * (e.g. a Cloudinary upload), or nothing. */
export function videoInfo(video: string | undefined | null): VideoInfo {
  const v = (video ?? "").trim();
  if (!v) return null;
  const yt = youTubeId(v);
  if (yt) return { kind: "youtube", id: yt };
  if (/^https?:\/\//i.test(v)) return { kind: "file", url: v };
  return null;
}

/** Cloudinary video upload → poster frame: swap the file extension for .jpg
 * (Cloudinary renders the first frame). Returns null for non-Cloudinary URLs. */
export function cloudinaryPoster(videoUrl: string): string | null {
  if (!/res\.cloudinary\.com\/.+\/video\/upload\//i.test(videoUrl)) return null;
  return videoUrl.replace(/\.[a-z0-9]+(\?.*)?$/i, ".jpg");
}

/* ---------------------------------------------- cloudinary image delivery */

// Admin uploads land on Cloudinary as full-size originals — often multi-MB
// PNGs straight from a phone or an AI export. Served raw, the home page
// weighed ~27 MB of images (PageSpeed mobile 63). Rewriting the delivery URL
// makes the CDN do the work: f_auto picks AVIF/WebP per browser, q_auto
// compresses to visual quality, and w_<cap>,c_limit downscales without ever
// upscaling. 1600px covers the largest slot on the site (~820 CSS px @2x).
const CLOUDINARY_DELIVERY =
  /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\/)(.+)$/i;

/** Cloudinary image delivery URL → same image via f_auto,q_auto with a width
 * cap. Video URLs are only rewritten for derived poster frames (image
 * extensions); real video files and non-Cloudinary URLs pass through. A URL
 * that already carries a transformation segment is an explicit admin choice
 * and is left alone. */
export function optimizedImageUrl(url: string, width = 1600): string {
  const m = url.match(CLOUDINARY_DELIVERY);
  if (!m) return url;
  const [, prefix, kind, rest] = m;
  // Untransformed delivery URLs start with the version segment (v123/…) or
  // are a bare public id; anything else already has transformations.
  if (rest.includes("/") && !/^v\d+$/.test(rest.split("/")[0])) return url;
  if (kind.toLowerCase() === "video" && !/\.(jpe?g|png|webp|avif|gif)(\?.*)?$/i.test(rest)) {
    return url;
  }
  // Documents also land under /image/upload/ (that is how Cloudinary stores
  // PDFs), and f_auto would rasterise them: a product's TDS download would hand
  // the visitor a JPEG of page 1 instead of the datasheet. Only rewrite files
  // that really are images.
  if (DOCUMENT_FORMAT.test(rest)) return url;
  return `${prefix}f_auto,q_auto,w_${width},c_limit/${rest}`;
}

const DOCUMENT_FORMAT = /\.(pdf|zip|docx?|xlsx?|pptx?|csv|txt|dwg)(\?.*)?$/i;

/** Walk a content document and rewrite every Cloudinary image URL in it —
 * the shared read-path hook (src/lib/content.ts, src/lib/pages.ts) applies
 * this so no render site ever sees a raw multi-MB original. */
export function optimizeImagesDeep<T>(value: T): T {
  if (typeof value === "string") return optimizedImageUrl(value) as T;
  if (Array.isArray(value)) return value.map((v) => optimizeImagesDeep(v)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, optimizeImagesDeep(v)]),
    ) as T;
  }
  return value;
}

/** Accepts what admins actually paste — the full `<iframe …>` snippet from
 * Google Maps' "Embed a map", or just its src URL — and returns a safe embed
 * src. Anything that isn't a Google Maps embed yields null. */
export function extractMapEmbedSrc(input: string | undefined | null): string | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;
  const fromIframe = raw.match(/src\s*=\s*["']([^"']+)["']/i);
  const url = (fromIframe ? fromIframe[1] : raw).trim();
  if (/^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/i.test(url)) return url;
  // Also allow the older share format https://maps.google.com/maps?...&output=embed
  if (/^https:\/\/(maps\.google\.[a-z.]+|www\.google\.[a-z.]+\/maps)\?/i.test(url)) {
    return url.includes("output=embed")
      ? url
      : `${url}${url.includes("?") ? "&" : "?"}output=embed`;
  }
  return null;
}

/** Turns a Cloudinary document URL into one the browser saves instead of
 * previewing, by inserting Cloudinary's `fl_attachment` delivery flag.
 * Non-Cloudinary URLs are returned untouched — a plain link still works, it
 * just opens in the viewer. */
export function downloadUrl(url: string, filename?: string): string {
  const raw = (url ?? "").trim();
  if (!raw) return "";
  const marker = "/upload/";
  const at = raw.indexOf(marker);
  if (!raw.includes("res.cloudinary.com") || at === -1) return raw;
  const flag = filename
    ? `fl_attachment:${encodeURIComponent(filename.replace(/[^\w.-]+/g, "-"))}`
    : "fl_attachment";
  return `${raw.slice(0, at + marker.length)}${flag}/${raw.slice(at + marker.length)}`;
}

/** First page of an uploaded PDF, rendered as an image by Cloudinary.
 *
 * A certificate card showing a generic file icon tells a visitor nothing; the
 * rasterised first page shows the seal, the issuing body and the reference
 * number at a glance. Returns "" for anything that isn't a Cloudinary PDF, so
 * callers can fall back to an icon. */
export function pdfThumbUrl(url: string, width = 640): string {
  const raw = (url ?? "").trim();
  const marker = "/upload/";
  const at = raw.indexOf(marker);
  if (!raw.includes("res.cloudinary.com") || at === -1 || !/\.pdf($|\?)/i.test(raw)) return "";
  const head = raw.slice(0, at + marker.length);
  const tail = raw.slice(at + marker.length).replace(/\.pdf($|\?)/i, ".jpg$1");
  return `${head}pg_1,f_auto,q_auto,w_${width},c_limit/${tail}`;
}
