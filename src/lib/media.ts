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
