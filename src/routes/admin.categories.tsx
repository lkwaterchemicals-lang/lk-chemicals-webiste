import { createFileRoute } from "@tanstack/react-router";
import { moduleById, rowImage, type Row } from "@/admin/registry";
import { ModulePage } from "@/admin/module-page";
import { useCol } from "@/admin/api";
import type { Col } from "@/admin/table";

type S = { q?: string; new?: string };

export const Route = createFileRoute("/admin/categories")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    new: s.new === "1" ? "1" : undefined,
  }),
  head: () => ({ meta: [{ title: "Categories — LK Admin" }] }),
  component: CategoriesAdmin,
});

const def = moduleById("categories");

function CategoriesAdmin() {
  const { q, new: isNew } = Route.useSearch();
  const { data: products = [] } = useCol("products");

  const cols: Col<Row>[] = [
    {
      id: "number",
      label: "#",
      width: "56px",
      sortVal: (r) => String(r.number ?? ""),
      csv: (r) => String(r.number ?? ""),
      render: (r) => (
        <span className="text-xs font-bold tabular-nums" style={{ color: "var(--a-accent)" }}>
          {String(r.number ?? "")}
        </span>
      ),
    },
    {
      id: "name",
      label: "Category",
      sortVal: (r) => String(r.name ?? ""),
      csv: (r) => String(r.name ?? ""),
      render: (r) => (
        <div className="flex items-center gap-3 min-w-0">
          {rowImage(def, r) && (
            <img
              src={rowImage(def, r)!}
              alt=""
              className="h-9 w-12 rounded-md object-cover shrink-0"
              loading="lazy"
            />
          )}
          <div className="min-w-0">
            <div className="text-[13px] font-semibold truncate">{String(r.name ?? "")}</div>
            <div className="text-[11px] truncate" style={{ color: "var(--a-text3)" }}>
              {String(r.tagline ?? "")}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "products",
      label: "Products",
      hideBelow: "md",
      sortVal: (r) => products.filter((p) => p.category === r.slug).length,
      csv: (r) => products.filter((p) => p.category === r.slug).length,
      render: (r) => {
        const n = products.filter((p) => p.category === r.slug).length;
        return (
          <span
            className="text-xs tabular-nums"
            style={{ color: n === 0 ? "var(--a-warn)" : "var(--a-text2)" }}
          >
            {n}
          </span>
        );
      },
    },
  ];

  return (
    <ModulePage
      def={def}
      cols={cols}
      urlQuery={q}
      urlNew={isNew === "1"}
      searchText={(r) =>
        `${r.name ?? ""} ${r.slug ?? ""} ${r.tagline ?? ""} ${r.description ?? ""}`
      }
    />
  );
}
