// 3D card rail — the site's signature mobile carousel.
//
// Native snap-scroll (so touch always feels right) with scroll-linked 3D
// transforms: the centred card sits flat and forward, neighbours fold away
// with perspective. Drifts to the next card on its own while on screen,
// pauses the moment the user touches it, and resumes after they let go.
// Variant "y" = coverflow (cards rotate around Y); variant "x" = easel
// (cards tilt back around X). Honours prefers-reduced-motion.
import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  items: ReactNode[];
  cardClass: string;      // width classes for each card
  variant?: "y" | "x";
  autoMs?: number;
  className?: string;
};

export function Coverflow3D({ items, cardClass, variant = "y", autoMs = 3800, className = "" }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dot, setDot] = useState(0);

  useEffect(() => {
    const rail = railRef.current;
    const wrap = wrapRef.current;
    if (!rail || !wrap) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const applyTransforms = () => {
      raf = 0;
      const mid = rail.scrollLeft + rail.clientWidth / 2;
      let closest = 0, closestD = Infinity;
      for (let i = 0; i < rail.children.length; i++) {
        const card = rail.children[i] as HTMLElement;
        const c = card.offsetLeft + card.offsetWidth / 2;
        const t = Math.max(-1, Math.min(1, (c - mid) / card.offsetWidth));
        const a = Math.abs(t);
        if (a < closestD) { closestD = a; closest = i; }
        if (!reduced) {
          card.style.transform =
            variant === "y"
              ? `perspective(1100px) rotateY(${(-t * 22).toFixed(2)}deg) scale(${(1 - a * 0.10).toFixed(3)}) translateZ(${(-46 * a).toFixed(1)}px)`
              : `perspective(1100px) rotateX(${(t * 14).toFixed(2)}deg) translateY(${(a * 14).toFixed(1)}px) scale(${(1 - a * 0.08).toFixed(3)})`;
          card.style.zIndex = String(100 - Math.round(a * 50));
          card.style.opacity = String(1 - a * 0.28);
        }
      }
      setDot(closest);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(applyTransforms); };
    applyTransforms();
    rail.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(applyTransforms);
    ro.observe(rail);

    // auto-advance — polite: only in view, never while the user is engaged
    let inView = false;
    let lastUser = 0;
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0.35 });
    io.observe(wrap);
    const markUser = () => { lastUser = Date.now(); };
    for (const ev of ["pointerdown", "wheel", "touchstart"] as const) {
      rail.addEventListener(ev, markUser, { passive: true });
    }
    const timer = reduced ? 0 : window.setInterval(() => {
      if (!inView || document.hidden || Date.now() - lastUser < 5000) return;
      const cards = rail.children;
      if (!cards.length) return;
      const mid = rail.scrollLeft + rail.clientWidth / 2;
      let cur = 0;
      for (let i = 0; i < cards.length; i++) {
        const el = cards[i] as HTMLElement;
        if (Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid) <
            Math.abs((cards[cur] as HTMLElement).offsetLeft + (cards[cur] as HTMLElement).offsetWidth / 2 - mid)) cur = i;
      }
      const next = (cur + 1) % cards.length;
      const target = cards[next] as HTMLElement;
      rail.scrollTo({ left: target.offsetLeft + target.offsetWidth / 2 - rail.clientWidth / 2, behavior: "smooth" });
    }, autoMs);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
      io.disconnect();
      ro.disconnect();
      rail.removeEventListener("scroll", onScroll);
      for (const ev of ["pointerdown", "wheel", "touchstart"] as const) rail.removeEventListener(ev, markUser);
    };
  }, [variant, autoMs, items.length]);

  const goTo = (i: number) => {
    const rail = railRef.current;
    const card = rail?.children[i] as HTMLElement | undefined;
    if (!rail || !card) return;
    rail.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - rail.clientWidth / 2, behavior: "smooth" });
  };

  return (
    <div ref={wrapRef} className={className}>
      <div
        ref={railRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-[9vw] py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ perspective: "1100px" }}
      >
        {items.map((it, i) => (
          <div key={i} className={"snap-center shrink-0 transition-opacity duration-150 " + cardClass}>
            {it}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-2">
        {items.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to card ${i + 1}`}
            onClick={() => goTo(i)}
            className={
              "h-1.5 rounded-full transition-all duration-300 " +
              (i === dot ? "w-6 bg-cyan-hi" : "w-1.5 bg-white/25")
            }
          />
        ))}
      </div>
    </div>
  );
}
