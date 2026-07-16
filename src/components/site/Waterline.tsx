export function Waterline({ className = "" }: { className?: string }) {
  return (
    <div className={"relative w-full " + className}>
      <svg className="w-full h-8" viewBox="0 0 1200 32" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="wl" x1="0" x2="1">
            <stop offset="0" stopColor="var(--cyan-hi)" stopOpacity="0" />
            <stop offset="0.4" stopColor="var(--cyan-hi)" />
            <stop offset="0.6" stopColor="var(--leaf)" />
            <stop offset="1" stopColor="var(--cyan-hi)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 16 Q 150 4 300 16 T 600 16 T 900 16 T 1200 16"
          fill="none"
          stroke="url(#wl)"
          strokeWidth="1.2"
        />
        <path
          d="M0 20 Q 150 8 300 20 T 600 20 T 900 20 T 1200 20"
          fill="none"
          stroke="url(#wl)"
          strokeWidth="0.7"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}
