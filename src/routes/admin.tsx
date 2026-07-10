// Admin 3.0 — layout route. Firebase Auth gates access; children render
// inside the AdminShell. All admin styling is scoped under `.adm`.
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import {
  ArrowRight,
  Droplets,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { auth } from "@/integrations/firebase/auth";
import logoUrl from "@/assets/lk-logo.png";
import { AdminShell } from "@/admin/shell";
import { useAdminTheme } from "@/admin/theme";
import "@/admin/admin.css";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — LK Chemicals" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [theme, , toggleTheme] = useAdminTheme();

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setAuthReady(true);
      }),
    [],
  );

  return (
    <div className="adm min-h-screen" data-atheme={theme} suppressHydrationWarning>
      {!authReady ? (
        <div className="grid min-h-screen place-items-center">
          <div className="flex flex-col items-center gap-3">
            <img src={logoUrl} alt="" className="h-10 w-10 object-contain" />
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--a-text3)" }} />
          </div>
        </div>
      ) : user ? (
        <AdminShell user={user} theme={theme} toggleTheme={toggleTheme}>
          <Outlet />
        </AdminShell>
      ) : (
        <Login />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------- login */

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setError("Sign-in failed — check the email and password.");
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!email.trim()) {
      setError("Enter your email first, then tap “Forgot password”.");
      return;
    }
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice("Password reset email sent — check the inbox.");
    } catch {
      setError("Couldn't send the reset email for that address.");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <div
        className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10"
        style={{ background: "linear-gradient(150deg, #0b1220 0%, #0e2233 55%, #0b3247 100%)" }}
      >
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-25 blur-3xl"
          style={{ background: "#38bdf8" }}
        />
        <div
          className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "#3b82f6" }}
        />
        <div className="relative flex items-center gap-3">
          <img src={logoUrl} alt="" className="h-10 w-10 object-contain" />
          <div>
            <div
              className="text-sm font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              LK Chemicals
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Admin Console 3.0
            </div>
          </div>
        </div>
        <div className="relative">
          <h1 className="max-w-md text-4xl leading-tight !text-white">
            Run the whole website from one console.
          </h1>
          <p className="mt-4 max-w-sm text-sm text-white/60">
            Catalog, services, media, enquiries and site settings — every change goes live on
            lkchemicals.in the moment you save.
          </p>
          <div className="mt-8 grid max-w-sm grid-cols-3 gap-3">
            {[
              { icon: Zap, label: "Instant publish" },
              { icon: ShieldCheck, label: "Audit trail" },
              { icon: Sparkles, label: "⌘K everywhere" },
            ].map((f) => (
              <div
                key={f.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center"
              >
                <f.icon className="mx-auto h-4 w-4 text-sky-300" />
                <div className="mt-1.5 text-[11px] font-medium text-white/70">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex items-center gap-2 text-[11px] text-white/40">
          <Droplets className="h-3.5 w-3.5" /> We provide the best water treatment solution.
        </div>
      </div>

      {/* Form panel */}
      <div className="grid place-items-center px-5 py-12">
        <form onSubmit={submit} className="w-full max-w-sm a-rise">
          <img src={logoUrl} alt="" className="h-11 w-11 object-contain lg:hidden" />
          <h2 className="mt-4 text-2xl">Welcome back</h2>
          <p className="mt-1 text-[13px]" style={{ color: "var(--a-text2)" }}>
            Sign in to manage the LK Chemicals website.
          </p>

          <label className="mt-8 block">
            <span className="text-xs font-semibold" style={{ color: "var(--a-text2)" }}>
              Email
            </span>
            <div className="relative mt-1.5">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                style={{ color: "var(--a-text3)" }}
              />
              <input
                className="a-input !pl-9"
                type="email"
                autoComplete="username"
                placeholder="you@lkchemicals.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-semibold" style={{ color: "var(--a-text2)" }}>
              Password
            </span>
            <div className="relative mt-1.5">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                style={{ color: "var(--a-text3)" }}
              />
              <input
                className="a-input !pl-9"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </label>

          {error && (
            <p className="mt-3 text-xs font-medium" style={{ color: "var(--a-danger)" }}>
              {error}
            </p>
          )}
          {notice && (
            <p className="mt-3 text-xs font-medium" style={{ color: "var(--a-ok)" }}>
              {notice}
            </p>
          )}

          <button type="submit" disabled={busy} className="a-btn a-btn-primary mt-6 w-full !py-3">
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign in <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={forgot}
            className="mt-4 w-full text-center text-xs underline-offset-2 hover:underline"
            style={{ color: "var(--a-text3)" }}
          >
            Forgot password?
          </button>
        </form>
      </div>
    </div>
  );
}
