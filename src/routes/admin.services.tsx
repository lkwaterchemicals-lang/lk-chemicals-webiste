import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { moduleById, rowImage, timeAgo, toDate, type Row } from "@/admin/registry";
import { ModulePage } from "@/admin/module-page";
import { useCol } from "@/admin/api";
import { Badge, SelectWrap } from "@/admin/ui";
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
  const [cat, setCat] = useState("");
  const { data: cats = [] } = useCol("serviceCategories", "number");

  const catName = (slug: unknown): string =>
    String(cats.find((c) => c.slug === slug)?.name ?? (slug ? String(slug) : "—"));

  const cols: Col<Row>[] = [
    {
      id: "name",
      label: "Service",
      sortVal: (r) => String(r.name ?? ""),
      csv: (r) => String(r.name ?? ""),
      render: (r) => (
        <div className="flex items-center gap-3 min-w-0">
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
          <div className="min-w-0">
            <div className="text-[13px] font-semibold truncate max-w-[340px]">
              {String(r.name ?? "")}
            </div>
            <div className="text-[11px] truncate" style={{ color: "var(--a-text3)" }}>
              /{String(r.slug ?? r.__id)}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "serviceCategory",
      label: "Category",
      sortVal: (r) => String(catName(r.serviceCategory)),
      csv: (r) => String(catName(r.serviceCategory)),
      render: (r) => <Badge tone="neutral">{catName(r.serviceCategory)}</Badge>,
    },
    {
      id: "highlights",
      label: "Includes",
      hideBelow: "lg",
      sortVal: (r) => (Array.isArray(r.highlights) ? r.highlights.length : 0),
      csv: (r) => (Array.isArray(r.highlights) ? (r.highlights as string[]).join(" | ") : ""),
      render: (r) => (
        <span className="text-xs tabular-nums" style={{ color: "var(--a-text2)" }}>
          {Array.isArray(r.highlights) ? r.highlights.length : 0}
        </span>
      ),
    },
    {
      id: "updated",
      label: "Updated",
      hideBelow: "md",
      sortVal: (r) => toDate(r._updatedAt)?.getTime() ?? 0,
      csv: (r) => toDate(r._updatedAt)?.toISOString() ?? "",
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--a-text3)" }}>
          {timeAgo(toDate(r._updatedAt)) || "—"}
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
      searchText={(r) =>
        `${r.name ?? ""} ${r.slug ?? ""} ${catName(r.serviceCategory)} ${r.description ?? ""}`
      }
      filterRows={cat ? (rows) => rows.filter((r) => r.serviceCategory === cat) : undefined}
      extraToolbar={
        <div className="w-44 hidden md:block">
          <SelectWrap>
            <select
              className="a-select !py-2 !text-xs"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              aria-label="Filter by service category"
            >
              <option value="">All categories</option>
              {cats.map((c) => (
                <option key={c.__id} value={String(c.slug ?? c.__id)}>
                  {String(c.name ?? c.__id)}
                </option>
              ))}
            </select>
          </SelectWrap>
        </div>
      }
    />
  );
}
