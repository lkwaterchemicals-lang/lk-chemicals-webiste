// Media library — grid/list views, multi-file drag & drop upload straight to
// Cloudinary, category filters, edit drawer, delete with undo.
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Database, Image as ImageIcon, LayoutGrid, List, Pencil, Search, Trash2, UploadCloud } from "lucide-react";
import { uploadToCloudinary } from "@/integrations/cloudinary";
import { deleteRows, saveRow, seedModule, useCol, useInvalidate } from "@/admin/api";
import { EditorDrawer } from "@/admin/editor";
import { moduleById, type Row } from "@/admin/registry";
import { Badge, Btn, Confirm, Empty, FirestoreError, IconBtn, PageHeader, SkeletonRows } from "@/admin/ui";

export const Route = createFileRoute("/admin/gallery")({
  head: () => ({ meta: [{ title: "Media — LK Admin" }] }),
  component: MediaAdmin,
});

const def = moduleById("gallery");
const CATS = ["Factory", "Laboratory", "Products", "Services", "Team"];

function MediaAdmin() {
  const { data: rows = [], isLoading, error } = useCol("gallery");
  const invalidate = useInvalidate();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Row | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let out = rows;
    if (cat) out = out.filter((r) => r.cat === cat);
    const needle = q.trim().toLowerCase();
    if (needle) out = out.filter((r) => String(r.alt ?? "").toLowerCase().includes(needle));
    return out;
  }, [rows, cat, q]);

  const uploadFiles = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      setUploading(list.length > 1 ? `${i + 1}/${list.length} — ${f.name}` : f.name);
      try {
        const res = await uploadToCloudinary(f);
        await saveRow(def, {
          src: res.secure_url,
          alt: f.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "),
          cat: cat || "Products",
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : `Upload failed: ${f.name}`);
      }
    }
    setUploading(null);
    invalidate("gallery");
    toast.success(list.length > 1 ? `${list.length} images uploaded` : "Image uploaded");
  };

  const doDelete = async (row: Row) => {
    const undo = await deleteRows(def, [row]);
    invalidate("gallery");
    toast(`Deleted "${String(row.alt ?? "media item")}"`, {
      action: {
        label: "Undo",
        onClick: async () => {
          await undo();
          invalidate("gallery");
          toast.success("Restored");
        },
      },
    });
  };

  return (
    <div
      className="space-y-4"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        void uploadFiles(e.dataTransfer.files);
      }}
    >
      <PageHeader
        title="Media"
        sub={`${rows.length} items in the public gallery · drop images anywhere on this page to upload`}
        actions={
          <>
            {rows.length === 0 && !isLoading && error == null && (
              <Btn
                icon={Database}
                busy={seeding}
                onClick={async () => {
                  setSeeding(true);
                  try {
                    const n = await seedModule(def);
                    invalidate("gallery");
                    toast.success(`Seeded ${n} built-in media items`);
                  } finally {
                    setSeeding(false);
                  }
                }}
              >
                Seed built-in data
              </Btn>
            )}
            <Btn variant="primary" icon={UploadCloud} busy={uploading !== null} onClick={() => fileRef.current?.click()}>
              {uploading ? `Uploading ${uploading}` : "Upload images"}
            </Btn>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => void uploadFiles(e.target.files)} />
          </>
        }
      />

      {/* Filters */}
      <div className="a-card flex flex-wrap items-center gap-2 px-4 py-3">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--a-text3)" }} />
          <input className="a-input !pl-8" placeholder="Search captions…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search media" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={() => setCat("")} className={`a-badge ${cat === "" ? "a-badge-accent" : "a-badge-neutral"} !cursor-pointer !py-1.5`}>
            All
          </button>
          {CATS.map((c) => (
            <button key={c} type="button" onClick={() => setCat(c === cat ? "" : c)} className={`a-badge ${cat === c ? "a-badge-accent" : "a-badge-neutral"} !cursor-pointer !py-1.5`}>
              {c}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <IconBtn label="Grid view" icon={LayoutGrid} size="sm" variant={view === "grid" ? "ghost" : "bare"} onClick={() => setView("grid")} />
          <IconBtn label="List view" icon={List} size="sm" variant={view === "list" ? "ghost" : "bare"} onClick={() => setView("list")} />
        </div>
      </div>

      {/* Drop hint overlay */}
      {dragOver && (
        <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center" style={{ background: "var(--a-overlay)" }}>
          <div className="a-card a-pop flex items-center gap-3 px-8 py-6">
            <UploadCloud className="h-6 w-6" style={{ color: "var(--a-accent)" }} />
            <span className="text-sm font-semibold">Drop to upload</span>
          </div>
        </div>
      )}

      {/* Body */}
      {error != null ? (
        <FirestoreError error={error} />
      ) : isLoading ? (
        <div className="a-card"><SkeletonRows n={4} h={80} /></div>
      ) : filtered.length === 0 ? (
        <div className="a-card">
          <Empty
            icon={ImageIcon}
            title={q || cat ? "No matches" : "No media yet"}
            body={q || cat ? "Try a different filter." : "Upload images or seed the built-in gallery to get started."}
          />
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((r, i) => (
            <figure key={r.__id} className="a-card a-card-hover a-rise group overflow-hidden" style={{ animationDelay: `${(i % 10) * 30}ms` }}>
              <div className="relative aspect-[4/3] overflow-hidden" style={{ background: "var(--a-surface2)" }}>
                <img
                  src={String(r.src ?? "")}
                  alt={String(r.alt ?? "")}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-0 top-0 flex justify-end gap-1 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    aria-label="Edit"
                    className="grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-black hover:bg-white"
                    onClick={() => setEditing(r)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete"
                    className="grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-red-600 hover:bg-white"
                    onClick={() => setConfirmDelete(r)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <figcaption className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="truncate text-[11px] font-medium">{String(r.alt ?? "")}</span>
                <Badge tone="neutral" className="!text-[9px] shrink-0">{String(r.cat ?? "")}</Badge>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="a-card divide-y overflow-hidden" style={{ borderColor: "var(--a-border)" }}>
          {filtered.map((r) => (
            <div key={r.__id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--a-hover)]">
              <img src={String(r.src ?? "")} alt="" loading="lazy" className="h-11 w-16 rounded-lg object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium">{String(r.alt ?? "")}</div>
                <div className="text-[11px]" style={{ color: "var(--a-text3)" }}>
                  {String(r.cat ?? "")}
                  {r.wide ? " · wide" : ""}
                  {r.tall ? " · tall" : ""}
                </div>
              </div>
              <IconBtn label="Edit" icon={Pencil} size="sm" onClick={() => setEditing(r)} />
              <IconBtn label="Delete" icon={Trash2} size="sm" onClick={() => setConfirmDelete(r)} />
            </div>
          ))}
        </div>
      )}

      <EditorDrawer
        def={def}
        fields={def.fields}
        initial={editing}
        onClose={() => setEditing(null)}
        onSave={async (values) => {
          await saveRow(def, values, (editing?.__id as string) || undefined);
          invalidate("gallery");
          toast.success("Saved");
        }}
      />

      <Confirm
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (confirmDelete) await doDelete(confirmDelete);
        }}
        title="Delete this media item?"
        body="It disappears from the public gallery immediately. You can undo from the toast."
      />
    </div>
  );
}
