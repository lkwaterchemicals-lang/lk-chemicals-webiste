// The brand's signature opening — a fixed veil, SSR-rendered so it is part of
// the very first paint: living water rises over the company logo (on a
// porcelain tile, ghost → full colour), a wave crest and bubbles ride the
// waterline, the wordmark settles beneath, and the whole sheet finally drains
// upward with a curved water edge, handing the page over mid-motion.
//
// All choreography lives in styles.css (.lk-boot …); this component only
// drives the phase machine:
//
//   enter ──(min hold + fonts settled)──▶ exit ──(sheet drained)──▶ unmount
//
//   · First load of the session plays the full beat; reloads get the tighter
//     variant via the `lk-seen` class the head script stamps on <html>
//     before paint (so SSR HTML and hydration always agree).
//   · SPA remounts (e.g. /admin → /) never replay it — module-level flag.
//   · prefers-reduced-motion skips straight to done (CSS also hides the veil
//     for those users before hydration).
//   · A CSS failsafe dissolves the veil on its own if JS never runs.
import { useEffect, useRef, useState } from "react";
import logoUrl from "@/assets/lk-logo.png";

// Client-only; must never be set during SSR or one visitor's boot would
// suppress every later visitor's (module state persists on the server).
let bootPlayed = false;

// Crest waves: sine-ish ribbons with a 30px period, so the ±60px drift loops
// in styles.css repeat seamlessly. Q sets the first half-wave, each T mirrors
// the previous control point — alternating crests the whole way across.
const wave = (from: number, to: number, dipFirst: boolean) => {
  let d = `M${from} 6 Q${from + 7.5} ${dipFirst ? 10.5 : 1.5} ${from + 15} 6`;
  for (let x = from + 30; x <= to; x += 15) d += ` T${x} 6`;
  return d + ` V12 H${from} Z`;
};
const WAVE_A = wave(0, 450, false);
const WAVE_B = wave(-60, 435, true);

type Phase = "enter" | "exit" | "done";

export function BootVeil() {
  const [phase, setPhase] = useState<Phase>(() => (bootPlayed ? "done" : "enter"));
  // Captured at first render, before the effect flips bootPlayed.
  const skipRef = useRef(bootPlayed);

  useEffect(() => {
    if (skipRef.current) return;
    bootPlayed = true;

    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      return;
    }

    const seen = root.classList.contains("lk-seen");
    try {
      sessionStorage.setItem("lk-boot", "1");
    } catch {
      /* private mode — every load simply plays the full beat */
    }

    let cancelled = false;
    let doneTimer = 0;

    // The CSS choreography started at first paint, not at hydration — anchor
    // the hold to page start so slow hydration never stretches the veil; the
    // topup animation continues gracefully from wherever the fill is.
    const target = seen ? 900 : 2050;
    const holdMs = Math.max(target - performance.now(), seen ? 300 : 500);
    const hold = new Promise((r) => setTimeout(r, holdMs));
    // The wordmark must not swap fonts mid-reveal — but never wait long.
    const fonts =
      "fonts" in document
        ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))])
        : Promise.resolve();

    Promise.all([hold, fonts]).then(() => {
      if (cancelled) return;
      setPhase("exit");
      // PageFx plays the first page-rise as the veil drains.
      window.dispatchEvent(new Event("lk:boot-exit"));
      // Sheet drain: 0.24s + 1s full, 0.15s + 0.85s quick — plus breath.
      doneTimer = window.setTimeout(() => setPhase("done"), seen ? 1150 : 1400);
    });

    return () => {
      cancelled = true;
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div className="lk-boot" data-phase={phase} aria-hidden="true">
      <div className="lk-boot-sheet">
        <div className="lk-boot-glow" />
        <i className="lk-boot-blob lk-boot-blob-a" />
        <i className="lk-boot-blob lk-boot-blob-b" />
        {/* curved water edge hanging under the sheet — the drain meniscus */}
        <svg className="lk-boot-edge" viewBox="0 0 1440 110" preserveAspectRatio="none">
          <path d="M0 0h1440v44c-204 56-396-18-624 14C588 90 300 24 0 70Z" />
        </svg>
        <div className="lk-boot-core">
          <div className="lk-ripples">
            <i />
            <i />
            <i />
          </div>
          <div className="lk-boot-mark">
            <img className="lk-boot-logo lk-boot-ghost" src={logoUrl} alt="" draggable={false} />
            <div className="lk-boot-fill">
              <div className="lk-boot-fill-inner">
                <img
                  className="lk-boot-logo"
                  src={logoUrl}
                  alt=""
                  fetchPriority="high"
                  draggable={false}
                />
                <div className="lk-boot-tint" />
                <i className="lk-bub lk-bub-1" />
                <i className="lk-bub lk-bub-2" />
                <i className="lk-bub lk-bub-3" />
                <i className="lk-bub lk-bub-4" />
                <i className="lk-bub lk-bub-5" />
              </div>
            </div>
            <div className="lk-boot-crest-track">
              <svg className="lk-boot-crest" width="380" height="12" viewBox="0 0 380 12">
                <path className="lk-wave lk-wave-a" d={WAVE_A} />
                <path className="lk-wave lk-wave-b" d={WAVE_B} />
              </svg>
            </div>
          </div>
          <div className="lk-boot-word">
            <div className="lk-boot-brand">LK&nbsp;CHEMICALS</div>
            <div className="lk-boot-line" />
            <div className="lk-boot-sub">We Engineer Water</div>
          </div>
        </div>
      </div>
    </div>
  );
}
