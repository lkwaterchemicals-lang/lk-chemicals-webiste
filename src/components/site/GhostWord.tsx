import { useLayoutEffect, useRef } from "react";

// Decorative outline typography. The inner span measures itself against its
// section and scales DOWN (never up) so the word renders pixel-perfect at
// every viewport width — no cropping, ever, in either theme.
export function GhostWord({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const inner = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const fit = () => {
      el.style.transform = "";
      const host = el.closest("section, footer, main") as HTMLElement | null;
      const avail = (host?.clientWidth ?? window.innerWidth) * 0.97;
      const w = el.scrollWidth;
      if (w > avail) el.style.transform = `scale(${avail / w})`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(document.documentElement);
    const host = el.closest("section, footer, main");
    if (host) ro.observe(host);
    return () => ro.disconnect();
  }, [children]);

  return (
    <span aria-hidden className={"ghost-word block text-[18vw] md:text-[14vw] " + className}>
      <span ref={inner} className="inline-block whitespace-nowrap origin-center will-change-transform">
        {children}
      </span>
    </span>
  );
}

export function MicroLabel({
  n,
  children,
  className = "",
}: {
  n?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"micro-label flex items-center gap-3 " + className}>
      {n && <span>{n}</span>}
      {n && <span className="h-px w-8 bg-current opacity-50" />}
      <span>{children}</span>
    </div>
  );
}
