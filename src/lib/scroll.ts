// One way to move the page.
//
// The site runs Lenis for inertial wheel smoothing, which means there are two
// scroll systems in play: Lenis's virtual position and the browser's real one.
// Calling `scrollIntoView({ behavior: "smooth" })` while Lenis is running makes
// them fight — Lenis keeps easing toward its own target and the native
// animation gets clobbered, so the page lands somewhere arbitrary.
//
// It gets worse when the scroll is triggered by a view swap (category grid
// replacing the category tiles). The outgoing section is taller than the
// incoming one, so at the moment of the click the document shrinks and the
// browser clamps scrollY to the new maximum — the bottom of the page. That is
// how "show me all products" ended up at the footer.
//
// The fix is this module: SmoothScroll registers its Lenis instance here, and
// everything that wants to move the page asks through `scrollToElement`, which
// waits for layout to settle before it measures.

type ScrollTarget = number | HTMLElement;

type ScrollEngine = {
  scrollTo: (
    target: ScrollTarget,
    options?: { offset?: number; duration?: number; immediate?: boolean; force?: boolean },
  ) => void;
};

let engine: ScrollEngine | null = null;

/** Called by SmoothScroll. Returns an unregister function for cleanup. */
export function registerScrollEngine(instance: ScrollEngine): () => void {
  engine = instance;
  return () => {
    if (engine === instance) engine = null;
  };
}

/** Height of the fixed nav — targets land below it rather than under it. */
export const NAV_OFFSET = -96;

/** Runs after the browser has laid out the frame that a state change produced.
 * One frame schedules the work, the second runs once layout and style are
 * committed, so heights measured here are the ones the user will see. */
function afterLayout(run: () => void) {
  if (typeof requestAnimationFrame !== "function") {
    run();
    return;
  }
  requestAnimationFrame(() => requestAnimationFrame(run));
}

/** Glides the page so `el` sits just below the nav. Uses Lenis when it is
 * running (reduced-motion visitors have no Lenis, and get a native scroll). */
export function scrollToElement(el: HTMLElement | null, offset = NAV_OFFSET) {
  if (!el) return;
  afterLayout(() => {
    if (engine) {
      engine.scrollTo(el, { offset, force: true });
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    window.scrollTo({ top: Math.max(0, top), behavior });
  });
}
