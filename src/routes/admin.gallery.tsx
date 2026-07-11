// Gallery — the one place for everything the public gallery shows: grid/list
// views, multi-file image & video drag-drop upload straight to Cloudinary,
// YouTube links, category filters, edit drawer, delete with undo, and the
// gallery page heading (inline, instead of a separate content page).
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { doc, setDoc } from "firebase/firestore/lite";
import { toast } from "sonner";
import {
  Database,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Pencil,
  Play,
  Search,
  Trash2,
  Type,
  UploadCloud,
  Youtube,
} from "lucide-react";
import { db } from "@/integrations/firebase/client";
import { uploadToCloudinary } from "@/integrations/cloudinary";
import { cleanCaption } from "@/lib/assets";
import { cloudinaryPoster, videoInfo, youTubeId, youTubeThumb } from "@/lib/media";
import { useGalleryContent } from "@/lib/pages";
import { deleteRows, logActivity, saveRow, seedModule, useCol, useInvalidate } from "@/admin/api";
import { EditorDrawer } from "@/admin/editor";
import { moduleById, type Row } from "@/admin/registry";
import {
  Badge,
  Btn,
  Confirm,
  Empty,
  Field,
  FirestoreError,
  IconBtn,
  Modal,
  PageHeader,
  SelectWrap,
  SkeletonRows,
} from "@/admin/ui";

export const Route = createFileRoute("/admin/gallery")({
  head: () => ({ meta: [{ title: "Gallery — LK Admin" }] }),
  component: GalleryAdmin,
});

const def = moduleById("gallery");
const CATS = ["Factory", "Laboratory", "Products", "Services", "Team"];

