// Route-change choreography: the incoming page rises gently into place
// (.lk-page-enter on <main>). Also plays the very first page-rise when the
// boot veil begins to drain.
//
// (The old full-viewport "water wash" band that swept top→bottom on every
// route change is gone — in the light theme its crest read as a white flash
// line, a glitch rather than a transition.)
//
// Deliberate skips:
//   · reduced motion — no ceremony at all;
//   · search/hash-only changes (catalog filters etc.) — same page, no rise;
//   · deep scroll restorations (back/forward) — the rise is designed for
//     top-of-page arrivals, and a transformed <main> would briefly detach the
//     hero's fixed-attachment backdrop: invisible at the top of the page, a
//     visible jump mid-page.
import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

export function PageFx() {
  const router = useRouter();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const risePage = () => {
      if (window.scrollY > 24) return;
      const main = document.querySelector<HTMLElement>(".site-shell main");
      if (!main) return;
      main.classList.remove("lk-page-enter");
      void main.offsetWidth; // restart the CSS animation
      main.classList.add("lk-page-enter");
      // Drop the class the moment the rise finishes: fill-mode keeps an
      // identity transform on <main>, and ANY transform makes it the
      // containing block for position:fixed descendants — the contact dock
      // was pinning to main's bottom edge instead of the screen.
      main.addEventListener(
        "animationend",
        (e) => {
          if (e.animationName === "lk-page-in") main.classList.remove("lk-page-enter");
        },
        { once: true },
      );
    };

    let prevPath = router.state.location.pathname;
    const unsubscribe = router.subscribe("onResolved", () => {
      const path = router.state.location.pathname;
      if (path === prevPath) return;
      prevPath = path;
      risePage();
    });

    window.addEventListener("lk:boot-exit", risePage);
    return () => {
      unsubscribe();
      window.removeEventListener("lk:boot-exit", risePage);
    };
  }, [router]);

  return null;
}
