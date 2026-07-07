// Record editor — a right-hand drawer with validation, dirty-state guard,
// auto-slugs and drag & drop image upload straight to Cloudinary.
import { useMemo, useRef, useState } from "react";
import { Image as ImageIcon, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/integrations/cloudinary";
import { slugify, type FieldDef, type ModuleDef } from "./registry";
import { Btn, Confirm, Drawer, Field, SelectWrap } from "./ui";

/* ------------------------------------------------------------ image field */

export function ImageField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [progress, setProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File | undefined | null) => {
    if (!file) return;
    setProgress(0);
    try {
      const res = await uploadToCloudinary(file, setProgress);
      onChange(res.secure_url);
      toast.success("Uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setProgress(null);
    }
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload image"
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          pick(e.dataTransfer.files?.[0]);
        }}
        className="relative grid place-items-center overflow-hidden rounded-xl cursor-pointer transition-all"
        style={{
          border: `1.5px dashed ${dragOver ? "var(--a-accent)" : "var(--a-border2)"}`,
          background: dragOver ? "var(--a-accent-soft)" : "var(--a-surface2)",
          minHeight: value ? undefined : 120,
        }}
      >
        {value ? (
          <>
            <img src={value} alt="" className="h-40 w-full object-cover" />
            <div className="absolute inset-0 grid place-items-center bg-black/45 opacity-0 hover:opacity-100 transition-opacity">
              <span className="a-btn a-btn-ghost a-btn-sm !bg-white/90 !text-black">
                <UploadCloud className="h-3.5 w-3.5" /> Replace
              </span>
            </div>
          </>
        ) : (
          <div className="py-6 text-center">
            <UploadCloud className="mx-auto h-5 w-5" style={{ color: "var(--a-text3)" }} />
            <p className="mt-2 text-xs font-medium" style={{ color: "var(--a-text2)" }}>
              {progress !== null ? `Uploading ${progress}%…` : "Drop an image, or click to browse"}
            </p>
            <p className="mt-0.5 text-[11px]" style={{ color: "var(--a-text3)" }}>JPG, PNG or WebP</p>
          </div>
        )}
        {progress !== null && (
          <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: "var(--a-surface2)" }}>
            <div className="h-full transition-all" style={{ width: `${progress}%`, background: "var(--a-accent)" }} />
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      <div className="mt-2 flex items-center gap-2">
        <input
          className="a-input !py-1.5 !text-xs"
          placeholder="…or paste an image URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            className="a-btn a-btn-bare a-btn-sm a-iconbtn shrink-0"
            aria-label="Remove image"
            title="Remove image"
            onClick={() => onChange("")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

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
    for (const f of fields) v[f.key] = initial?.[f.key] ?? (f.type === "boolean" ? false : f.type === "list" ? [] : "");
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
      if (f.required && !String(values[f.key] ?? "").trim()) errs[f.key] = `${f.label} is required.`;
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
            <Field key={f.key} label={f.label} hint={f.hint} required={f.required} error={errors[f.key] || null}>
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
                <textarea className="a-textarea" value={String(values[f.key] ?? "")} placeholder={f.placeholder} onChange={(e) => set(f, e.target.value)} />
              )}
              {f.type === "list" && (
                <textarea
                  className="a-textarea font-mono !text-xs"
                  placeholder="One entry per line"
                  value={Array.isArray(values[f.key]) ? (values[f.key] as string[]).join("\n") : String(values[f.key] ?? "")}
                  onChange={(e) => set(f, e.target.value.split("\n"))}
                  onBlur={(e) => set(f, e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
                />
              )}
              {f.type === "image" && <ImageField value={String(values[f.key] ?? "")} onChange={(url) => set(f, url)} />}
              {f.type === "boolean" && (
                <label className="flex items-center gap-2 text-[13px] cursor-pointer" style={{ color: "var(--a-text2)" }}>
                  <input type="checkbox" className="a-check" checked={Boolean(values[f.key])} onChange={(e) => set(f, e.target.checked)} />
                  Enabled
                </label>
              )}
              {f.type === "select" && (
                <SelectWrap>
                  <select className="a-select" value={String(values[f.key] ?? "")} onChange={(e) => set(f, e.target.value)}>
                    <option value="">— choose —</option>
                    {(f.options ?? []).map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </SelectWrap>
              )}
            </Field>
          ))}
          <p className="text-[11px] pt-1 flex items-center gap-1.5" style={{ color: "var(--a-text3)" }}>
            <ImageIcon className="h-3 w-3" /> Tip: press <span className="a-kbd">Ctrl</span>+<span className="a-kbd">↵</span> to save
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
