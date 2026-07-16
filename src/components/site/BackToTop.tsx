// Back-to-top — a circular glass button with a scroll-progress ring. Appears
// after the first viewport of scrolling, works in both themes, and stays clear
// of the call/WhatsApp cluster (bottom-right) by living bottom-left.
import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

const R = 20; // ring radius (viewBox units)
const CIRC = 2 * Math.PI * R;

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      setVisible(window.scrollY > 500);
      // Drive the ring directly — no re-render per scroll frame.
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = String(CIRC * (1 - p));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  const toTop = () => {
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={toTop}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={
        "back-to-top fixed left-4 bottom-4 sm:left-6 sm:bottom-6 z-[60] grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-full " +
        (visible ? "opacity-100" : "opacity-0 translate-y-3 pointer-events-none")
      }
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
        <circle
          cx="24"
          cy="24"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth="2.5"
        />
        <circle
          ref={ringRef}
          cx="24"
          cy="24"
          r={R}
          fill="none"
          stroke="url(#btt-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC}
        />
        <defs>
          <linearGradient id="btt-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.17 232)" />
            <stop offset="100%" stopColor="oklch(0.7 0.2 150)" />
          </linearGradient>
        </defs>
      </svg>
      <ArrowUp className="h-4 w-4 sm:h-[18px] sm:w-[18px] relative" />
    </button>
  );
}
