// Drag-and-drop reordering for a registry module. Rendered in place of the
// data table when the admin toggles "Reorder". Uses native HTML5 drag events
// (no extra dependencies); every drop persists a fresh 1..n ordering to
// Firestore via reorderRows(), so the public site reflects the order instantly.
import { useEffect, useState } from "react";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import { reorderRows, useInvalidate } from "./api";
import { rowImage, rowTitle, type ModuleDef, type Row } from "./registry";

export function ReorderList({ def, rows }: { def: ModuleDef; rows: Row[] }) {
  const invalidate = useInvalidate();
  const [items, setItems] = useState<Row[]>(rows);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Re-sync when the underlying data changes (e.g. after a save elsewhere),
  // but not while the admin is mid-drag.
  useEffect(() => {
    if (!dragId) setItems(rows);
  }, [rows, dragId]);

  const persist = async (ordered: Row[]) => {
    setSaving(true);
    try {
      await reorderRows(
        def,
        ordered.map((r) => r.__id),
      );
      invalidate(def.id);
      toast.success("Order saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the new order");
    } finally {
      setSaving(false);
    }
  };

  const drop = (targetId: string) => {
    setOverId(null);
    if (!dragId || dragId === targetId) return setDragId(null);
    const from = items.findIndex((r) => r.__id === dragId);
    const to = items.findIndex((r) => r.__id === targetId);
    if (from < 0 || to < 0) return setDragId(null);
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    setDragId(null);
    void persist(next);
  };

  return (
    <div className="a-card overflow-hidden">
      <div
        className="flex items-center gap-2 px-4 py-3 text-[13px]"
        style={{ borderBottom: "1px solid var(--a-border)", color: "var(--a-text2)" }}
      >
        <GripVertical className="h-4 w-4 shrink-0" style={{ color: "var(--a-text3)" }} />
        <span>
          Drag rows to set the order they appear on the public site.
          {saving && <span style={{ color: "var(--a-accent)" }}> Saving…</span>}
        </span>
      </div>
      <ul className="p-2">
        {items.map((r, i) => (
          <li
            key={r.__id}
            draggable
            onDragStart={() => setDragId(r.__id)}
            onDragEnd={() => {
              setDragId(null);
              setOverId(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (overId !== r.__id) setOverId(r.__id);
            }}
            onDrop={() => drop(r.__id)}
            data-dragging={dragId === r.__id}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-grab active:cursor-grabbing transition-colors"
            style={{
              background: overId === r.__id && dragId !== r.__id ? "var(--a-hover)" : "transparent",
              opacity: dragId === r.__id ? 0.4 : 1,
              border:
                overId === r.__id && dragId !== r.__id
                  ? "1px dashed var(--a-accent)"
                  : "1px solid transparent",
            }}
          >
            <GripVertical className="h-4 w-4 shrink-0" style={{ color: "var(--a-text3)" }} />
            <span
              className="w-6 text-center text-xs font-bold tabular-nums shrink-0"
              style={{ color: "var(--a-accent)" }}
            >
              {i + 1}
            </span>
            {rowImage(def, r) ? (
              <img
                src={rowImage(def, r)!}
                alt=""
                className="h-9 w-12 rounded-md object-cover shrink-0"
                loading="lazy"
              />
            ) : (
              <span
                className="h-9 w-12 rounded-md shrink-0"
                style={{ background: "var(--a-surface2)" }}
              />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold">{rowTitle(def, r)}</span>
              {def.subtitleField && (
                <span className="block truncate text-[11px]" style={{ color: "var(--a-text3)" }}>
                  {String(r[def.subtitleField] ?? "")}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
