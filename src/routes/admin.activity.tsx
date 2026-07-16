// Activity — the audit trail. Every create, edit, delete, restore, seed and
// status change across the console, newest first.
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity as ActivityIcon,
  CheckCircle2,
  Copy,
  Database,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useActivity } from "@/admin/api";
import { timeAgo, toDate } from "@/admin/registry";
import { Card, Empty, FirestoreError, PageHeader, SelectWrap, SkeletonRows } from "@/admin/ui";

export const Route = createFileRoute("/admin/activity")({
  head: () => ({ meta: [{ title: "Activity — LK Admin" }] }),
  component: ActivityAdmin,
});

const ICONS: Record<string, { icon: LucideIcon; tone: string }> = {
  created: { icon: Plus, tone: "var(--a-ok)" },
  updated: { icon: Pencil, tone: "var(--a-accent)" },
  deleted: { icon: Trash2, tone: "var(--a-danger)" },
  restored: { icon: RotateCcw, tone: "var(--a-warn)" },
  duplicated: { icon: Copy, tone: "var(--a-accent)" },
  seeded: { icon: Database, tone: "var(--a-info)" },
  status: { icon: CheckCircle2, tone: "var(--a-ok)" },
};

function ActivityAdmin() {
  const { data: rows = [], isLoading, error } = useActivity(100);
  const [module, setModule] = useState("");

  const modules = useMemo(
    () => [...new Set(rows.map((r) => String(r.module ?? "")))].sort(),
    [rows],
  );
  const filtered = module ? rows.filter((r) => r.module === module) : rows;

  return (
    <div className="space-y-4 max-w-3xl">
      <PageHeader
        title="Activity"
        sub="A full audit trail of everything done in this console — who, what and when."
        actions={
          modules.length > 0 && (
            <div className="w-44">
              <SelectWrap>
                <select
                  className="a-select !py-2 !text-xs"
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                  aria-label="Filter by module"
                >
                  <option value="">All modules</option>
                  {modules.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </SelectWrap>
            </div>
          )
        }
      />

      {error != null ? (
        <FirestoreError error={error} />
      ) : isLoading ? (
        <Card pad={false}>
          <SkeletonRows n={8} h={34} />
        </Card>
      ) : filtered.length === 0 ? (
        <Card pad={false}>
          <Empty
            icon={ActivityIcon}
            title="No activity yet"
            body="Actions taken in this console — creates, edits, deletes, seeds — will be recorded here automatically."
          />
        </Card>
      ) : (
        <Card pad={false}>
          <ol className="relative px-5 py-4">
            {filtered.map((r, i) => {
              const meta = ICONS[String(r.action)] ?? {
                icon: ActivityIcon,
                tone: "var(--a-text3)",
              };
              const Icon = meta.icon;
              return (
                <li
                  key={r.__id}
                  className="a-rise relative flex gap-3 pb-5 last:pb-0"
                  style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                >
                  {i < filtered.length - 1 && (
                    <span
                      className="absolute left-[13px] top-8 bottom-0 w-px"
                      style={{ background: "var(--a-border)" }}
                      aria-hidden
                    />
                  )}
                  <span
                    className="relative z-[1] grid h-7 w-7 shrink-0 place-items-center rounded-full"
                    style={{
                      background: "var(--a-surface2)",
                      color: meta.tone,
                      border: "1px solid var(--a-border)",
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-[13px] leading-snug" style={{ color: "var(--a-text2)" }}>
                      <span className="font-semibold" style={{ color: "var(--a-text)" }}>
                        {String(r.user ?? "")}
                      </span>{" "}
                      {String(r.action)} in{" "}
                      <span className="font-medium">{String(r.module ?? "")}</span>
                    </p>
                    <p className="mt-0.5 break-words text-xs" style={{ color: "var(--a-text3)" }}>
                      {String(r.label ?? "")}
                    </p>
                  </div>
                  <span
                    className="shrink-0 pt-0.5 text-[11px] whitespace-nowrap"
                    style={{ color: "var(--a-text3)" }}
                  >
                    {timeAgo(toDate(r.at))}
                  </span>
                </li>
              );
            })}
          </ol>
        </Card>
      )}
    </div>
  );
}
