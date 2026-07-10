import { useEffect, useRef, useState } from "react";

// Top scroll-progress bar. Perf-critical: with Lenis dispatching scroll events
// at up to the display refresh rate, this must never read layout (scrollHeight)
// or setState on every event — that forced a synchronous reflow per frame and
// was a real contributor to scroll jank. Instead we cache the scrollable height
// (recomputed only on resize / DOM growth) and coalesce updates into one rAF.
export function ScrollProgress() {
  const [p, setP] = useState(0);
  const rafRef = useRef(0);
  const maxRef = useRef(0);

  useEffect(() => {
    const measure = () => {
      maxRef.current = document.documentElement.scrollHeight - window.innerHeight;
    };
    const update = () => {
      rafRef.current = 0;
      const h = maxRef.current;
      setP(h > 0 ? Math.min(1, window.scrollY / h) : 0);
    };
    const onScroll = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(update);
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    // The page height changes as images/fonts load and content mounts; watch
    // the document so the bar stays accurate without per-scroll layout reads.
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none">
      <div
        style={{ transform: `scaleX(${p})`, transformOrigin: "left" }}
        className="h-full grad-cyan transition-transform duration-100"
      />
    </div>
  );
}
