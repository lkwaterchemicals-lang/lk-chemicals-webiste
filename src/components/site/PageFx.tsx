// Route-change choreography: a soft band of water-light sweeps down the
// viewport (#lk-wash) while the incoming page rises into place
// (.lk-page-enter on <main>). Also plays the very first page-rise when the
// boot veil begins to drain.
//
// Deliberate skips:
//   · reduced motion — no ceremony at all;
//   · search/hash-only changes (catalog filters etc.) — same page, no wash;
//   · deep scroll restorations (back/forward) — the rise is designed for
//     top-of-page arrivals, and a transformed <main> would briefly detach the
//     hero's fixed-attachment backdrop: invisible at the top of the page, a
//     visible jump mid-page. The wash still covers those swaps.
import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";

export function PageFx() {
  const washRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let washTimer = 0;

    const risePage = () => {
      if (window.scrollY > 24) return;
      const main = document.querySelector<HTMLElement>(".site-shell main");
      if (!main) return;
      main.classList.remove("lk-page-enter");
      void main.offsetWidth; // restart the CSS animation
      main.classList.add("lk-page-enter");
    };

    const runWash = () => {
      const wash = washRef.current;
      if (!wash) return;
      wash.classList.remove("lk-wash-run");
      void wash.offsetWidth;
      wash.classList.add("lk-wash-run");
      clearTimeout(washTimer);
      washTimer = window.setTimeout(() => wash.classList.remove("lk-wash-run"), 900);
    };

    let prevPath = router.state.location.pathname;
    const unsubscribe = router.subscribe("onResolved", () => {
      const path = router.state.location.pathname;
      if (path === prevPath) return;
      prevPath = path;
      runWash();
      risePage();
    });

    window.addEventListener("lk:boot-exit", risePage);
    return () => {
      unsubscribe();
      window.removeEventListener("lk:boot-exit", risePage);
      clearTimeout(washTimer);
    };
  }, [router]);

  return (
    <div id="lk-wash" ref={washRef} aria-hidden="true">
      <i />
    </div>
  );
}
