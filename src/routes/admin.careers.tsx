import { createFileRoute } from "@tanstack/react-router";
import { moduleById, type Row } from "@/admin/registry";
import { ModulePage } from "@/admin/module-page";
import { Badge } from "@/admin/ui";
import type { Col } from "@/admin/table";

type S = { q?: string; new?: string };

export const Route = createFileRoute("/admin/careers")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    new: s.new === "1" ? "1" : undefined,
  }),
  head: () => ({ meta: [{ title: "Careers — LK Admin" }] }),
  component: CareersAdmin,
});

const def = moduleById("careers");

function CareersAdmin() {
  const { q, new: isNew } = Route.useSearch();

  const cols: Col<Row>[] = [
    {
      id: "title",
      label: "Role",
      sortVal: (r) => String(r.title ?? ""),
      csv: (r) => String(r.title ?? ""),
      render: (r) => (
        <div className="min-w-0">
          <div className="text-[13px] font-semibold truncate">{String(r.title ?? "")}</div>
          <div className="text-[11px] truncate" style={{ color: "var(--a-text3)" }}>
            {[r.department, r.location].filter(Boolean).join(" · ")}
          </div>
        </div>
      ),
    },
    {
      id: "type",
      label: "Type",
      hideBelow: "md",
      sortVal: (r) => String(r.type ?? ""),
      csv: (r) => String(r.type ?? ""),
      render: (r) =>
        r.type ? (
          <Badge tone="accent">{String(r.type)}</Badge>
        ) : (
          <span style={{ color: "var(--a-text3)" }}>—</span>
        ),
    },
    {
      id: "experience",
      label: "Experience",
      hideBelow: "lg",
      csv: (r) => String(r.experience ?? ""),
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--a-text2)" }}>
          {String(r.experience ?? "—")}
        </span>
      ),
    },
    {
      id: "status",
      label: "Status",
      sortVal: (r) => String(r.status ?? "published"),
      csv: (r) => String(r.status ?? "published"),
      render: (r) => {
        const s = String(r.status ?? "published");
        return (
          <Badge tone={s === "published" ? "ok" : s === "draft" ? "warn" : "neutral"}>{s}</Badge>
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
        `${r.title ?? ""} ${r.department ?? ""} ${r.location ?? ""} ${r.type ?? ""} ${r.summary ?? ""}`
      }
    />
  );
}
