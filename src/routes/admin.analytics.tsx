// Insights — enquiry analytics over real Firestore data: volume by day /
// week / month, date-range filters (presets + custom from–to), source and
// product breakdowns, and a filterable history table.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarRange, Inbox, Package, TrendingUp } from "lucide-react";
import { useEnquiries } from "@/admin/api";
import { timeAgo, toDate, type Row } from "@/admin/registry";
import { DataTable, type Col } from "@/admin/table";
import { Badge, Card, PageHeader } from "@/admin/ui";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Insights — LK Admin" }] }),
  component: AnalyticsPage,
});

type Granularity = "day" | "week" | "month";

const PRESETS = [
  { id: "7", label: "7 days", days: 7 },
  { id: "30", label: "30 days", days: 30 },
  { id: "90", label: "90 days", days: 90 },
  { id: "365", label: "12 months", days: 365 },
] as const;

const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const monthKey = (d: Date) => d.toISOString().slice(0, 7);
/** Monday of the date's week — one bucket per calendar week. */
function weekKey(d: Date) {
  const copy = new Date(d);
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day);
  return dayKey(copy);
}

const statusOf = (r: Row) =>
  r.status === "contacted" || r.status === "closed" ? String(r.status) : "new";

function AnalyticsPage() {
  const { data: rows = [], isLoading, error } = useEnquiries();

  const [preset, setPreset] = useState<string>("30");
  const [from, setFrom] = useState(""); // custom range (yyyy-mm-dd)
  const [to, setTo] = useState("");
  const [granularity, setGranularity] = useState<Granularity>("day");

  // Oldest enquiry on record — the floor for an open-ended custom range.
  const earliest = useMemo(() => {
    let min: number | null = null;
    for (const r of rows) {
      const d = toDate(r.createdAt);
      if (d && (min === null || d.getTime() < min)) min = d.getTime();
    }
    return min;
  }, [rows]);

  // Resolved [start, end] of the active range.
  const range = useMemo((): [Date, Date] => {
    const end = new Date();
    if (preset === "custom" && (from || to)) {
      const s = from
        ? new Date(from + "T00:00:00")
        : new Date(earliest ?? Date.now() - 29 * 86400_000);
      const e = to ? new Date(to + "T23:59:59.999") : end;
      return [s, e];
    }
    const days = PRESETS.find((p) => p.id === preset)?.days ?? 30;
    return [new Date(Date.now() - (days - 1) * 86400_000), end];
  }, [preset, from, to, earliest]);

  const inRange = useMemo(
    () =>
      rows.filter((r) => {
        const d = toDate(r.createdAt);
        return d !== null && d >= range[0] && d <= range[1];
      }),
    [rows, range],
  );

  // Time buckets across the full range so quiet periods still chart as 0.
  const chart = useMemo(() => {
    const keyOf = granularity === "day" ? dayKey : granularity === "week" ? weekKey : monthKey;
    const buckets: { key: string; label: string; n: number }[] = [];
    const seen = new Map<string, number>();
    const cursor = new Date(range[0]);
    const end = range[1];
    let guard = 0;
    while (cursor <= end && guard++ < 800) {
      const key = keyOf(cursor);
      if (!seen.has(key)) {
        seen.set(key, buckets.length);
        buckets.push({
          key,
          label:
            granularity === "month"
              ? new Date(key + "-01").toLocaleDateString(undefined, {
                  month: "short",
                  year: "2-digit",
                })
              : new Date(key).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
          n: 0,
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    for (const r of inRange) {
      const d = toDate(r.createdAt);
      if (!d) continue;
      const i = seen.get(keyOf(d));
      if (i !== undefined) buckets[i].n++;
    }
    return buckets;
  }, [inRange, range, granularity]);

  const kpis = useMemo(() => {
    const byStatus = { new: 0, contacted: 0, closed: 0 };
    for (const r of inRange) byStatus[statusOf(r) as keyof typeof byStatus]++;
    const busiest = chart.reduce((best, b) => (b.n > best.n ? b : best), { label: "—", n: 0 });
    return { total: inRange.length, ...byStatus, busiest };
  }, [inRange, chart]);

  // Where leads come from + which products they mention — the closest real
  // signal to "product sales" this site produces.
  const topOf = (field: "source" | "product_ref") => {
    const counts = new Map<string, number>();
    for (const r of inRange) {
      const v = String(r[field] ?? "").trim();
      if (!v) continue;
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  };
  const topSources = useMemo(() => topOf("source"), [inRange]); // eslint-disable-line react-hooks/exhaustive-deps
  const topProducts = useMemo(() => topOf("product_ref"), [inRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const cols: Col<Row>[] = [
    {
      id: "who",
      label: "From",
      sortVal: (r) => String(r.name ?? ""),
      csv: (r) => String(r.name ?? ""),
      render: (r) => (
        <div className="min-w-0">
          <div className="text-[13px] font-semibold truncate">{String(r.name ?? "Unknown")}</div>
          <div className="text-[11px] truncate" style={{ color: "var(--a-text3)" }}>
            {String(r.phone ?? "")}
            {typeof r.email === "string" && r.email ? ` · ${r.email}` : ""}
          </div>
        </div>
      ),
    },
    {
      id: "requirement",
      label: "Requirement",
      hideBelow: "md",
      csv: (r) => String(r.requirement ?? ""),
      render: (r) => (
        <p className="max-w-[360px] truncate text-xs" style={{ color: "var(--a-text2)" }}>
          {String(r.requirement ?? "")}
        </p>
      ),
    },
    {
      id: "status",
      label: "Status",
      sortVal: (r) => statusOf(r),
      csv: (r) => statusOf(r),
      render: (r) => (
        <Badge
          tone={statusOf(r) === "new" ? "accent" : statusOf(r) === "contacted" ? "warn" : "ok"}
        >
          {statusOf(r)}
        </Badge>
      ),
    },
    {
      id: "when",
      label: "Received",
      sortVal: (r) => toDate(r.createdAt)?.getTime() ?? 0,
      csv: (r) => toDate(r.createdAt)?.toISOString() ?? "",
      render: (r) => (
        <span className="text-xs whitespace-nowrap" style={{ color: "var(--a-text3)" }}>
          {toDate(r.createdAt)?.toLocaleDateString() ?? "—"} · {timeAgo(toDate(r.createdAt))}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Insights"
        sub="Enquiry trends and history — filter by preset, month or any custom duration."
      />

      {/* Range + granularity controls */}
      <div className="a-card flex flex-wrap items-center gap-2 px-4 py-3">
        <div className="a-pills">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p.id)}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
              style={
                preset === p.id
                  ? { background: "var(--a-accent-soft)", color: "var(--a-accent)" }
                  : { color: "var(--a-text3)" }
              }
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPreset("custom")}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
            style={
              preset === "custom"
                ? { background: "var(--a-accent-soft)", color: "var(--a-accent)" }
                : { color: "var(--a-text3)" }
            }
          >
            <CalendarRange className="h-3.5 w-3.5" /> Custom
          </button>
        </div>
        {preset === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="a-input !w-auto !py-1.5 !text-xs"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="From date"
            />
            <span className="text-xs" style={{ color: "var(--a-text3)" }}>
              →
            </span>
            <input
              type="date"
              className="a-input !w-auto !py-1.5 !text-xs"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label="To date"
            />
          </div>
        )}
        <div className="ml-auto a-pills">
          {(["day", "week", "month"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGranularity(g)}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors"
              style={
                granularity === g
                  ? { background: "var(--a-accent-soft)", color: "var(--a-accent)" }
                  : { color: "var(--a-text3)" }
              }
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: "Enquiries", value: kpis.total },
          { label: "New", value: kpis.new },
          { label: "Contacted", value: kpis.contacted },
          { label: "Closed", value: kpis.closed },
          { label: `Busiest ${granularity}`, value: kpis.busiest.n ? kpis.busiest.label : "—" },
        ].map((s, i) => (
          <div
            key={s.label}
            className="a-card a-rise p-4"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div
              className="text-xl font-bold tabular-nums truncate"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {s.value}
            </div>
            <div className="mt-0.5 text-[11px]" style={{ color: "var(--a-text3)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Volume chart */}
      <Card
        title={`Enquiries per ${granularity}`}
        action={
          <Link
            to="/admin/enquiries"
            className="text-xs font-medium inline-flex items-center gap-1"
            style={{ color: "var(--a-accent)" }}
          >
            Open inbox <TrendingUp className="h-3 w-3" />
          </Link>
        }
      >
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ top: 6, left: -26, right: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="admInsight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--a-accent)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--a-accent)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--a-border)" strokeDasharray="3 5" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--a-text3)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--a-text3)" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ stroke: "var(--a-border2)" }}
                contentStyle={{
                  background: "var(--a-surface)",
                  border: "1px solid var(--a-border)",
                  borderRadius: 10,
                  fontSize: 12,
                  color: "var(--a-text)",
                  boxShadow: "var(--a-shadow)",
                }}
                formatter={(v: number) => [`${v} enquir${v === 1 ? "y" : "ies"}`, ""]}
                labelStyle={{ color: "var(--a-text3)" }}
              />
              <Area
                type="monotone"
                dataKey="n"
                stroke="var(--a-accent)"
                strokeWidth={2}
                fill="url(#admInsight)"
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Breakdowns */}
      <div className="grid gap-4 md:grid-cols-2">
        <BreakdownCard
          title="Where leads come from"
          icon={Inbox}
          items={topSources}
          total={kpis.total}
          empty="No enquiries in this range."
        />
        <BreakdownCard
          title="Product interest"
          icon={Package}
          items={topProducts}
          total={kpis.total}
          empty="No product-specific enquiries in this range yet."
        />
      </div>

      {/* History */}
      <Card title="History" pad={false}>
        <DataTable<Row>
          rows={inRange}
          cols={cols}
          loading={isLoading}
          error={error}
          searchText={(r) =>
            `${r.name ?? ""} ${r.company ?? ""} ${r.phone ?? ""} ${r.email ?? ""} ${r.requirement ?? ""} ${r.source ?? ""}`
          }
          searchPlaceholder="Search this range…  ( / )"
          csvName="enquiries-insights"
          emptyTitle="Nothing in this range"
          emptyBody="Widen the date range or pick a different preset."
          mobileCard={(r) => (
            <div className="min-w-0">
              <div className="text-[13px] font-semibold truncate">
                {String(r.name ?? "Unknown")}
              </div>
              <div className="text-[11px] truncate" style={{ color: "var(--a-text3)" }}>
                {toDate(r.createdAt)?.toLocaleDateString() ?? ""} · {String(r.requirement ?? "")}
              </div>
            </div>
          )}
        />
      </Card>
    </div>
  );
}

function BreakdownCard({
  title,
  icon: Icon,
  items,
  total,
  empty,
}: {
  title: string;
  icon: typeof Inbox;
  items: [string, number][];
  total: number;
  empty: string;
}) {
  return (
    <Card title={title}>
      {items.length === 0 ? (
        <p className="text-[13px]" style={{ color: "var(--a-text3)" }}>
          {empty}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {items.map(([label, n]) => (
            <li key={label} className="flex items-center gap-3">
              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--a-text3)" }} />
              <span className="min-w-0 flex-1 truncate text-[13px]">{label}</span>
              <div
                className="hidden sm:block h-1.5 w-28 overflow-hidden rounded-full"
                style={{ background: "var(--a-surface2)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round((n / Math.max(1, total)) * 100)}%`,
                    background: "var(--a-accent)",
                  }}
                />
              </div>
              <span className="w-8 text-right text-xs font-semibold tabular-nums">{n}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
