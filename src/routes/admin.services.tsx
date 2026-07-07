import { createFileRoute } from "@tanstack/react-router";
import { moduleById, rowImage, type Row } from "@/admin/registry";
import { ModulePage } from "@/admin/module-page";
import type { Col } from "@/admin/table";

type S = { q?: string; new?: string };

export const Route = createFileRoute("/admin/services")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    new: s.new === "1" ? "1" : undefined,
  }),
  head: () => ({ meta: [{ title: "Services — LK Admin" }] }),
  component: ServicesAdmin,
});

const def = moduleById("services");

function ServicesAdmin() {
  const { q, new: isNew } = Route.useSearch();

  const cols: Col<Row>[] = [
    {
      id: "n",
      label: "#",
      width: "56px",
      sortVal: (r) => String(r.n ?? ""),
      csv: (r) => String(r.n ?? ""),
      render: (r) => <span className="text-xs font-bold tabular-nums" style={{ color: "var(--a-accent)" }}>{String(r.n ?? "")}</span>,
    },
    {
      id: "t",
      label: "Service",
      sortVal: (r) => String(r.t ?? ""),
      csv: (r) => String(r.t ?? ""),
      render: (r) => (
        <div className="flex items-center gap-3 min-w-0">
          {rowImage(def, r) && <img src={rowImage(def, r)!} alt="" className="h-9 w-12 rounded-md object-cover shrink-0" loading="lazy" />}
          <div className="min-w-0">
            <div className="text-[13px] font-semibold truncate">{String(r.t ?? "")}</div>
            <div className="text-[11px] truncate max-w-[380px]" style={{ color: "var(--a-text3)" }}>{String(r.body ?? "")}</div>
          </div>
        </div>
      ),
    },
    {
      id: "inc",
      label: "Includes",
      hideBelow: "md",
      sortVal: (r) => (Array.isArray(r.inc) ? r.inc.length : 0),
      csv: (r) => (Array.isArray(r.inc) ? (r.inc as string[]).join(" | ") : ""),
      render: (r) => (
        <span className="text-xs tabular-nums" style={{ color: "var(--a-text2)" }}>
          {Array.isArray(r.inc) ? r.inc.length : 0} items
        </span>
      ),
    },
  ];

  return (
    <ModulePage
      def={def}
      cols={cols}
      urlQuery={q}
      urlNew={isNew === "1"}
      searchText={(r) => `${r.t ?? ""} ${r.body ?? ""} ${Array.isArray(r.inc) ? (r.inc as string[]).join(" ") : ""}`}
    />
  );
}
