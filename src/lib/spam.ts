// Spam protection shared by every public form.
//
// Three layers, cheapest first:
//  1. Honeypot — a visually hidden "website" field. Humans never see it,
//     scripted bots almost always fill it.
//  2. Time trap — a form submitted within ~2.5s of mounting was not typed
//     by a person.
//  3. Google reCAPTCHA v3 (optional) — activates automatically when
//     VITE_RECAPTCHA_SITE_KEY is set; the score token is stored with the
//     submission for auditing. Forms work unchanged when the key is absent.
export const RECAPTCHA_SITE_KEY =
  (import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined) || "";

type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

let loader: Promise<void> | null = null;

function loadRecaptcha(): Promise<void> {
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    if (window.grecaptcha) return resolve();
    const s = document.createElement("script");
    s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    s.async = true;
    s.onload = () => window.grecaptcha?.ready(() => resolve());
    s.onerror = () => reject(new Error("recaptcha failed to load"));
    document.head.appendChild(s);
  });
  return loader;
}

/** Returns a reCAPTCHA v3 token, or null when not configured / unavailable. */
export async function getRecaptchaToken(action: string): Promise<string | null> {
  if (!RECAPTCHA_SITE_KEY || typeof window === "undefined") return null;
  try {
    await loadRecaptcha();
    return await window.grecaptcha!.execute(RECAPTCHA_SITE_KEY, { action });
  } catch {
    return null; // never block a real lead on a third-party hiccup
  }
}

/** True when the honeypot was filled or the form was submitted inhumanly fast. */
export function isLikelySpam(honeypot: string, openedAt: number): boolean {
  return Boolean(honeypot.trim()) || Date.now() - openedAt < 2500;
}

/** Props for the visually hidden honeypot input — spread onto an <input>. */
export const honeypotProps = {
  name: "website",
  tabIndex: -1,
  autoComplete: "off",
  "aria-hidden": true as const,
  style: {
    position: "absolute",
    left: "-9999px",
    height: 1,
    width: 1,
    opacity: 0,
    pointerEvents: "none",
  } as const,
};
