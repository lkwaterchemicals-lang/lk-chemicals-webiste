import { createFileRoute } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { moduleById, type Row } from "@/admin/registry";
import { ModulePage } from "@/admin/module-page";
import { Badge } from "@/admin/ui";
import type { Col } from "@/admin/table";

type S = { q?: string; new?: string };

export const Route = createFileRoute("/admin/team")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    new: s.new === "1" ? "1" : undefined,
  }),
  head: () => ({ meta: [{ title: "Team — LK Admin" }] }),
  component: TeamAdmin,
});

const def = moduleById("team");

function TeamAdmin() {
  const { q, new: isNew } = Route.useSearch();

  const cols: Col<Row>[] = [
    {
      id: "name",
      label: "Member",
      sortVal: (r) => String(r.name ?? ""),
      csv: (r) => String(r.name ?? ""),
      render: (r) => (
        <div className="flex items-center gap-3 min-w-0">
          {typeof r.image === "string" && r.image ? (
            <img
              src={r.image}
              alt=""
              loading="lazy"
              className="h-9 w-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold"
              style={{ background: "var(--a-accent-soft)", color: "var(--a-accent)" }}
            >
              {String(r.name ?? "?")
                .trim()
                .charAt(0)
                .toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <div className="text-[13px] font-semibold truncate">{String(r.name ?? "")}</div>
            <div className="text-[11px] truncate" style={{ color: "var(--a-text3)" }}>
              {String(r.role ?? "")}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "founder",
      label: "Spotlight",
      hideBelow: "md",
      sortVal: (r) => (r.founder ? 0 : 1),
      csv: (r) => (r.founder ? "founder" : ""),
      render: (r) =>
        r.founder ? (
          <Badge tone="accent">
            <Crown className="h-3 w-3" /> Founder
          </Badge>
        ) : (
          <span style={{ color: "var(--a-text3)" }}>—</span>
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
      searchText={(r) => `${r.name ?? ""} ${r.role ?? ""} ${r.bio ?? ""}`}
    />
  );
}
