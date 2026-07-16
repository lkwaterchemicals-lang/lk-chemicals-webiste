// Admin UI primitives — every control in the dashboard is built from these,
// so tone, radius, spacing and focus behaviour stay identical everywhere.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, ChevronDown, Loader2, X } from "lucide-react";

/* ---------------------------------------------------------------- buttons */

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "soft" | "danger" | "bare";
  size?: "md" | "sm";
  icon?: LucideIcon;
  busy?: boolean;
};

export function Btn({ variant = "ghost", size = "md", icon: Icon, busy, children, className = "", ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || busy}
      className={`a-btn a-btn-${variant} ${size === "sm" ? "a-btn-sm" : ""} ${className}`}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
}

export function IconBtn({
  label,
  icon: Icon,
  size = "md",
  variant = "bare",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: LucideIcon;
  size?: "md" | "sm";
  variant?: "bare" | "ghost" | "danger";
}) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={`a-btn a-btn-${variant} a-iconbtn ${size === "sm" ? "a-btn-sm" : ""} ${className}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

/* ----------------------------------------------------------------- badges */

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: "neutral" | "accent" | "ok" | "warn" | "danger";
  children: ReactNode;
  className?: string;
}) {
  return <span className={`a-badge a-badge-${tone} ${className}`}>{children}</span>;
}

/* ------------------------------------------------------------------ cards */

export function Card({
  title,
  action,
  children,
  className = "",
  pad = true,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <section className={`a-card ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-5 pt-4 pb-0">
          <h3 className="min-w-0 text-sm font-semibold">{title}</h3>
          {action}
        </header>
      )}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 a-rise">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl leading-tight">{title}</h1>
        {sub && <p className="mt-1 text-[13px]" style={{ color: "var(--a-text2)" }}>{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ forms */

export function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold" style={{ color: "var(--a-text2)" }}>
          {label} {required && <span style={{ color: "var(--a-danger)" }}>*</span>}
        </span>
        {hint && <span className="text-[11px]" style={{ color: "var(--a-text3)" }}>{hint}</span>}
      </div>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p className="mt-1 text-xs flex items-center gap-1" style={{ color: "var(--a-danger)" }}>
          <AlertTriangle className="h-3 w-3" /> {error}
        </p>
      )}
    </label>
  );
}

export function SelectWrap({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
        style={{ color: "var(--a-text3)" }}
      />
    </div>
  );
}

/* --------------------------------------------------------------- overlays */

function useEsc(onClose: () => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    addEventListener("keydown", h);
    return () => removeEventListener("keydown", h);
  }, [onClose]);
}

function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  // Overlays portal to the admin root so theme tokens still apply.
  const host = document.querySelector(".adm") ?? document.body;
  return createPortal(children, host);
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEsc(onClose);
  if (!open) return null;
  return (
    <Portal>
      <div className="a-overlay overflow-y-auto" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="min-h-full grid place-items-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className={`a-card a-pop w-full ${wide ? "max-w-2xl" : "max-w-md"}`}
            style={{ boxShadow: "var(--a-shadow-lg)" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--a-border)" }}>
              <h3 className="text-sm font-semibold">{title}</h3>
              <IconBtn label="Close" icon={X} size="sm" onClick={onClose} />
            </header>
            <div className="p-5">{children}</div>
            {footer && (
              <footer className="flex justify-end gap-2 px-5 py-4" style={{ borderTop: "1px solid var(--a-border)" }}>
                {footer}
              </footer>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  sub,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEsc(onClose);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) ref.current?.querySelector<HTMLElement>("input, textarea, select, button")?.focus();
  }, [open]);
  if (!open) return null;
  return (
    <Portal>
      <div className="a-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className="a-slide-right fixed inset-y-0 right-0 flex w-full max-w-xl flex-col"
          style={{ background: "var(--a-surface)", borderLeft: "1px solid var(--a-border)", boxShadow: "var(--a-shadow-lg)" }}
        >
          <header className="flex items-start justify-between gap-3 px-5 sm:px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--a-border)" }}>
            <div className="min-w-0">
              <h3 className="text-base font-semibold truncate">{title}</h3>
              {sub && <p className="mt-0.5 text-xs truncate" style={{ color: "var(--a-text3)" }}>{sub}</p>}
            </div>
            <IconBtn label="Close" icon={X} onClick={onClose} />
          </header>
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">{children}</div>
          {footer && (
            <footer
              className="flex flex-wrap items-center justify-end gap-2 px-5 sm:px-6 py-4 shrink-0"
              style={{ borderTop: "1px solid var(--a-border)", background: "var(--a-surface)" }}
            >
              {footer}
            </footer>
          )}
        </div>
      </div>
    </Portal>
  );
}

export function Confirm({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = "Delete",
  tone = "danger",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "primary";
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn
            variant={tone === "danger" ? "danger" : "primary"}
            busy={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                onClose();
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirmLabel}
          </Btn>
        </>
      }
    >
      <p className="text-[13px]" style={{ color: "var(--a-text2)" }}>{body}</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ misc */

export function Empty({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center py-16 px-6 text-center">
      <span
        className="grid h-12 w-12 place-items-center rounded-2xl"
        style={{ background: "var(--a-accent-soft)", color: "var(--a-accent)" }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-[13px]" style={{ color: "var(--a-text2)" }}>{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SkeletonRows({ n = 5, h = 44 }: { n?: number; h?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="a-skel w-full" style={{ height: h, animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  );
}

export function FirestoreError({ error }: { error: unknown }) {
  const msg = error instanceof Error ? error.message : String(error);
  const notEnabled = /has not been used|is disabled|PERMISSION_DENIED/i.test(msg);
  return (
    <div className="a-card p-5 text-[13px]" style={{ borderColor: "color-mix(in oklab, var(--a-danger) 35%, var(--a-border))" }}>
      <p className="font-semibold flex items-center gap-2" style={{ color: "var(--a-danger)" }}>
        <AlertTriangle className="h-4 w-4" /> Firestore isn't reachable.
      </p>
      {notEnabled ? (
        <p className="mt-2" style={{ color: "var(--a-text2)" }}>
          Enable it once in the Firebase console: open{" "}
          <a
            className="underline"
            style={{ color: "var(--a-accent)" }}
            href="https://console.firebase.google.com/project/lk-chemicals/firestore"
            target="_blank"
            rel="noreferrer"
          >
            Firestore Database
          </a>{" "}
          → <b>Create database</b>, allow public reads and authenticated writes in the rules, then reload. The
          public site keeps using the built-in content until then.
        </p>
      ) : (
        <p className="mt-2 break-all" style={{ color: "var(--a-text2)" }}>{msg}</p>
      )}
    </div>
  );
}
