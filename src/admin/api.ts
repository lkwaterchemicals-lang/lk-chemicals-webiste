// Firestore data layer for the admin — CRUD with audit logging and undo.
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore/lite";
import { db } from "@/integrations/firebase/client";
import { auth } from "@/integrations/firebase/auth";
import { slugify, stabilizeAssets, type ModuleDef, type Row } from "./registry";

/* ------------------------------------------------------------------ reads */

export function useCol(name: string, order?: string) {
  return useQuery({
    queryKey: ["admin", name],
    queryFn: async (): Promise<Row[]> => {
      const ref = collection(db, name);
      const snap = await getDocs(order ? query(ref, orderBy(order)) : ref);
      return snap.docs.map((d) => ({ __id: d.id, ...d.data() }) as Row);
    },
    retry: 1,
    staleTime: 15_000,
  });
}

export function useActivity(n = 60) {
  return useQuery({
    queryKey: ["admin", "activity", n],
    queryFn: async (): Promise<Row[]> => {
      const snap = await getDocs(
        query(collection(db, "activity"), orderBy("at", "desc"), limit(n)),
      );
      return snap.docs.map((d) => ({ __id: d.id, ...d.data() }) as Row);
    },
    retry: 1,
    staleTime: 15_000,
  });
}

export function useEnquiries() {
  return useQuery({
    queryKey: ["admin", "enquiries"],
    queryFn: async (): Promise<Row[]> => {
      const snap = await getDocs(query(collection(db, "enquiries"), orderBy("createdAt", "desc")));
      return snap.docs.map((d) => ({ __id: d.id, ...d.data() }) as Row);
    },
    retry: 1,
    staleTime: 15_000,
  });
}

export function useInvalidate() {
  const qc = useQueryClient();
  return (name: string) => {
    qc.invalidateQueries({ queryKey: ["admin", name] });
    qc.invalidateQueries({ queryKey: ["admin", "activity"] });
    qc.invalidateQueries({ queryKey: ["content"] }); // public site hooks
  };
}

/* ------------------------------------------------------------------ audit */

export type ActivityAction =
  "created" | "updated" | "deleted" | "restored" | "duplicated" | "seeded" | "status";

export async function logActivity(action: ActivityAction, module: string, label: string) {
  try {
    await addDoc(collection(db, "activity"), {
      action,
      module,
      label,
      user: auth.currentUser?.email ?? "unknown",
      at: serverTimestamp(),
    });
  } catch {
    // Audit logging must never block the actual operation.
  }
}

/* ----------------------------------------------------------------- writes */

function stripMeta(values: Record<string, unknown>): Record<string, unknown> {
  const { __id: _drop, ...rest } = values as { __id?: string };
  return rest;
}

export async function saveRow(
  def: ModuleDef,
  values: Record<string, unknown>,
  existingId?: string,
): Promise<string> {
  let id = existingId;
  if (!id) {
    const fromIdField = def.idField ? String(values[def.idField] ?? "") : "";
    id = fromIdField || slugify(String(values[def.titleField] ?? "")) || crypto.randomUUID();
  }
  if (def.idField === "slug" && !values.slug) values.slug = id;
  await setDoc(
    doc(db, def.id, id),
    { ...stripMeta(values), _updatedAt: serverTimestamp() },
    { merge: true },
  );
  void logActivity(
    existingId ? "updated" : "created",
    def.id,
    String(values[def.titleField] ?? id),
  );
  return id;
}

/** Deletes rows; returns an undo() that restores them. */
export async function deleteRows(def: ModuleDef, rows: Row[]): Promise<() => Promise<void>> {
  const copies = rows.map((r) => ({ id: r.__id, data: stripMeta(r) }));
  await Promise.all(rows.map((r) => deleteDoc(doc(db, def.id, r.__id))));
  void logActivity(
    "deleted",
    def.id,
    rows
      .map((r) => String(r[def.titleField] ?? r.__id))
      .join(", ")
      .slice(0, 120),
  );
  return async () => {
    await Promise.all(copies.map((c) => setDoc(doc(db, def.id, c.id), c.data)));
    void logActivity(
      "restored",
      def.id,
      copies
        .map((c) => c.id)
        .join(", ")
        .slice(0, 120),
    );
  };
}

export async function duplicateRow(def: ModuleDef, row: Row): Promise<string> {
  const data = stripMeta(row);
  const newId = def.idField ? `${row.__id}-copy` : crypto.randomUUID();
  if (def.idField === "slug") data.slug = newId;
  if (def.titleField && typeof data[def.titleField] === "string") {
    data[def.titleField] = `${String(data[def.titleField])} (copy)`;
  }
  await setDoc(doc(db, def.id, newId), { ...data, _updatedAt: serverTimestamp() });
  void logActivity("duplicated", def.id, String(data[def.titleField] ?? newId));
  return newId;
}

/** Persists a new order for `orderedIds` by writing sequential values (1..n)
 * to each row's ordering field (`def.order`, defaulting to `order`). */
export async function reorderRows(def: ModuleDef, orderedIds: string[]): Promise<void> {
  const field = def.order || "order";
  await Promise.all(
    orderedIds.map((id, i) =>
      setDoc(
        doc(db, def.id, id),
        { [field]: String(i + 1).padStart(2, "0"), _updatedAt: serverTimestamp() },
        { merge: true },
      ),
    ),
  );
  void logActivity("updated", def.id, `reordered ${orderedIds.length} ${def.label.toLowerCase()}`);
}

export async function seedModule(def: ModuleDef): Promise<number> {
  if (!def.seed) return 0;
  const items = def.seed();
  for (const raw of items) {
    const item = stabilizeAssets(raw);
    const id = def.idField
      ? String(item[def.idField])
      : slugify(String(item[def.titleField] ?? "")) || crypto.randomUUID();
    await setDoc(doc(db, def.id, id), item, { merge: true });
  }
  void logActivity("seeded", def.id, `${items.length} built-in ${def.label.toLowerCase()}`);
  return items.length;
}

/* -------------------------------------------------------------- enquiries */

export type EnquiryStatus = "new" | "contacted" | "closed";

export async function setEnquiryStatus(id: string, status: EnquiryStatus, name: string) {
  await setDoc(doc(db, "enquiries", id), { status }, { merge: true });
  void logActivity("status", "enquiries", `${name} → ${status}`);
}

export async function deleteEnquiries(rows: Row[]): Promise<() => Promise<void>> {
  const copies = rows.map((r) => ({ id: r.__id, data: stripMeta(r) }));
  await Promise.all(rows.map((r) => deleteDoc(doc(db, "enquiries", r.__id))));
  void logActivity(
    "deleted",
    "enquiries",
    rows
      .map((r) => String(r.name ?? r.__id))
      .join(", ")
      .slice(0, 120),
  );
  return async () => {
    await Promise.all(copies.map((c) => setDoc(doc(db, "enquiries", c.id), c.data)));
  };
}