function GalleryAdmin() {
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
  const [ytOpen, setYtOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let out = rows;
    if (cat) out = out.filter((r) => r.cat === cat);
    const needle = q.trim().toLowerCase();
    if (needle)
      out = out.filter((r) =>
        String(r.alt ?? "")
          .toLowerCase()
          .includes(needle),
      );
    return out;
  }, [rows, cat, q]);

  const uploadFiles = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
    );
    if (list.length === 0) {
      toast.error("Only image or video files can go in the gallery.");
      return;
    }
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      setUploading(list.length > 1 ? `${i + 1}/${list.length} — ${f.name}` : f.name);
      try {
        const res = await uploadToCloudinary(f);
        const isVideo = f.type.startsWith("video/") || res.resource_type === "video";
        await saveRow(def, {
          // Videos store their playback URL and show Cloudinary's first
          // frame as the poster; photos keep src only.
          src: isVideo ? (cloudinaryPoster(res.secure_url) ?? res.secure_url) : res.secure_url,
          video: isVideo ? res.secure_url : "",
          alt: cleanCaption(f.name, `${cat || "Products"} ${isVideo ? "video" : "photo"}`),
          cat: cat || "Products",
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : `Upload failed: ${f.name}`);
      }
    }
    setUploading(null);
    invalidate("gallery");
    toast.success(list.length > 1 ? `${list.length} files uploaded` : "Uploaded");
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
        title="Gallery"
        sub={`${rows.length} items on the public gallery · drop images or videos anywhere on this page to upload`}
        actions={
          <>
            <HeadingEditor />
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
            <Btn icon={Youtube} onClick={() => setYtOpen(true)}>
              Add YouTube video
            </Btn>
            <Btn
              variant="primary"
              icon={UploadCloud}
              busy={uploading !== null}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? `Uploading ${uploading}` : "Upload"}
            </Btn>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => void uploadFiles(e.target.files)}
            />
          </>
        }
      />

      {/* Filters */}
      <div className="a-card flex flex-wrap items-center gap-2 px-4 py-3">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
            style={{ color: "var(--a-text3)" }}
          />
          <input
            className="a-input !pl-8"
            placeholder="Search captions…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search gallery"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCat("")}
            className={`a-badge ${cat === "" ? "a-badge-accent" : "a-badge-neutral"} !cursor-pointer !py-1.5`}
          >
            All
          </button>
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c === cat ? "" : c)}
              className={`a-badge ${cat === c ? "a-badge-accent" : "a-badge-neutral"} !cursor-pointer !py-1.5`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <IconBtn
            label="Grid view"
            icon={LayoutGrid}
            size="sm"
            variant={view === "grid" ? "ghost" : "bare"}
            onClick={() => setView("grid")}
          />
          <IconBtn
            label="List view"
            icon={List}
            size="sm"
            variant={view === "list" ? "ghost" : "bare"}
            onClick={() => setView("list")}
          />
        </div>
      </div>

      {/* Drop hint overlay */}
      {dragOver && (
        <div
          className="pointer-events-none fixed inset-0 z-50 grid place-items-center"
          style={{ background: "var(--a-overlay)" }}
        >
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
        <div className="a-card">
          <SkeletonRows n={4} h={80} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="a-card">
          <Empty
            icon={ImageIcon}
            title={q || cat ? "No matches" : "No media yet"}
            body={
              q || cat
                ? "Try a different filter."
                : "Upload images or videos, add a YouTube link, or seed the built-in gallery."
            }
          />
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((r, i) => (
            <figure
              key={r.__id}
              className="a-card a-card-hover a-rise group overflow-hidden"
              style={{ animationDelay: `${(i % 10) * 30}ms` }}
            >
              <div
                className="relative aspect-[4/3] overflow-hidden"
                style={{ background: "var(--a-surface2)" }}
              >
                <img
                  src={String(r.src ?? "")}
                  alt={String(r.alt ?? "")}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
                {videoInfo(typeof r.video === "string" ? r.video : "") && (
                  <span className="absolute bottom-2 left-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white">
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </span>
                )}
                <div className="absolute inset-x-0 top-0 flex justify-end gap-1 p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
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
                <Badge tone="neutral" className="!text-[9px] shrink-0">
                  {String(r.cat ?? "")}
                </Badge>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="a-card divide-y overflow-hidden" style={{ borderColor: "var(--a-border)" }}>
          {filtered.map((r) => (
            <div
              key={r.__id}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--a-hover)]"
            >
              <div className="relative shrink-0">
                <img
                  src={String(r.src ?? "")}
                  alt=""
                  loading="lazy"
                  className="h-11 w-16 rounded-lg object-cover"
                />
                {videoInfo(typeof r.video === "string" ? r.video : "") && (
                  <span className="absolute inset-0 grid place-items-center rounded-lg bg-black/35 text-white">
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium">{String(r.alt ?? "")}</div>
                <div className="text-[11px]" style={{ color: "var(--a-text3)" }}>
                  {String(r.cat ?? "")}
                  {r.video ? " · video" : ""}
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
          // A YouTube link with no explicit thumbnail gets one automatically.
          const yt = youTubeId(String(values.video ?? ""));
          if (yt && !String(values.src ?? "").trim()) values.src = youTubeThumb(yt);
          await saveRow(def, values, (editing?.__id as string) || undefined);
          invalidate("gallery");
          toast.success("Saved");
        }}
      />

      <YouTubeModal
        open={ytOpen}
        onClose={() => setYtOpen(false)}
        defaultCat={cat || "Factory"}
        onAdd={async (values) => {
          await saveRow(def, values);
          invalidate("gallery");
          toast.success("Video added to the gallery");
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

/* ------------------------------------------------- YouTube link modal */

function YouTubeModal({
  open,
  onClose,
  defaultCat,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  defaultCat: string;
  onAdd: (values: Record<string, unknown>) => Promise<void>;
}) {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [cat, setCat] = useState(defaultCat);
  const [busy, setBusy] = useState(false);
  const id = youTubeId(url);

  const close = () => {
    setUrl("");
    setCaption("");
    onClose();
  };

  const add = async () => {
    if (!id) {
      toast.error("That doesn't look like a YouTube link.");
      return;
    }
    setBusy(true);
    try {
      await onAdd({
        src: youTubeThumb(id),
        video: url.trim(),
        alt: caption.trim() || "Video",
        cat: cat || "Factory",
      });
      close();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't add the video");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add a YouTube video"
      footer={
        <>
          <Btn onClick={close}>Cancel</Btn>
          <Btn variant="primary" busy={busy} disabled={!id} onClick={add}>
            Add video
          </Btn>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="YouTube link" required hint="watch, share or Shorts link">
          <input
            className="a-input"
            placeholder="https://youtube.com/watch?v=…"
            value={url}
            autoFocus
            onChange={(e) => setUrl(e.target.value)}
          />
        </Field>
        {id && (
          <img
            src={youTubeThumb(id)}
            alt=""
            className="w-full rounded-xl object-cover"
            style={{ border: "1px solid var(--a-border)" }}
          />
        )}
        <Field label="Caption">
          <input
            className="a-input"
            placeholder="e.g. Plant walkthrough"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </Field>
        <Field label="Category">
          <SelectWrap>
            <select className="a-select" value={cat} onChange={(e) => setCat(e.target.value)}>
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </SelectWrap>
        </Field>
      </div>
    </Modal>
  );
}

/* ------------------------------------- inline gallery page heading editor */

function HeadingEditor() {
  const { data: c } = useGalleryContent();
  const invalidate = useInvalidate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const heading = value ?? c.heroHeading;

  const save = async () => {
    setBusy(true);
    try {
      await setDoc(doc(db, "pages", "gallery"), { heroHeading: heading.trim() }, { merge: true });
      void logActivity("updated", "pages", "Gallery page heading");
      invalidate("gallery");
      toast.success("Heading saved — live on the site");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the heading");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Btn icon={Type} onClick={() => setOpen(true)}>
        Page heading
      </Btn>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Gallery page heading"
        footer={
          <>
            <Btn onClick={() => setOpen(false)}>Cancel</Btn>
            <Btn variant="primary" busy={busy} onClick={save}>
              Save
            </Btn>
          </>
        }
      >
        <Field label="Heading" hint="The big line at the top of the public gallery">
          <input
            className="a-input"
            value={heading}
            autoFocus
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void save();
              }
            }}
          />
        </Field>
      </Modal>
    </>
  );
}
