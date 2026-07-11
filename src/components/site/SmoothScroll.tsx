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
//   · Fully disabled for prefers-reduced-motion.
//   · On every navigation the router repositions the window instantly (top of
//     page for a new visit, the stored offset for back/forward). If a wheel
//     glide is still in flight at that moment, Lenis's easing would drag the
//     page back toward the old position — so after each render we adopt the
//     router's position as Lenis's new resting state.
import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import Lenis from "lenis";

export function SmoothScroll() {
  const router = useRouter();

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

    // Runs after the router's own onRendered scroll handler (it subscribed
    // first), so window.scrollY is already where the navigation wants us.
    const unsubscribe = router.subscribe("onRendered", () => {
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    });

    return () => {
      unsubscribe();
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [router]);

  return null;
}
