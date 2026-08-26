// WhatsApp hand-off for form submissions.
//
// Every public form keeps writing to Firestore exactly as before; this adds a
// second step on success — WhatsApp opens with the submission already typed
// out, so the visitor only has to hit send and the enquiry lands on the phone
// the team actually watches.
//
// The whole design turns on one browser rule: a popup is only allowed while the
// browser still considers itself inside a user gesture. Saving to Firestore is
// an `await`, and by the time it resolves the gesture is long gone — a
// `window.open` there is blocked in every modern browser. So the tab is
// RESERVED synchronously inside the submit handler and merely pointed at
// WhatsApp once the write succeeds. If even that is blocked (some in-app
// browsers refuse outright) the caller still gets the URL back and can show a
// tap-to-send button, so the hand-off can never silently vanish.
import { useWaLink } from "@/lib/content";

/** A field on the submitted form: label plus whatever the visitor typed. */
export type WaField = [label: string, value: unknown];

export type ReservedTab = {
  /** Point the reserved tab at `url`. Returns false if it never opened. */
  navigate: (url: string) => boolean;
  /** Give up the tab — the save failed, so there is nothing to send. */
  cancel: () => void;
};

/** Opens a blank tab NOW, while the click is still trusted.
 *
 * Deliberately WITHOUT the `noopener` feature: per spec that makes
 * `window.open` return null, which would leave nothing to navigate later and
 * silently push us onto the blocked-popup path. The opener reference is severed
 * by hand instead, just before the tab leaves for WhatsApp. */
export function reserveTab(): ReservedTab {
  let win: Window | null = null;
  try {
    win = window.open("about:blank", "_blank");
  } catch {
    win = null;
  }
  return {
    navigate(url) {
      try {
        if (win && !win.closed) {
          // Same effect as rel="noopener" without costing us the handle.
          try {
            win.opener = null;
          } catch {
            /* cross-origin already — nothing to sever */
          }
          win.location.replace(url);
          win.focus?.();
          return true;
        }
        // No reserved tab (blocked at click time) — one last attempt; if the
        // browser refuses this too the caller shows a tap-to-send button.
        return Boolean(window.open(url, "_blank", "noopener"));
      } catch {
        return false;
      }
    },
    cancel() {
      try {
        if (win && !win.closed) win.close();
      } catch {
        /* already gone */
      }
    },
  };
}

/** Formats a submission as a WhatsApp message. Bold labels, blank fields
 * dropped — the recipient reads it on a phone, so it has to stay scannable. */
export function formatSubmission(title: string, fields: WaField[]): string {
  const lines = fields
    .map(([label, value]) => {
      const v = String(value ?? "").trim();
      return v ? `*${label}:* ${v}` : "";
    })
    .filter(Boolean);
  const page = typeof location !== "undefined" && location.pathname !== "/" ? location.href : "";
  const footer = page ? `_Sent from ${page}_` : "";
  return [`*${title} — LK Chemicals*`, "", ...lines, "", footer].join("\n").trim();
}

/** Wires a form's success path to WhatsApp.
 *
 * Returns `deliver`, which builds the message, sends the reserved tab to
 * WhatsApp, and hands back the URL so the caller can offer a manual
 * "Send on WhatsApp" button when the browser refused the popup. */
export function useWhatsAppHandoff() {
  const waHref = useWaLink();

  return {
    reserve: reserveTab,
    deliver(tab: ReservedTab, title: string, fields: WaField[]) {
      const url = waHref(formatSubmission(title, fields));
      const opened = tab.navigate(url);
      return { url, opened };
    },
  };
}
