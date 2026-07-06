import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  to?: string;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "ghost" | "leaf";
  size?: "md" | "lg";
  className?: string;
  external?: boolean;
};

export function LiquidButton({
  to,
  href,
  onClick,
  children,
  variant = "primary",
  size = "md",
  className = "",
  external,
}: Props) {
  const base =
    "group relative inline-flex items-center gap-3 rounded-full overflow-hidden transition-all duration-500 font-medium " +
    (size === "lg" ? "px-8 py-4 text-base " : "px-6 py-3 text-sm ");
  const variants = {
    primary:
      "text-ink bg-cyan-hi shadow-[0_10px_40px_-10px_var(--cyan-hi)] hover:shadow-[0_20px_60px_-10px_var(--cyan-hi)]",
    leaf:
      "text-ink bg-leaf shadow-[0_10px_40px_-10px_var(--leaf)] hover:shadow-[0_20px_60px_-10px_var(--leaf)]",
    ghost:
      "text-white border border-white/20 hover:border-cyan-hi hover:text-cyan-hi",
  } as const;

  const inner = (
    <>
      <span className="relative z-10">{children}</span>
      <ArrowUpRight
        className="relative z-10 h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
        aria-hidden
      />
      {variant !== "ghost" && (
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full grad-cyan opacity-0 transition-all duration-700 group-hover:translate-x-0 group-hover:opacity-100"
        />
      )}
    </>
  );

  const cls = base + variants[variant] + " " + className;
  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={cls}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {inner}
      </a>
    );
  }
  if (to) {
    return (
      <Link to={to} onClick={onClick} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}