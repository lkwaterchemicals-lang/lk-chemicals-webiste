// Admin dashboard — manage every piece of site content from /admin.
// Firebase Auth gates access; content lives in Firestore; media uploads go
// to Cloudinary. Collections left empty in Firestore fall back to the
// built-in content on the public site.
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Database,
  Image as ImageIcon,
  Inbox,
  LayoutGrid,
  LogOut,
  Package,
  Plus,
  Quote,
  Settings,
  Trash2,
  Upload,
  Wrench,
  X,
} from "lucide-react";
import { auth, db } from "@/integrations/firebase/client";
import { uploadToCloudinary } from "@/integrations/cloudinary";
import { categories as staticCategories, products as staticProducts } from "@/data/products";
import { staticServices, staticGallery, staticTestimonials, staticSettings } from "@/data/content";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — LK Chemicals" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

/* ---------------------------------------------------------------- schema */

type FieldType = "text" | "textarea" | "list" | "image" | "boolean" | "select";

type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[]; // for select
  required?: boolean;
  hint?: string;
};

type CollectionDef = {
  name: string; // Firestore collection
  label: string;
  singular: string;
  icon: React.ComponentType<{ className?: string }>;
  idField: string; // which field becomes the doc id
  titleField: string;
  fields: FieldDef[];
  seed: () => Record<string, unknown>[];
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Seeded docs must not store Vite's hashed asset URLs (they change every
// build). The same images live at stable paths under /public/content, so
// remap bundle URLs (dev "/src/assets/x.jpg" or build "/assets/x-Hash.jpg")
// to "/content/x.jpg" before writing to Firestore.
function stableAssetUrl(url: unknown): unknown {
  if (typeof url !== "string" || url.startsWith("http") || url.startsWith("/content/")) return url;
  const base = (url.split("?")[0].split("/").pop() ?? "");
  // Strip a trailing Vite build hash only — a hash is exactly 8 chars AND
  // contains a digit, so real word suffixes like "-membrane" are preserved.
  const m = base.match(/^(.+?)(?:-(?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]{8})?\.(jpe?g|png|webp)$/i);
  return m ? `/content/${m[1]}.${m[2].toLowerCase() === "jpeg" ? "jpg" : m[2].toLowerCase()}` : url;
}

function stabilizeAssets(item: Record<string, unknown>): Record<string, unknown> {
  const out = { ...item };
  for (const key of ["image", "img", "src"]) {
    if (key in out) out[key] = stableAssetUrl(out[key]);
  }
  return out;
}

const COLLECTIONS: CollectionDef[] = [
  {
    name: "categories",
    label: "Categories",
    singular: "category",
    icon: LayoutGrid,
    idField: "slug",
    titleField: "name",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug (URL id — leave blank to auto-generate)", type: "text" },
      { key: "number", label: "Number (01–99, controls order)", type: "text", required: true },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image", type: "image" },
    ],
    seed: () => staticCategories.map((c) => ({ ...c })),
  },
  {
    name: "products",
    label: "Products",
    singular: "product",
    icon: Package,
    idField: "slug",
    titleField: "name",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug (URL id — leave blank to auto-generate)", type: "text" },
      { key: "category", label: "Category", type: "select", options: [], required: true },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "features", label: "Features (one per line)", type: "list" },
      { key: "applications", label: "Applications (one per line)", type: "list" },
      { key: "packing", label: "Packing options (one per line)", type: "list" },
    ],
    seed: () => staticProducts.map((p) => ({ ...p })),
  },
  {
    name: "services",
    label: "Services",
    singular: "service",
    icon: Wrench,
    idField: "n",
    titleField: "t",
    fields: [
      { key: "n", label: "Number (01–99, controls order)", type: "text", required: true },
      { key: "t", label: "Title", type: "text", required: true },
      { key: "body", label: "Description", type: "textarea" },
      { key: "img", label: "Image", type: "image" },
      { key: "inc", label: "What's included (one per line)", type: "list" },
    ],
    seed: () => staticServices.map((s) => ({ ...s })),
  },
  {
    name: "gallery",
    label: "Gallery",
    singular: "gallery item",
    icon: ImageIcon,
    idField: "",
    titleField: "alt",
    fields: [
      { key: "src", label: "Image", type: "image", required: true },
      { key: "alt", label: "Caption / alt text", type: "text", required: true },
      { key: "cat", label: "Category", type: "select", options: ["Factory", "Laboratory", "Products", "Services", "Team"], required: true },
      { key: "wide", label: "Wide tile (2 columns)", type: "boolean" },
      { key: "tall", label: "Tall tile (2 rows)", type: "boolean" },
    ],
    seed: () => staticGallery.map((g) => ({ ...g })),
  },
  {
    name: "testimonials",
    label: "Testimonials",
    singular: "testimonial",
    icon: Quote,
    idField: "",
    titleField: "who",
    fields: [
      { key: "q", label: "Quote", type: "textarea", required: true },
      { key: "who", label: "Attribution", type: "text", required: true },
    ],
    seed: () => staticTestimonials.map((t) => ({ ...t })),
  },
];

