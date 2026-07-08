// Generic CRUD page for registry modules — table, editor drawer, duplicate,
// delete with undo, bulk delete, seed, CSV export and public preview links.
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Check,
  Copy,
  Database,
  ExternalLink,
  ListOrdered,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { deleteRows, duplicateRow, saveRow, seedModule, useCol, useInvalidate } from "./api";
import { EditorDrawer } from "./editor";
import { ReorderList } from "./reorder";
import { DataTable, type Col } from "./table";
import { rowImage, rowTitle, type ModuleDef, type Row } from "./registry";
import { Btn, Confirm, IconBtn, PageHeader } from "./ui";

export function ModulePage({
  def,
  cols,
  searchText,
  urlQuery,
  urlNew,
  extraToolbar,
  headerExtra,
  filterRows,
}: {
  def: ModuleDef;
  cols: Col<Row>[];
  searchText: (r: Row) => string;
  urlQuery?: string;
  urlNew?: boolean;
  extraToolbar?: ReactNode;
  headerExtra?: ReactNode;
  filterRows?: (rows: Row[]) => Row[];
}) {
  const { data: allRows = [], isLoading, error } = useCol(def.id, def.order);
  const rows = filterRows ? filterRows(allRows) : allRows;
  // Collections referenced by select / multiref fields across the registry.
  const { data: cats = [] } = useCol("categories", "number");
  const { data: prods = [] } = useCol("products");
  const { data: svcCats = [] } = useCol("serviceCategories", "number");
  const { data: svcs = [] } = useCol("services");
  const invalidate = useInvalidate();
  const [editing, setEditing] = useState<Record<string, unknown> | null>(urlNew ? {} : null);
  const [confirmDelete, setConfirmDelete] = useState<Row[] | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [reordering, setReordering] = useState(false);
  const editingId = editing?.__id as string | undefined;

  // Reference options (category / parent / related) are resolved live from
  // Firestore by each field's `refCollection`, so selects always reflect what
  // actually exists. A field whose refCollection is the module's own id
  // self-references (parent / related-to-self) and excludes the current record.
  const fields = useMemo(() => {
    const toItems = (list: Row[]) =>
      list.map((r) => ({ value: String(r.slug ?? r.__id), label: String(r.name ?? r.__id) }));
    const byCollection: Record<string, { value: string; label: string }[]> = {
      categories: toItems(cats),
      products: toItems(prods),
      serviceCategories: toItems(svcCats),
      services: toItems(svcs),
    };
    return def.fields.map((f) => {
      if ((f.type === "select" || f.type === "multiref") && f.refCollection) {
        let items = byCollection[f.refCollection] ?? [];
        if (f.refCollection === def.id) items = items.filter((o) => o.value !== editingId);
        return { ...f, optionItems: items };
      }
      return f;
    });
  }, [def, cats, prods, svcCats, svcs, editingId]);

  const doDelete = async (targets: Row[]) => {
    const undo = await deleteRows(def, targets);
    invalidate(def.id);
    toast(
      `Deleted ${targets.length === 1 ? rowTitle(def, targets[0]) : `${targets.length} ${def.label.toLowerCase()}`}`,
      {
        action: {
          label: "Undo",
          onClick: async () => {
            await undo();
            invalidate(def.id);
            toast.success("Restored");
          },
        },
      },
    );
  };

  const doDuplicate = async (row: Row) => {
    await duplicateRow(def, row);
    invalidate(def.id);
    toast.success("Duplicated — now edit the copy");
  };

  const doSeed = async () => {
    setSeeding(true);
    try {
      const n = await seedModule(def);
      invalidate(def.id);
      toast.success(`Seeded ${n} built-in ${def.label.toLowerCase()}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={def.label}
        sub={`${rows.length} ${rows.length === 1 ? def.singular : def.label.toLowerCase()} · changes go live on the public site immediately`}
        actions={
          <>
            {headerExtra}
            {allRows.length === 0 && def.seed && !isLoading && error == null && (
              <Btn icon={Database} busy={seeding} onClick={doSeed}>
                Seed built-in data
              </Btn>
            )}
            {def.reorderable && allRows.length > 1 && (
              <Btn
                icon={reordering ? Check : ListOrdered}
                variant={reordering ? "primary" : undefined}
                onClick={() => setReordering((v) => !v)}
              >
                {reordering ? "Done" : "Reorder"}
              </Btn>
            )}
            {!reordering && (
              <Btn variant="primary" icon={Plus} onClick={() => setEditing({})}>
                New {def.singular}
              </Btn>
            )}
          </>
        }
      />

      {reordering ? (
        <ReorderList def={def} rows={allRows} />
      ) : (
        <DataTable<Row>
          rows={rows}
          cols={cols}
          loading={isLoading}
          error={error}
          searchText={searchText}
          searchPlaceholder={`Search ${def.label.toLowerCase()}…  ( / )`}
          initialSearch={urlQuery ?? ""}
          toolbar={extraToolbar}
          csvName={def.id}
          onRow={(r) => setEditing(r)}
          emptyTitle={`No ${def.label.toLowerCase()} yet`}
          emptyBody={
            def.seed
              ? `The public site is showing the built-in ${def.label.toLowerCase()}. Seed them here to start editing, or create one from scratch.`
              : undefined
          }
          emptyAction={
            def.seed ? (
              <Btn icon={Database} busy={seeding} onClick={doSeed}>
                Seed built-in data
              </Btn>
            ) : undefined
          }
          rowActions={(r) => (
            <>
              {def.publicPath?.(r) && (
                <IconBtn
                  label="View on site"
                  icon={ExternalLink}
                  size="sm"
                  onClick={() => window.open(def.publicPath!(r)!, "_blank")}
                />
              )}
              <IconBtn
                label="Duplicate"
                icon={Copy}
                size="sm"
                onClick={() => void doDuplicate(r)}
              />
              <IconBtn label="Edit" icon={Pencil} size="sm" onClick={() => setEditing(r)} />
              <IconBtn
                label="Delete"
                icon={Trash2}
                size="sm"
                onClick={() => setConfirmDelete([r])}
              />
            </>
          )}
          bulkActions={(selected, clear) => (
            <Btn
              size="sm"
              variant="danger"
              icon={Trash2}
              onClick={() => {
                setConfirmDelete(selected);
                clear();
              }}
            >
              Delete {selected.length}
            </Btn>
          )}
          mobileCard={(r) => (
            <div className="flex items-center gap-3">
              {rowImage(def, r) && (
                <img
                  src={rowImage(def, r)!}
                  alt=""
                  className="h-10 w-14 rounded-lg object-cover shrink-0"
                />
              )}
              <div className="min-w-0">
                <div className="text-[13px] font-semibold truncate">{rowTitle(def, r)}</div>
                {def.subtitleField && (
                  <div className="text-[11px] truncate" style={{ color: "var(--a-text3)" }}>
                    {String(r[def.subtitleField] ?? "")}
                  </div>
                )}
              </div>
            </div>
          )}
        />
      )}

      <EditorDrawer
        def={def}
        fields={fields}
        initial={editing}
        onClose={() => setEditing(null)}
        onSave={async (values) => {
          await saveRow(def, values, (editing?.__id as string) || undefined);
          invalidate(def.id);
          toast.success(
            editing?.__id
              ? "Saved"
              : `${def.singular[0].toUpperCase() + def.singular.slice(1)} created`,
          );
        }}
      />

      <Confirm
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (confirmDelete) await doDelete(confirmDelete);
        }}
        title={
          confirmDelete && confirmDelete.length > 1
            ? `Delete ${confirmDelete.length} ${def.label.toLowerCase()}?`
            : `Delete this ${def.singular}?`
        }
        body="You can undo this from the toast for a few seconds after deleting."
      />
    </div>
  );
}
