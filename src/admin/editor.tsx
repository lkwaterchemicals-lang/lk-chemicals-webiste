// Record editor — a right-hand drawer with validation, dirty-state guard,
// auto-slugs and rich field types (image / gallery / documents / spec groups /
// related-record multi-select), all uploading straight to Cloudinary.
import { useMemo, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { slugify, type FieldDef, type ModuleDef } from "./registry";
import { Btn, Confirm, Drawer, Field, SelectWrap } from "./ui";
import { ImageField, GroupInput, GalleryInput, DocumentsInput, MultiRefInput } from "./fields";

// Re-exported so existing importers (page-editor.tsx) keep working.
export { ImageField } from "./fields";

// Field types whose value is an array (default to [] on a new record).
const ARRAY_TYPES = new Set<FieldDef["type"]>([
  "list",
  "gallery",
  "documents",
  "group",
  "multiref",
]);

/* ---------------------------------------------------------- editor drawer */

export function EditorDrawer({
  def,
  fields,
  initial,
  onSave,
  onClose,
}: {
  def: ModuleDef;
  fields: FieldDef[];
  initial: Record<string, unknown> | null; // null = closed; {} = new
  onSave: (values: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}) {
  const isNew = !initial?.__id;
  const open = initial !== null;

  const start = useMemo(() => {
    const v: Record<string, unknown> = {};
    for (const f of fields)
      v[f.key] =
        initial?.[f.key] ?? (f.type === "boolean" ? false : ARRAY_TYPES.has(f.type) ? [] : "");
    if (initial?.__id) v.__id = initial.__id;
    return v;
  }, [initial, fields]);

  const [values, setValues] = useState<Record<string, unknown>>(start);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  // Re-sync when a different record opens.
  const [seenStart, setSeenStart] = useState(start);
  if (start !== seenStart) {
    setSeenStart(start);
    setValues(start);
    setErrors({});
    setSlugTouched(false);
  }

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(start), [values, start]);

  const set = (f: FieldDef, val: unknown) => {
    setValues((v) => {
      const next = { ...v, [f.key]: val };
      // Auto-slug while the slug hasn't been hand-edited on a new record.
      if (isNew && !slugTouched) {
        const slugField = fields.find((x) => x.slugOf === f.key);
        if (slugField) next[slugField.key] = slugify(String(val ?? ""));
      }
      return next;
    });
    if (errors[f.key]) setErrors((e) => ({ ...e, [f.key]: "" }));
  };

  const tryClose = () => {
    if (dirty && !busy) setConfirmClose(true);
    else onClose();
  };

  const submit = async () => {
    const errs: Record<string, string> = {};
    for (const f of fields) {
      if (f.required && !String(values[f.key] ?? "").trim())
        errs[f.key] = `${f.label} is required.`;
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await onSave(values);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={tryClose}
        title={isNew ? `New ${def.singular}` : `Edit ${def.singular}`}
        sub={isNew ? undefined : String(initial?.__id ?? "")}
        footer={
          <>
            {dirty && (
              <span className="mr-auto text-[11px] font-medium" style={{ color: "var(--a-warn)" }}>
                Unsaved changes
              </span>
            )}
            <Btn onClick={tryClose}>Cancel</Btn>
            <Btn variant="primary" busy={busy} onClick={submit}>
              {isNew ? `Create ${def.singular}` : "Save changes"}
            </Btn>
          </>
        }
      >
        <div
          className="space-y-4"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
          }}
        >
          {fields.map((f) => (
            <Field
              key={f.key}
              label={f.label}
              hint={f.hint}
              required={f.required}
              error={errors[f.key] || null}
            >
              {f.type === "text" && (
                <input
                  className="a-input"
                  value={String(values[f.key] ?? "")}
                  placeholder={f.placeholder}
                  onChange={(e) => {
                    // Editing the slug field by hand stops auto-generation.
                    if (f.slugOf) setSlugTouched(true);
                    set(f, e.target.value);
                  }}
                />
              )}
              {f.type === "textarea" && (
                <textarea
                  className="a-textarea"
                  value={String(values[f.key] ?? "")}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f, e.target.value)}
                />
              )}
              {f.type === "list" && (
                <textarea
                  className="a-textarea font-mono !text-xs"
                  placeholder="One entry per line"
                  value={
                    Array.isArray(values[f.key])
                      ? (values[f.key] as string[]).join("\n")
                      : String(values[f.key] ?? "")
                  }
                  onChange={(e) => set(f, e.target.value.split("\n"))}
                  onBlur={(e) =>
                    set(
                      f,
                      e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                />
              )}
              {f.type === "image" && (
                <ImageField value={String(values[f.key] ?? "")} onChange={(url) => set(f, url)} />
              )}
              {f.type === "boolean" && (
                <label
                  className="flex items-center gap-2 text-[13px] cursor-pointer"
                  style={{ color: "var(--a-text2)" }}
                >
                  <input
                    type="checkbox"
                    className="a-check"
                    checked={Boolean(values[f.key])}
                    onChange={(e) => set(f, e.target.checked)}
                  />
                  Enabled
                </label>
              )}
              {f.type === "select" && (
                <SelectWrap>
                  <select
                    className="a-select"
                    value={String(values[f.key] ?? "")}
                    onChange={(e) => set(f, e.target.value)}
                  >
                    <option value="">— choose —</option>
                    {(f.optionItems ?? (f.options ?? []).map((o) => ({ value: o, label: o }))).map(
                      (o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ),
                    )}
                  </select>
                </SelectWrap>
              )}
              {f.type === "group" && (
                <GroupInput field={f} value={values[f.key]} onChange={(v) => set(f, v)} />
              )}
              {f.type === "gallery" && (
                <GalleryInput value={values[f.key]} onChange={(v) => set(f, v)} />
              )}
              {f.type === "documents" && (
                <DocumentsInput value={values[f.key]} onChange={(v) => set(f, v)} />
              )}
              {f.type === "multiref" && (
                <MultiRefInput field={f} value={values[f.key]} onChange={(v) => set(f, v)} />
              )}
            </Field>
          ))}
          <p
            className="text-[11px] pt-1 flex items-center gap-1.5"
            style={{ color: "var(--a-text3)" }}
          >
            <ImageIcon className="h-3 w-3" /> Tip: press <span className="a-kbd">Ctrl</span>+
            <span className="a-kbd">↵</span> to save
          </p>
        </div>
      </Drawer>

      <Confirm
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        onConfirm={() => {
          setConfirmClose(false);
          onClose();
        }}
        title="Discard changes?"
        body="You have unsaved changes. Closing the editor will throw them away."
        confirmLabel="Discard"
      />
    </>
  );
}
