// Schema-driven editor for a single public page (a `pages/<id>` document).
// Renders grouped forms from content-schema.tsx, supports repeatable groups and
// image lists, tracks dirty state and saves straight to Firestore — the public
// site updates the moment you save.
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore/lite";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Clock, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { db } from "@/integrations/firebase/client";
import { logActivity, useInvalidate } from "./api";
import { ImageField } from "./editor";
import { Btn, Card, Field, PageHeader, SelectWrap, SkeletonRows } from "./ui";
import type { ContentField, PageSchema } from "./content-schema";

/* -------------------------------------------------------- value helpers */

function fieldDefault(f: ContentField): unknown {
  switch (f.type) {
    case "boolean":
      return false;
    case "list":
    case "imagelist":
    case "group":
      return [];
    default:
      return "";
  }
}

/** Pull only the schema-defined keys out of a source doc, with safe defaults. */
function collectValues(
  schema: PageSchema,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const sec of schema.sections) {
    for (const f of sec.fields) {
      out[f.key] = source[f.key] ?? fieldDefault(f);
    }
  }
  return out;
}

/* --------------------------------------------------------- leaf inputs */

/** A single non-repeating input (text / textarea / image / select / boolean). */
function LeafInput({
  field,
  value,
  onChange,
}: {
  field: ContentField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          className="a-textarea"
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "image":
      return <ImageField value={String(value ?? "")} onChange={onChange} />;
    case "select":
      return (
        <SelectWrap>
          <select
            className="a-select"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">— choose —</option>
            {(field.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </SelectWrap>
      );
    case "boolean":
      return (
        <label
          className="flex items-center gap-2 text-[13px] cursor-pointer"
          style={{ color: "var(--a-text2)" }}
        >
          <input
            type="checkbox"
            className="a-check"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          Enabled
        </label>
      );
    default:
      return (
        <input
          className="a-input"
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

/* --------------------------------------------------------- image list */

function ImageListField({ value, onChange }: { value: unknown; onChange: (v: string[]) => void }) {
  const items = Array.isArray(value) ? (value as string[]) : [];
  const setAt = (i: number, url: string) => onChange(items.map((v, j) => (j === i ? url : v)));
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const add = () => onChange([...items, ""]);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((url, i) => (
          <div key={i} className="space-y-1.5">
            <ImageField value={url} onChange={(u) => setAt(i, u)} />
            <button
              type="button"
              className="a-btn a-btn-bare a-btn-sm w-full"
              onClick={() => remove(i)}
              style={{ color: "var(--a-danger)" }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        ))}
      </div>
      <Btn size="sm" icon={Plus} onClick={add}>
        Add image
      </Btn>
    </div>
  );
}

/* --------------------------------------------------------- group field */

function GroupField({
  field,
  value,
  onChange,
}: {
  field: ContentField;
  value: unknown;
  onChange: (v: Record<string, unknown>[]) => void;
}) {
  const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
  const sub = field.itemFields ?? [];

  const blank = () => {
    const o: Record<string, unknown> = {};
    for (const f of sub) o[f.key] = fieldDefault(f);
    return o;
  };
  const update = (i: number, next: Record<string, unknown>) =>
    onChange(items.map((it, j) => (j === i ? next : it)));
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const copy = [...items];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const title = field.itemTitleKey ? String(item[field.itemTitleKey] ?? "") : "";
        return (
          <div
            key={i}
            className="rounded-xl p-3.5"
            style={{ border: "1px solid var(--a-border)", background: "var(--a-surface2)" }}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold truncate" style={{ color: "var(--a-text2)" }}>
                {field.itemNoun
                  ? field.itemNoun[0].toUpperCase() + field.itemNoun.slice(1)
                  : "Item"}{" "}
                {i + 1}
                {title && <span style={{ color: "var(--a-text3)" }}> · {title}</span>}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  className="a-btn a-btn-bare a-btn-sm a-iconbtn"
                  aria-label="Move up"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="a-btn a-btn-bare a-btn-sm a-iconbtn"
                  aria-label="Move down"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="a-btn a-btn-bare a-btn-sm a-iconbtn"
                  aria-label="Remove"
                  onClick={() => remove(i)}
                  style={{ color: "var(--a-danger)" }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {sub.map((sf) => (
                <div
                  key={sf.key}
                  className={sf.type === "textarea" || sf.type === "image" ? "sm:col-span-2" : ""}
                >
                  <Field label={sf.label} hint={sf.hint}>
                    <LeafInput
                      field={sf}
                      value={item[sf.key]}
                      onChange={(v) => update(i, { ...item, [sf.key]: v })}
                    />
                  </Field>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <Btn size="sm" icon={Plus} onClick={() => onChange([...items, blank()])}>
        Add {field.itemNoun ?? "item"}
      </Btn>
    </div>
  );
}

/* ------------------------------------------------------ field dispatch */

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: ContentField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "group")
    return (
      <GroupField
        field={field}
        value={value}
        onChange={onChange as (v: Record<string, unknown>[]) => void}
      />
    );
  if (field.type === "imagelist")
    return <ImageListField value={value} onChange={onChange as (v: string[]) => void} />;
  if (field.type === "list") {
    const arr = Array.isArray(value) ? (value as string[]) : [];
    return (
      <textarea
        className="a-textarea font-mono !text-xs"
        placeholder="One entry per line"
        value={arr.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        onBlur={(e) =>
          onChange(
            e.target.value
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
      />
    );
  }
  return <LeafInput field={field} value={value} onChange={onChange} />;
}

/* ----------------------------------------------------------- the page */

export function PageContentEditor({ schema }: { schema: PageSchema }) {
  const invalidate = useInvalidate();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "pages", schema.id],
    queryFn: async () => {
      const snap = await getDoc(doc(db, "pages", schema.id));
      return collectValues(schema, { ...schema.fallback, ...(snap.exists() ? snap.data() : {}) });
    },
    retry: 1,
  });

  const [values, setValues] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data && !values) setValues(structuredClone(data));
  }, [data, values]);

  const baseline = useMemo(() => (data ? structuredClone(data) : null), [data]);
  const dirty = values && baseline && JSON.stringify(values) !== JSON.stringify(baseline);

  const setField = (key: string, v: unknown) => setValues((prev) => ({ ...prev!, [key]: v }));

  const save = async () => {
    if (!values) return;
    setBusy(true);
    try {
      await setDoc(
        doc(db, "pages", schema.id),
        { ...values, _updatedAt: serverTimestamp() },
        { merge: true },
      );
      void logActivity("updated", "pages", `${schema.label} page`);
      invalidate("pages");
      toast.success("Saved — the public page updates immediately");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <PageHeader
        title={schema.label}
        sub={schema.description}
        actions={
          <>
            {dirty && (
              <Btn
                icon={RotateCcw}
                onClick={() => baseline && setValues(structuredClone(baseline))}
              >
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
        <div className="space-y-4">
          {schema.sections.map((sec, si) => (
            <Card key={sec.title} className="a-rise" title={sec.title}>
              <div className="grid gap-4 sm:grid-cols-2" style={{ animationDelay: `${si * 40}ms` }}>
                {sec.fields.map((f) => (
                  <div
                    key={f.key}
                    className={
                      f.full ||
                      f.type === "group" ||
                      f.type === "imagelist" ||
                      f.type === "list" ||
                      f.type === "textarea" ||
                      f.type === "image"
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    <Field label={f.label} hint={f.hint}>
                      <FieldRenderer
                        field={f}
                        value={values[f.key]}
                        onChange={(v) => setField(f.key, v)}
                      />
                    </Field>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--a-text3)" }}>
        <Clock className="h-3 w-3" /> Changes publish the moment you save — no deploy needed.
      </p>

      {dirty && (
        <div
          className="a-pop sticky bottom-3 z-10 flex items-center justify-between gap-3 rounded-xl px-4 py-3"
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
