export function GhostWord({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={"ghost-word block text-[18vw] md:text-[14vw] " + className}
    >
      {children}
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