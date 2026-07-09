// Site settings — grouped form with dirty tracking; saves straight to the
// public site's footer, contact page, call buttons and WhatsApp links.
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Clock, DatabaseBackup, Mail, MapPin, Phone, RotateCcw, Save, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { db } from "@/integrations/firebase/client";
import { staticSettings } from "@/data/content";
import { logActivity, useInvalidate } from "@/admin/api";
import { Btn, Card, Field, PageHeader, SkeletonRows } from "@/admin/ui";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — LK Admin" }] }),
  component: SettingsAdmin,
});

type FieldSpec = { key: string; label: string; textarea?: boolean; hint?: string };
type Group = { title: string; icon: LucideIcon; fields: FieldSpec[] };

const GROUPS: Group[] = [
  {
    title: "Phone & WhatsApp",
    icon: Phone,
    fields: [
      { key: "phone", label: "Primary phone", hint: "Display format" },
      { key: "phone2", label: "Phone 2 (optional)" },
      { key: "phone3", label: "Phone 3 (optional)" },
      { key: "whatsapp", label: "WhatsApp number", hint: "Digits with country code" },
    ],
  },
  {
    title: "Email",
    icon: Mail,
    fields: [
      { key: "email", label: "Primary email" },
      { key: "email2", label: "Email 2 (optional)" },
    ],
  },
  {
    title: "Addresses",
    icon: MapPin,
    fields: [
      { key: "address", label: "Registered office", textarea: true },
      { key: "address2", label: "Unit / works (optional)", textarea: true },
      { key: "mapQuery", label: "Google Maps search query", hint: "Drives the contact-page map" },
    ],
  },
  {
    title: "People & hours",
    icon: User,
    fields: [
      { key: "contactPerson", label: "Contact person" },
      { key: "contactRole", label: "Contact person role" },
      { key: "hours", label: "Business hours" },
    ],
  },
];

const ALL_KEYS = GROUPS.flatMap((g) => g.fields.map((f) => f.key));

/* ---------------------------------------------------------------- backup */

// Every collection the site stores. Exported as one JSON file so the client
// always has an offline copy of their content, catalog and leads.
const BACKUP_COLLECTIONS = [
  "products",
  "categories",
  "serviceCategories",
  "services",
  "gallery",
  "testimonials",
  "careers",
  "pages",
  "settings",
  "enquiries",
  "activity",
];

function BackupCard() {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const dump: Record<string, unknown[]> = {};
      for (const name of BACKUP_COLLECTIONS) {
        const snap = await getDocs(collection(db, name));
        dump[name] = snap.docs.map((d) => ({ __id: d.id, ...d.data() }));
      }
      const payload = {
        exportedAt: new Date().toISOString(),
        site: "lk-chemicals",
        collections: dump,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `lk-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      void logActivity("updated", "settings", "Downloaded full site backup");
      toast.success("Backup downloaded — keep it somewhere safe");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Backup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      className="a-rise"
      title={
        <span className="flex items-center gap-2">
          <DatabaseBackup className="h-3.5 w-3.5" style={{ color: "var(--a-accent)" }} /> Backup
        </span>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-md text-[13px]" style={{ color: "var(--a-text2)" }}>
          Downloads every collection — catalog, pages, media, testimonials, careers, enquiries and
          settings — as a single JSON file. Do this after big edits; it's your offline safety copy.
        </p>
        <Btn variant="primary" icon={DatabaseBackup} busy={busy} onClick={download}>
          Download backup
        </Btn>
      </div>
    </Card>
  );
}

function SettingsAdmin() {
  const invalidate = useInvalidate();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "settings"));
      const site = snap.docs.find((d) => d.id === "site");
      return { ...staticSettings, ...(site?.data() ?? {}) } as Record<string, unknown>;
    },
    retry: 1,
  });

  const [values, setValues] = useState<Record<string, string> | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data && !values) {
      const v: Record<string, string> = {};
      for (const k of ALL_KEYS) v[k] = String(data[k] ?? "");
      setValues(v);
    }
  }, [data, values]);

  const baseline = useMemo(() => {
    if (!data) return null;
    const v: Record<string, string> = {};
    for (const k of ALL_KEYS) v[k] = String(data[k] ?? "");
    return v;
  }, [data]);

  const dirty = values && baseline && JSON.stringify(values) !== JSON.stringify(baseline);

  const save = async () => {
    if (!values) return;
    setBusy(true);
    try {
      await setDoc(doc(db, "settings", "site"), values, { merge: true });
      void logActivity("updated", "settings", "Site settings");
      invalidate("settings");
      toast.success("Saved — the public site updates immediately");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <PageHeader
        title="Site settings"
        sub="Contact details shown in the footer, contact page, call buttons and WhatsApp links."
        actions={
          <>
            {dirty && (
              <Btn icon={RotateCcw} onClick={() => baseline && setValues({ ...baseline })}>
                Reset
              </Btn>
            )}
            <Btn variant="primary" icon={Save} busy={busy} disabled={!dirty} onClick={save}>
              {dirty ? "Save changes" : "Saved"}
            </Btn>
          </>
        }
      />

      {isLoading || !values ? (
        <div className="a-card">
          <SkeletonRows n={6} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {GROUPS.map((g, gi) => (
            <Card
              key={g.title}
              className={`a-rise ${g.title === "Addresses" ? "md:col-span-2" : ""}`}
              title={
                <span className="flex items-center gap-2">
                  <g.icon className="h-3.5 w-3.5" style={{ color: "var(--a-accent)" }} /> {g.title}
                </span>
              }
            >
              <div
                className={`grid gap-4 ${g.title === "Addresses" ? "md:grid-cols-2" : ""}`}
                style={{ animationDelay: `${gi * 50}ms` }}
              >
                {g.fields.map((f) => (
                  <div key={f.key} className={f.key === "mapQuery" ? "md:col-span-2" : ""}>
                    <Field label={f.label} hint={f.hint}>
                      {f.textarea ? (
                        <textarea
                          className="a-textarea !min-h-20"
                          value={values[f.key]}
                          onChange={(e) => setValues((v) => ({ ...v!, [f.key]: e.target.value }))}
                        />
                      ) : (
                        <input
                          className="a-input"
                          value={values[f.key]}
                          onChange={(e) => setValues((v) => ({ ...v!, [f.key]: e.target.value }))}
                        />
                      )}
                    </Field>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <BackupCard />

      <p className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--a-text3)" }}>
        <Clock className="h-3 w-3" /> Changes publish the moment you save — no deploy needed.
      </p>

      {/* Sticky save bar when dirty (mobile reassurance) */}
      {dirty && (
        <div
          className="a-pop sticky bottom-3 z-10 flex items-center justify-between gap-3 rounded-xl px-4 py-3 md:hidden"
          style={{
            background: "var(--a-surface2)",
            border: "1px solid var(--a-border2)",
            boxShadow: "var(--a-shadow-lg)",
          }}
        >
          <span className="text-xs font-semibold" style={{ color: "var(--a-warn)" }}>
            Unsaved changes
          </span>
          <Btn size="sm" variant="primary" busy={busy} onClick={save}>
            Save
          </Btn>
        </div>
      )}
    </div>
  );
}
