// Enterprise data table — search, sort, bulk selection, pagination, column
// visibility, CSV export. Renders as a true table on ≥sm screens and as a
// stacked card list on phones, so nothing ever scrolls horizontally.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Columns3, Download, Inbox, Search } from "lucide-react";
import { downloadCsv } from "./registry";
import { Btn, IconBtn, SkeletonRows, Empty, FirestoreError } from "./ui";

export type Col<T> = {
  id: string;
  label: string;
  render: (row: T) => ReactNode;
  sortVal?: (row: T) => string | number;
  csv?: (row: T) => string | number;
  /** hide by default below this breakpoint (still visible in mobile cards via render slots) */
  hideBelow?: "md" | "lg";
  width?: string;
};

export function DataTable<T extends { __id: string }>({
  rows,
  cols,
  loading,
  error,
  searchText,
  searchPlaceholder = "Search…",
  initialSearch = "",
  toolbar,
  onRow,
  rowActions,
  bulkActions,
  emptyTitle = "Nothing here yet",
  emptyBody,
  emptyAction,
  pageSize = 12,
  csvName,
  mobileCard,
}: {
  rows: T[];
  cols: Col<T>[];
  loading?: boolean;
  error?: unknown;
  searchText: (row: T) => string;
  searchPlaceholder?: string;
  initialSearch?: string;
  toolbar?: ReactNode;
  onRow?: (row: T) => void;
  rowActions?: (row: T) => ReactNode;
  bulkActions?: (selected: T[], clear: () => void) => ReactNode;
  emptyTitle?: string;
  emptyBody?: ReactNode;
  emptyAction?: ReactNode;
  pageSize?: number;
  csvName?: string;
  mobileCard: (row: T) => ReactNode;
}) {
  const [q, setQ] = useState(initialSearch);
  const [sort, setSort] = useState<{ id: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [colMenu, setColMenu] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const colMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQ(initialSearch), [initialSearch]);

  // "/" focuses search when not typing elsewhere.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    addEventListener("keydown", h);
    return () => removeEventListener("keydown", h);
  }, []);

  // Close column menu on outside click.
  useEffect(() => {
    if (!colMenu) return;
    const h = (e: MouseEvent) => {
      if (!colMenuRef.current?.contains(e.target as Node)) setColMenu(false);
    };
    addEventListener("mousedown", h);
    return () => removeEventListener("mousedown", h);
  }, [colMenu]);

  const filtered = useMemo(() => {
    let out = rows;
    const needle = q.trim().toLowerCase();
    if (needle) out = out.filter((r) => searchText(r).toLowerCase().includes(needle));
    if (sort) {
      const col = cols.find((c) => c.id === sort.id);
      if (col?.sortVal) {
        out = [...out].sort((a, b) => {
          const av = col.sortVal!(a);
          const bv = col.sortVal!(b);
          return (av < bv ? -1 : av > bv ? 1 : 0) * sort.dir;
        });
      }
    }
    return out;
  }, [rows, q, sort, cols, searchText]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const pageRows = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  useEffect(() => {
    if (page > pages - 1) setPage(0);
  }, [pages, page]);
  useEffect(() => setPage(0), [q]);

  const visCols = cols.filter((c) => !hidden.has(c.id));
  const selectedRows = rows.filter((r) => selected.has(r.__id));
  const clearSel = () => setSelected(new Set());
  const allOnPage = pageRows.length > 0 && pageRows.every((r) => selected.has(r.__id));

  const toggleAll = () => {
    setSelected((s) => {
      const n = new Set(s);
      if (allOnPage) pageRows.forEach((r) => n.delete(r.__id));
      else pageRows.forEach((r) => n.add(r.__id));
      return n;
    });
  };

  const exportCsv = () => {
    const cCols = cols.filter((c) => c.csv);
    downloadCsv(
      `${csvName || "export"}.csv`,
      cCols.map((c) => c.label),
      filtered.map((r) => cCols.map((c) => c.csv!(r))),
    );
  };

  const headerSort = (c: Col<T>) => {
    if (!c.sortVal) return;
    setSort((s) => (s?.id !== c.id ? { id: c.id, dir: 1 } : s.dir === 1 ? { id: c.id, dir: -1 } : null));
  };

  return (
    <div className="a-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--a-border)" }}>
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--a-text3)" }} />
          <input
            ref={searchRef}
            className="a-input !pl-8"
            placeholder={searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search table"
          />
        </div>
        {toolbar}
        <div className="ml-auto flex items-center gap-2">
          {csvName && (
            <Btn size="sm" icon={Download} onClick={exportCsv} disabled={filtered.length === 0}>
              <span className="hidden sm:inline">Export CSV</span>
            </Btn>
          )}
          <div className="relative hidden sm:block" ref={colMenuRef}>
            <IconBtn label="Columns" icon={Columns3} variant="ghost" size="sm" onClick={() => setColMenu((v) => !v)} />
            {colMenu && (
              <div className="a-card a-pop absolute right-0 top-full z-20 mt-1 w-44 p-2" style={{ boxShadow: "var(--a-shadow-lg)" }}>
                {cols.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs cursor-pointer hover:bg-[var(--a-hover)]">
                    <input
                      type="checkbox"
                      className="a-check"
                      checked={!hidden.has(c.id)}
                      onChange={() =>
                        setHidden((h) => {
                          const n = new Set(h);
                          if (n.has(c.id)) n.delete(c.id);
                          else if (n.size < cols.length - 1) n.add(c.id);
                          return n;
                        })
                      }
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      {error != null ? (
        <div className="p-4"><FirestoreError error={error} /></div>
      ) : loading ? (
        <SkeletonRows n={6} />
      ) : filtered.length === 0 ? (
        <Empty icon={Inbox} title={q ? "No matches" : emptyTitle} body={q ? `Nothing matches "${q}".` : emptyBody} action={q ? undefined : emptyAction} />
      ) : (
        <>
          {/* Desktop / tablet table */}
          <div className="a-scroll-x hidden sm:block max-h-[62vh] overflow-y-auto">
            <table className="a-table">
              <thead>
                <tr>
                  {bulkActions && (
                    <th style={{ width: 36 }}>
                      <input type="checkbox" className="a-check" checked={allOnPage} onChange={toggleAll} aria-label="Select page" />
                    </th>
                  )}
                  {visCols.map((c) => (
                    <th
                      key={c.id}
                      style={{ width: c.width }}
                      className={c.hideBelow === "lg" ? "hidden lg:table-cell" : c.hideBelow === "md" ? "hidden md:table-cell" : ""}
                    >
                      <button
                        type="button"
                        onClick={() => headerSort(c)}
                        className={"inline-flex items-center gap-1 uppercase tracking-[0.06em] text-[11px] font-semibold" + (c.sortVal ? " cursor-pointer hover:text-[var(--a-text)]" : " cursor-default")}
                        style={{ color: sort?.id === c.id ? "var(--a-accent)" : undefined }}
                      >
                        {c.label}
                        {sort?.id === c.id && (sort.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                      </button>
                    </th>
                  ))}
                  {rowActions && <th style={{ width: 1 }} className="text-right" />}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr
                    key={r.__id}
                    data-selected={selected.has(r.__id)}
                    onClick={onRow ? () => onRow(r) : undefined}
                    className={onRow ? "cursor-pointer" : ""}
                  >
                    {bulkActions && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="a-check"
                          checked={selected.has(r.__id)}
                          aria-label="Select row"
                          onChange={() =>
                            setSelected((s) => {
                              const n = new Set(s);
                              if (n.has(r.__id)) n.delete(r.__id);
                              else n.add(r.__id);
                              return n;
                            })
                          }
                        />
                      </td>
                    )}
                    {visCols.map((c) => (
                      <td key={c.id} className={c.hideBelow === "lg" ? "hidden lg:table-cell" : c.hideBelow === "md" ? "hidden md:table-cell" : ""}>
                        {c.render(r)}
                      </td>
                    ))}
                    {rowActions && (
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">{rowActions(r)}</div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phone cards */}
          <div className="sm:hidden divide-y" style={{ borderColor: "var(--a-border)" }}>
            {pageRows.map((r) => (
              <div key={r.__id} className="flex items-center gap-3 px-4 py-3" onClick={onRow ? () => onRow(r) : undefined}>
                {bulkActions && (
                  <input
                    type="checkbox"
                    className="a-check shrink-0"
                    checked={selected.has(r.__id)}
                    aria-label="Select row"
                    onClick={(e) => e.stopPropagation()}
                    onChange={() =>
                      setSelected((s) => {
                        const n = new Set(s);
                        if (n.has(r.__id)) n.delete(r.__id);
                        else n.add(r.__id);
                        return n;
                      })
                    }
                  />
                )}
                <div className="flex-1 min-w-0">{mobileCard(r)}</div>
                {rowActions && (
                  // max-w caps the strip at two icon buttons per row, so
                  // action-heavy modules wrap into a 2×2 block instead of
                  // squeezing the card text off a narrow phone.
                  <div className="flex max-w-[80px] shrink-0 flex-wrap items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {rowActions(r)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5" style={{ borderTop: "1px solid var(--a-border)" }}>
            <span className="text-xs" style={{ color: "var(--a-text3)" }}>
              {filtered.length === rows.length
                ? `${rows.length} ${rows.length === 1 ? "item" : "items"}`
                : `${filtered.length} of ${rows.length}`}
            </span>
            {pages > 1 && (
              <div className="flex items-center gap-1.5">
                <IconBtn label="Previous page" icon={ChevronLeft} size="sm" variant="ghost" disabled={safePage === 0} onClick={() => setPage((p) => p - 1)} />
                <span className="text-xs tabular-nums" style={{ color: "var(--a-text2)" }}>
                  {safePage + 1} / {pages}
                </span>
                <IconBtn label="Next page" icon={ChevronRight} size="sm" variant="ghost" disabled={safePage >= pages - 1} onClick={() => setPage((p) => p + 1)} />
              </div>
            )}
          </div>
        </>
      )}

      {/* Bulk bar */}
      {bulkActions && selected.size > 0 && (
        <div
          className="a-pop sticky bottom-3 z-10 mx-3 mb-3 flex flex-wrap items-center gap-2 rounded-xl px-4 py-2.5"
          style={{ background: "var(--a-surface2)", border: "1px solid var(--a-border2)", boxShadow: "var(--a-shadow-lg)" }}
        >
          <span className="text-xs font-semibold">{selected.size} selected</span>
          <button className="text-xs underline" style={{ color: "var(--a-text3)" }} onClick={clearSel}>
            Clear
          </button>
          <div className="ml-auto flex items-center gap-2">{bulkActions(selectedRows, clearSel)}</div>
        </div>
      )}
    </div>
  );
}
