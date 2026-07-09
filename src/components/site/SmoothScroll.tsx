// World-class scroll feel — Lenis inertial smoothing over native scroll.
//
// Wheel and keyboard input glide with an exponential ease instead of stepping,
// which also makes every scroll-linked effect on the site (pinned product
// rail, water canvas, deck stacking, parallax) render buttery instead of
// jumping between wheel ticks. Design decisions:
//   · Touch stays NATIVE (syncTouch off): phone momentum scrolling is already
//     the best-feeling physics there is — hijacking it feels worse and costs
//     battery. Mobile still benefits: anchors glide, and the perf work keeps
//     frames cheap.
//   · Anchor links (#enquire etc.) glide with a -96px offset so targets land
//     below the fixed nav.
//   · The router's instant scroll restoration still works: Lenis adopts
//     external jumps from its native-scroll listener.
//   · Fully disabled for prefers-reduced-motion.
import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      syncTouch: false,
      anchors: { offset: -96 },
    });

    let raf = requestAnimationFrame(function loop(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
