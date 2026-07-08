// Rich editor field inputs shared by the module editor drawer.
//
// ImageField (single upload) plus the repeatable/rich types the catalog needs:
// GroupInput (spec-style rows), GalleryInput (ordered images), DocumentsInput
// (labelled file uploads) and MultiRefInput (multi-select of other records).
// All uploads go through Cloudinary's `auto` endpoint so any file type works.
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, File as FileIcon, Plus, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/integrations/cloudinary";
import type { FieldDef } from "./registry";
import { Btn, Field, SelectWrap } from "./ui";

/* ------------------------------------------------------------ image field */

export function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
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
            <p className="mt-0.5 text-[11px]" style={{ color: "var(--a-text3)" }}>
              JPG, PNG or WebP
            </p>
          </div>
        )}
        {progress !== null && (
          <div
            className="absolute inset-x-0 bottom-0 h-1"
            style={{ background: "var(--a-surface2)" }}
          >
            <div
              className="h-full transition-all"
              style={{ width: `${progress}%`, background: "var(--a-accent)" }}
            />
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
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

/* ----------------------------------------------- leaf input (group rows) */

function SubLeaf({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
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
    case "select":
      return (
        <SelectWrap>
          <select
            className="a-select"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">— choose —</option>
            {(field.optionItems ?? (field.options ?? []).map((o) => ({ value: o, label: o }))).map(
              (o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ),
            )}
          </select>
        </SelectWrap>
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

/* ------------------------------------------------------------ group field */

const blankRow = (fields: FieldDef[]) => {
  const o: Record<string, unknown> = {};
  for (const f of fields) o[f.key] = f.type === "boolean" ? false : "";
  return o;
};

export function GroupInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: Record<string, unknown>[]) => void;
}) {
  const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
  const sub = field.itemFields ?? [];
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
                    <SubLeaf
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
      <Btn size="sm" icon={Plus} onClick={() => onChange([...items, blankRow(sub)])}>
        Add {field.itemNoun ?? "row"}
      </Btn>
    </div>
  );
}

/* ---------------------------------------------------------- gallery field */

export function GalleryInput({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (v: string[]) => void;
}) {
  const items = Array.isArray(value) ? (value as string[]) : [];
  const setAt = (i: number, url: string) =>
    onChange(items.map((v, j) => (j === i ? url : v)).filter(Boolean));
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((url, i) => (
          <div key={i} className="space-y-1.5">
            <ImageField value={url} onChange={(u) => setAt(i, u)} />
            <div className="flex items-center justify-between gap-1">
              <div className="flex gap-1">
                <button
                  type="button"
                  className="a-btn a-btn-bare a-btn-sm a-iconbtn"
                  aria-label="Move left"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                >
                  <ArrowUp className="h-3.5 w-3.5 -rotate-90" />
                </button>
                <button
                  type="button"
                  className="a-btn a-btn-bare a-btn-sm a-iconbtn"
                  aria-label="Move right"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                >
                  <ArrowDown className="h-3.5 w-3.5 -rotate-90" />
                </button>
              </div>
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
        ))}
      </div>
      <Btn size="sm" icon={Plus} onClick={() => onChange([...items, ""])}>
        Add image
      </Btn>
    </div>
  );
}

/* -------------------------------------------------------- documents field */

type Doc = { label: string; url: string; type?: string };

export function DocumentsInput({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (v: Doc[]) => void;
}) {
  const items = Array.isArray(value) ? (value as Doc[]) : [];
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const setLabel = (i: number, label: string) =>
    onChange(items.map((d, j) => (j === i ? { ...d, label } : d)));
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));

  const upload = async (file: File | undefined | null) => {
    if (!file) return;
    setProgress(0);
    try {
      const res = await uploadToCloudinary(file, setProgress);
      const ext = (file.name.split(".").pop() ?? "").toUpperCase();
      onChange([
        ...items,
        { label: file.name.replace(/\.[^.]+$/, ""), url: res.secure_url, type: ext },
      ]);
      toast.success("Uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="space-y-2">
      {items.map((d, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-lg p-2"
          style={{ border: "1px solid var(--a-border)", background: "var(--a-surface2)" }}
        >
          <FileIcon className="h-4 w-4 shrink-0" style={{ color: "var(--a-text3)" }} />
          <input
            className="a-input !py-1.5 !text-xs flex-1"
            value={d.label}
            placeholder="Label"
            onChange={(e) => setLabel(i, e.target.value)}
          />
          {d.type && <span className="a-badge a-badge-neutral shrink-0">{d.type}</span>}
          <a
            href={d.url}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] underline shrink-0"
            style={{ color: "var(--a-accent)" }}
          >
            view
          </a>
          <button
            type="button"
            className="a-btn a-btn-bare a-btn-sm a-iconbtn shrink-0"
            aria-label="Remove"
            onClick={() => remove(i)}
            style={{ color: "var(--a-danger)" }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={(e) => upload(e.target.files?.[0])}
      />
      <Btn size="sm" icon={UploadCloud} onClick={() => fileRef.current?.click()}>
        {progress !== null ? `Uploading ${progress}%…` : "Upload document"}
      </Btn>
    </div>
  );
}

/* --------------------------------------------------------- multiref field */

export function MultiRefInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: string[]) => void;
}) {
  const selected = Array.isArray(value) ? (value as string[]) : [];
  const options = field.optionItems ?? (field.options ?? []).map((o) => ({ value: o, label: o }));
  const [q, setQ] = useState("");
  const toggle = (val: string) =>
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
  const shown = options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <input
        className="a-input !py-1.5 !text-xs"
        placeholder="Filter…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div
        className="mt-2 max-h-48 overflow-y-auto rounded-lg p-1"
        style={{ border: "1px solid var(--a-border)" }}
      >
        {shown.length === 0 ? (
          <p className="px-2 py-3 text-[12px]" style={{ color: "var(--a-text3)" }}>
            Nothing to choose yet.
          </p>
        ) : (
          shown.map((o) => (
            <label
              key={o.value}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] cursor-pointer hover:bg-[var(--a-hover)]"
              style={{ color: "var(--a-text2)" }}
            >
              <input
                type="checkbox"
                className="a-check"
                checked={selected.includes(o.value)}
                onChange={() => toggle(o.value)}
              />
              <span className="truncate">{o.label}</span>
            </label>
          ))
        )}
      </div>
      {selected.length > 0 && (
        <p className="mt-1.5 text-[11px]" style={{ color: "var(--a-text3)" }}>
          {selected.length} selected
        </p>
      )}
    </div>
  );
}