const SETTINGS_FIELDS: FieldDef[] = [
  { key: "phone", label: "Phone (display format)", type: "text" },
  { key: "whatsapp", label: "WhatsApp number (digits with country code)", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "address", label: "Address", type: "textarea" },
  { key: "contactPerson", label: "Contact person", type: "text" },
  { key: "contactRole", label: "Contact person role", type: "text" },
  { key: "hours", label: "Business hours", type: "text" },
  { key: "mapQuery", label: "Google Maps search query", type: "text" },
];

/* ------------------------------------------------------------------ page */

function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setAuthReady(true); }), []);

  if (!authReady) {
    return <div className="min-h-screen bg-ink-2 grid place-items-center text-white/60">Loading…</div>;
  }
  return user ? <Dashboard user={user} /> : <Login />;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setError("Sign-in failed — check the email and password.");
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-cyan-hi transition-colors";

  return (
    <div className="min-h-screen bg-ink-2 grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm glass-dark rounded-3xl p-8">
        <div className="micro-label">LK Chemicals</div>
        <h1 className="font-display text-3xl text-white mt-2">Admin sign-in</h1>
        <div className="mt-6 space-y-3">
          <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          <input className={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button
          disabled={busy}
          className="mt-6 w-full rounded-xl bg-cyan-hi text-ink font-medium py-3 hover:brightness-110 transition disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------- dashboard */

type Tab = { id: string; label: string; icon: React.ComponentType<{ className?: string }> };

const TABS: Tab[] = [
  ...COLLECTIONS.map((c) => ({ id: c.name, label: c.label, icon: c.icon })),
  { id: "enquiries", label: "Enquiries", icon: Inbox },
  { id: "settings", label: "Site settings", icon: Settings },
];

function Dashboard({ user }: { user: User }) {
  const [tab, setTab] = useState<string>("categories");

  return (
    <div className="min-h-screen bg-ink-2 text-white flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 p-5 lg:min-h-screen">
        <div className="micro-label">LK Chemicals</div>
        <div className="font-display text-2xl mt-1">Admin</div>
        <nav className="mt-6 flex lg:flex-col gap-1 overflow-x-auto [scrollbar-width:none]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm whitespace-nowrap transition-colors " +
                (tab === t.id ? "bg-cyan-hi/15 text-cyan-hi" : "text-white/60 hover:text-white hover:bg-white/5")
              }
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-8 border-t border-white/10 pt-4">
          <div className="text-xs text-white/40 truncate">{user.email}</div>
          <button
            onClick={() => signOut(auth)}
            className="mt-2 flex items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-5 md:p-8 overflow-x-hidden">
        {tab === "enquiries" ? (
          <EnquiriesPanel />
        ) : tab === "settings" ? (
          <SettingsPanel />
        ) : (
          <CollectionPanel key={tab} def={COLLECTIONS.find((c) => c.name === tab)!} />
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------- shared elements */

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-cyan-hi transition-colors";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-cyan-hi text-ink text-sm font-medium px-4 py-2.5 hover:brightness-110 transition disabled:opacity-50";
const btnGhost =
  "inline-flex items-center gap-2 rounded-xl border border-white/15 text-sm text-white/70 px-4 py-2.5 hover:text-white hover:border-white/40 transition disabled:opacity-50";

function useAdminCollection(name: string, order?: string) {
  return useQuery({
    queryKey: ["admin", name],
    queryFn: async () => {
      const ref = collection(db, name);
      const snap = await getDocs(order ? query(ref, orderBy(order)) : ref);
      return snap.docs.map((d) => ({ __id: d.id, ...d.data() }) as Record<string, unknown> & { __id: string });
    },
    retry: 1, // fail fast so setup problems surface as a banner, not an endless spinner
  });
}

function ImageField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      const res = await uploadToCloudinary(file, setProgress);
      onChange(res.secure_url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="flex items-start gap-3">
      {value ? (
        <img src={value} alt="" className="h-20 w-28 rounded-lg object-cover border border-white/10" />
      ) : (
        <div className="h-20 w-28 rounded-lg border border-dashed border-white/20 grid place-items-center text-white/30">
          <ImageIcon className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1 space-y-2">
        <label className={btnGhost + " cursor-pointer"}>
          <Upload className="h-4 w-4" />
          {progress !== null ? `Uploading ${progress}%` : "Upload to Cloudinary"}
          <input
            type="file"
            accept="image/*,video/*,application/pdf"
            className="hidden"
            disabled={progress !== null}
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </label>
        <input
          className={inputCls}
          placeholder="…or paste a URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------ collection panel */

function FirestoreError({ error }: { error: unknown }) {
  const msg = error instanceof Error ? error.message : String(error);
  const notEnabled = /has not been used|is disabled|PERMISSION_DENIED/i.test(msg);
  return (
    <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/5 p-5 text-sm">
      <p className="font-medium text-red-400">Firestore isn't reachable.</p>
      {notEnabled ? (
        <p className="mt-2 text-white/70">
          Enable it once in the Firebase console: open{" "}
          <a
            className="text-cyan-hi underline"
            href="https://console.firebase.google.com/project/lk-chemicals/firestore"
            target="_blank"
            rel="noreferrer"
          >
            Firestore Database
          </a>{" "}
          → <b>Create database</b> (production mode is fine), then set the rules to allow public reads and
          authenticated writes, and reload this page. The public site keeps using the built-in content until then.
        </p>
      ) : (
        <p className="mt-2 text-white/60 break-all">{msg}</p>
      )}
    </div>
  );
}

function CollectionPanel({ def }: { def: CollectionDef }) {
  const qc = useQueryClient();
  const { data: rows = [], isLoading, error } = useAdminCollection(def.name, def.idField || undefined);
  const { data: cats = [] } = useAdminCollection("categories", "number");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Product category options come from Firestore categories (or static fallback).
  const fields = useMemo(() => {
    return def.fields.map((f) => {
      if (def.name === "products" && f.key === "category") {
        const opts = (cats.length ? cats : staticCategories).map((c) => String((c as Record<string, unknown>).slug));
        return { ...f, options: opts };
      }
      return f;
    });
  }, [def, cats]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", def.name] });
    qc.invalidateQueries({ queryKey: ["content"] });
  };

  const save = async (values: Record<string, unknown>, existingId?: string) => {
    let id = existingId;
    if (!id) {
      const fromIdField = def.idField ? String(values[def.idField] ?? "") : "";
      id = fromIdField || slugify(String(values[def.titleField] ?? "")) || crypto.randomUUID();
    }
    if (def.idField === "slug" && !values.slug) values.slug = id;
    await setDoc(doc(db, def.name, id), values, { merge: true });
    invalidate();
    setEditing(null);
    setNotice("Saved.");
    setTimeout(() => setNotice(null), 2500);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    await deleteDoc(doc(db, def.name, id));
    invalidate();
  };

  const seedAll = async () => {
    if (!confirm(`Copy all built-in ${def.label.toLowerCase()} into Firestore so you can edit them here?`)) return;
    setSeeding(true);
    try {
      for (const raw of def.seed()) {
        const item = stabilizeAssets(raw);
        const id = def.idField
          ? String(item[def.idField])
          : slugify(String(item[def.titleField] ?? "")) || crypto.randomUUID();
        await setDoc(doc(db, def.name, id), item, { merge: true });
      }
      invalidate();
      setNotice("Seeded from built-in data.");
      setTimeout(() => setNotice(null), 2500);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl">{def.label}</h2>
        <div className="flex gap-2">
          {rows.length === 0 && (
            <button className={btnGhost} onClick={seedAll} disabled={seeding}>
              <Database className="h-4 w-4" /> {seeding ? "Seeding…" : "Seed from built-in data"}
            </button>
          )}
          <button className={btnPrimary} onClick={() => setEditing({})}>
            <Plus className="h-4 w-4" /> Add {def.singular}
          </button>
        </div>
      </div>

      {error != null && <FirestoreError error={error} />}
      {rows.length === 0 && !isLoading && error == null && (
        <p className="mt-3 text-sm text-white/50">
          Nothing in Firestore yet — the public site is showing the built-in {def.label.toLowerCase()}.
          Seed them here to start editing, or add new items.
        </p>
      )}
      {notice && <p className="mt-3 text-sm text-leaf">{notice}</p>}

      <div className="mt-6 grid gap-3">
        {isLoading && <p className="text-white/50 text-sm">Loading…</p>}
        {rows.map((row) => (
          <div key={row.__id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            {typeof row.image === "string" && row.image && (
              <img src={String(row.image)} alt="" className="h-12 w-16 rounded-lg object-cover" />
            )}
            {typeof row.img === "string" && row.img && (
              <img src={String(row.img)} alt="" className="h-12 w-16 rounded-lg object-cover" />
            )}
            {typeof row.src === "string" && row.src && (
              <img src={String(row.src)} alt="" className="h-12 w-16 rounded-lg object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{String(row[def.titleField] ?? row.__id)}</div>
              <div className="text-xs text-white/40 truncate">{row.__id}</div>
            </div>
            <button className={btnGhost} onClick={() => setEditing(row)}>Edit</button>
            <button
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/40 transition"
              onClick={() => remove(row.__id)}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <EditorModal
          title={(editing.__id ? "Edit " : "New ") + def.singular}
          fields={fields}
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={(values) => save(values, editing.__id as string | undefined)}
        />
      )}
    </div>
  );
}

/* --------------------------------------------------------- editor modal */

function EditorModal({
  title,
  fields,
  initial,
  onSave,
  onCancel,
}: {
  title: string;
  fields: FieldDef[];
  initial: Record<string, unknown>;
  onSave: (values: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const v: Record<string, unknown> = {};
    for (const f of fields) v[f.key] = initial[f.key] ?? (f.type === "boolean" ? false : f.type === "list" ? [] : "");
    return v;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: string, val: unknown) => setValues((v) => ({ ...v, [key]: val }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && !String(values[f.key] ?? "").trim()) {
        setError(`${f.label} is required.`);
        return;
      }
    }
    setBusy(true);
    setError(null);
    try {
      await onSave(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={onCancel}>
      <div className="min-h-full grid place-items-center p-4">
        <form
          onSubmit={submit}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl rounded-3xl bg-ink border border-white/10 p-6 md:p-8"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl capitalize">{title}</h3>
            <button type="button" onClick={onCancel} className="text-white/40 hover:text-white" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-6 space-y-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs uppercase tracking-wider text-white/50">{f.label}</label>
                <div className="mt-1.5">
                  {f.type === "text" && (
                    <input className={inputCls} value={String(values[f.key] ?? "")} onChange={(e) => set(f.key, e.target.value)} />
                  )}
                  {f.type === "textarea" && (
                    <textarea className={inputCls + " min-h-24"} value={String(values[f.key] ?? "")} onChange={(e) => set(f.key, e.target.value)} />
                  )}
                  {f.type === "list" && (
                    <textarea
                      className={inputCls + " min-h-24 font-mono text-xs"}
                      value={Array.isArray(values[f.key]) ? (values[f.key] as string[]).join("\n") : String(values[f.key] ?? "")}
                      onChange={(e) => set(f.key, e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
                      placeholder="One entry per line"
                    />
                  )}
                  {f.type === "image" && (
                    <ImageField value={String(values[f.key] ?? "")} onChange={(url) => set(f.key, url)} />
                  )}
                  {f.type === "boolean" && (
                    <label className="flex items-center gap-2 text-sm text-white/70">
                      <input
                        type="checkbox"
                        checked={Boolean(values[f.key])}
                        onChange={(e) => set(f.key, e.target.checked)}
                        className="h-4 w-4 accent-[var(--cyan-hi)]"
                      />
                      Enabled
                    </label>
                  )}
                  {f.type === "select" && (
                    <select
                      className={inputCls + " bg-ink"}
                      value={String(values[f.key] ?? "")}
                      onChange={(e) => set(f.key, e.target.value)}
                    >
                      <option value="">— choose —</option>
                      {(f.options ?? []).map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className={btnGhost} onClick={onCancel}>Cancel</button>
            <button type="submit" className={btnPrimary} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- settings */

function SettingsPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "settings"));
      const site = snap.docs.find((d) => d.id === "site");
      return { ...staticSettings, ...(site?.data() ?? {}) } as Record<string, unknown>;
    },
  });
  const [values, setValues] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (data && !values) setValues(data);
  }, [data, values]);

  const save = async () => {
    if (!values) return;
    setBusy(true);
    try {
      const clean: Record<string, unknown> = {};
      for (const f of SETTINGS_FIELDS) clean[f.key] = values[f.key] ?? "";
      await setDoc(doc(db, "settings", "site"), clean, { merge: true });
      qc.invalidateQueries({ queryKey: ["content", "settings"] });
      setNotice("Saved — the public site updates immediately.");
      setTimeout(() => setNotice(null), 3000);
    } finally {
      setBusy(false);
    }
  };

  if (isLoading || !values) return <p className="text-white/50 text-sm">Loading…</p>;

  return (
    <div className="max-w-xl">
      <h2 className="font-display text-3xl">Site settings</h2>
      <p className="mt-2 text-sm text-white/50">
        Contact details shown in the footer, contact page, call buttons and WhatsApp links.
      </p>
      <div className="mt-6 space-y-4">
        {SETTINGS_FIELDS.map((f) => (
          <div key={f.key}>
            <label className="text-xs uppercase tracking-wider text-white/50">{f.label}</label>
            <div className="mt-1.5">
              {f.type === "textarea" ? (
                <textarea
                  className={inputCls + " min-h-20"}
                  value={String(values[f.key] ?? "")}
                  onChange={(e) => setValues((v) => ({ ...v!, [f.key]: e.target.value }))}
                />
              ) : (
                <input
                  className={inputCls}
                  value={String(values[f.key] ?? "")}
                  onChange={(e) => setValues((v) => ({ ...v!, [f.key]: e.target.value }))}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      {notice && <p className="mt-4 text-sm text-leaf">{notice}</p>}
      <button className={btnPrimary + " mt-6"} onClick={save} disabled={busy}>
        {busy ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------- enquiries */

type Enquiry = {
  __id: string;
  name?: string;
  company?: string | null;
  phone?: string;
  email?: string | null;
  requirement?: string;
  product_ref?: string | null;
  source?: string;
  createdAt?: { toDate?: () => Date } | null;
};

function EnquiriesPanel() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ["admin", "enquiries"],
    queryFn: async () => {
      const snap = await getDocs(query(collection(db, "enquiries"), orderBy("createdAt", "desc")));
      return snap.docs.map((d) => ({ __id: d.id, ...d.data() }) as Enquiry);
    },
    retry: 1,
  });

  const remove = async (id: string) => {
    if (!confirm("Delete this enquiry?")) return;
    await deleteDoc(doc(db, "enquiries", id));
    qc.invalidateQueries({ queryKey: ["admin", "enquiries"] });
  };

  return (
    <div>
      <h2 className="font-display text-3xl">Enquiries</h2>
      <p className="mt-2 text-sm text-white/50">Submissions from every enquiry form on the site, newest first.</p>
      {error != null && <FirestoreError error={error} />}
      <div className="mt-6 grid gap-3">
        {isLoading && <p className="text-white/50 text-sm">Loading…</p>}
        {!isLoading && rows.length === 0 && error == null && <p className="text-white/50 text-sm">No enquiries yet.</p>}
        {rows.map((e) => (
          <div key={e.__id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-medium">
                {e.name} {e.company ? <span className="text-white/40">· {e.company}</span> : null}
              </div>
              <div className="text-xs text-white/40">
                {e.createdAt?.toDate ? e.createdAt.toDate().toLocaleString() : ""}
              </div>
            </div>
            <div className="mt-1 text-sm text-cyan-hi">
              {e.phone} {e.email ? `· ${e.email}` : ""}
            </div>
            <p className="mt-3 text-sm text-white/70 whitespace-pre-wrap">{e.requirement}</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-white/30">
                {e.source} {e.product_ref ? `· ${e.product_ref}` : ""}
              </div>
              <button className="text-xs text-white/40 hover:text-red-400" onClick={() => remove(e.__id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
