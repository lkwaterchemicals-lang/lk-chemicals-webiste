// Admin home — the command center. Live counts, lead flow, activity and
// content-health intelligence, all from real Firestore data.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity as ActivityIcon,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  Inbox,
  LayoutGrid,
  Package,
  Plus,
  Quote,
  Settings,
  Wrench,
} from "lucide-react";
import { useActivity, useCol, useEnquiries } from "@/admin/api";
import { timeAgo, toDate, type Row } from "@/admin/registry";
import { Badge, Btn, Card, SkeletonRows } from "@/admin/ui";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — LK Admin" }] }),
  component: DashboardPage,
});

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function DashboardPage() {
  const navigate = useNavigate();
  const products = useCol("products");
  const categories = useCol("categories");
  const services = useCol("services");
  const gallery = useCol("gallery");
  const testimonials = useCol("testimonials");
  const enquiries = useEnquiries();

  const enqRows = enquiries.data ?? [];
  const weekAgo = Date.now() - 7 * 86400_000;
  const newThisWeek = enqRows.filter((e) => (toDate(e.createdAt)?.getTime() ?? 0) > weekAgo).length;
  const awaiting = enqRows.filter((e) => !e.status || e.status === "new").length;

  // Lead flow — enquiries per day over the last 30 days.
  const chart = useMemo(() => {
    const days: { d: string; label: string; n: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const dt = new Date(Date.now() - i * 86400_000);
      days.push({
        d: dt.toISOString().slice(0, 10),
        label: dt.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        n: 0,
      });
    }
    const idx = new Map(days.map((x, i) => [x.d, i]));
    for (const e of enqRows) {
      const dt = toDate(e.createdAt);
      if (!dt) continue;
      const key = dt.toISOString().slice(0, 10);
      const i = idx.get(key);
      if (i !== undefined) days[i].n++;
    }
    return days;
  }, [enqRows]);

  const activity = useActivity(8);

  // Content health — real checks against real data.
  const health = useMemo(() => {
    const out: { ok: boolean; label: string; to: string }[] = [];
    const prods = (products.data ?? []) as Row[];
    const cats = (categories.data ?? []) as Row[];
    if (prods.length > 0) {
      const noImage = prods.filter((p) => !p.image).length;
      out.push({
        ok: noImage === 0,
        label:
          noImage === 0
            ? "Every product has content"
            : `${noImage} products use the category image`,
        to: "/admin/products",
      });
      const noDesc = prods.filter((p) => !String(p.description ?? "").trim()).length;
      if (noDesc > 0)
        out.push({
          ok: false,
          label: `${noDesc} products missing a description`,
          to: "/admin/products",
        });
    }
    if (cats.length > 0 && prods.length > 0) {
      const emptyCats = cats.filter((c) => !prods.some((p) => p.category === c.slug)).length;
      out.push({
        ok: emptyCats === 0,
        label: emptyCats === 0 ? "No empty categories" : `${emptyCats} categories have no products`,
        to: "/admin/categories",
      });
    }
    out.push({
      ok: awaiting === 0,
      label: awaiting === 0 ? "Every enquiry handled" : `${awaiting} enquiries awaiting a reply`,
      to: "/admin/enquiries",
    });
    if (prods.length === 0 && !products.isLoading) {
      out.push({
        ok: false,
        label: "No products yet — add your first product",
        to: "/admin/products",
      });
    }
    return out;
  }, [products.data, products.isLoading, categories.data, awaiting]);

  const stats = [
    { label: "Products", value: products.data?.length, icon: Package, to: "/admin/products" },
    {
      label: "Categories",
      value: categories.data?.length,
      icon: LayoutGrid,
      to: "/admin/categories",
    },
    { label: "Services", value: services.data?.length, icon: Wrench, to: "/admin/services" },
    { label: "Media items", value: gallery.data?.length, icon: ImageIcon, to: "/admin/gallery" },
    {
      label: "Testimonials",
      value: testimonials.data?.length,
      icon: Quote,
      to: "/admin/testimonials",
    },
    {
      label: "Enquiries",
      value: enqRows.length,
      icon: Inbox,
      to: "/admin/enquiries",
      delta: newThisWeek ? `+${newThisWeek} this week` : undefined,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-3 a-rise">
        <div>
          <h1 className="text-xl sm:text-2xl">{greeting()}.</h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--a-text2)" }}>
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {awaiting > 0 && (
              <>
                {" · "}
                <Link
                  to="/admin/enquiries"
                  className="font-medium underline-offset-2 hover:underline"
                  style={{ color: "var(--a-accent)" }}
                >
                  {awaiting} enquir{awaiting === 1 ? "y" : "ies"} awaiting reply
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Btn icon={ExternalLink} onClick={() => window.open("/", "_blank")}>
            View site
          </Btn>
          <Btn
            variant="primary"
            icon={Plus}
            onClick={() => navigate({ to: "/admin/products", search: { new: "1" } as never })}
          >
            New product
          </Btn>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s, i) => (
          <Link
            key={s.label}
            to={s.to}
            className="a-card a-card-hover a-rise group p-4"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-center justify-between">
              <span
                className="grid h-8 w-8 place-items-center rounded-lg"
                style={{ background: "var(--a-accent-soft)", color: "var(--a-accent)" }}
              >
                <s.icon className="h-4 w-4" />
              </span>
              <ArrowUpRight
                className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                style={{ color: "var(--a-text3)" }}
              />
            </div>
            <div
              className="mt-3 text-2xl font-bold tabular-nums"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {s.value ?? <span className="a-skel inline-block h-6 w-8 align-middle" />}
            </div>
            <div
              className="mt-0.5 flex items-center gap-2 text-[11px]"
              style={{ color: "var(--a-text3)" }}
            >
              {s.label}
              {s.delta && (
                <Badge tone="ok" className="!text-[10px]">
                  {s.delta}
                </Badge>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Chart + health */}
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card
          title="Lead flow — last 30 days"
          action={
            <Link
              to="/admin/enquiries"
              className="text-xs font-medium inline-flex items-center gap-1"
              style={{ color: "var(--a-accent)" }}
            >
              Open inbox <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 6, left: -26, right: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="admLead" x1="0" y1="0" x2="0" y2="1">
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
                  interval={6}
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
                  fill="url(#admLead)"
                  animationDuration={700}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Content health">
          <ul className="space-y-2.5">
            {health.map((h) => (
              <li key={h.label}>
                <Link
                  to={h.to}
                  className="flex items-start gap-2.5 rounded-lg p-1.5 -m-1.5 hover:bg-[var(--a-hover)] transition-colors"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: h.ok ? "var(--a-ok)" : "var(--a-warn)" }}
                  />
                  <span className="text-[13px]" style={{ color: "var(--a-text2)" }}>
                    {h.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <hr className="a-divider my-4" />
          <div className="grid grid-cols-2 gap-2">
            <Btn
              size="sm"
              icon={Plus}
              onClick={() => navigate({ to: "/admin/services", search: { new: "1" } as never })}
            >
              New service
            </Btn>
            <Btn size="sm" icon={ImageIcon} onClick={() => navigate({ to: "/admin/gallery" })}>
              Upload media
            </Btn>
            <Btn size="sm" icon={Settings} onClick={() => navigate({ to: "/admin/settings" })}>
              Site settings
            </Btn>
            <Btn
              size="sm"
              icon={Quote}
              onClick={() => navigate({ to: "/admin/testimonials", search: { new: "1" } as never })}
            >
              New quote
            </Btn>
          </div>
        </Card>
      </div>

      {/* Recent enquiries + activity */}
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card
          title="Recent enquiries"
          pad={false}
          action={
            <Link
              to="/admin/enquiries"
              className="text-xs font-medium inline-flex items-center gap-1"
              style={{ color: "var(--a-accent)" }}
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          {enquiries.isLoading ? (
            <SkeletonRows n={4} />
          ) : enqRows.length === 0 ? (
            <p className="px-5 pb-5 pt-2 text-[13px]" style={{ color: "var(--a-text3)" }}>
              No enquiries yet — they'll appear here the moment a visitor submits a form.
            </p>
          ) : (
            <ul className="divide-y px-5 pb-2" style={{ borderColor: "var(--a-border)" }}>
              {enqRows.slice(0, 5).map((e) => (
                <li key={e.__id}>
                  <Link to="/admin/enquiries" className="flex items-center gap-3 py-3 group">
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold"
                      style={{ background: "var(--a-accent-soft)", color: "var(--a-accent)" }}
                    >
                      {String(e.name ?? "?")
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">
                        {String(e.name ?? "Unknown")}
                      </span>
                      <span
                        className="block truncate text-[11px]"
                        style={{ color: "var(--a-text3)" }}
                      >
                        {String(e.requirement ?? "")}
                      </span>
                    </span>
                    <Badge
                      tone={
                        !e.status || e.status === "new"
                          ? "accent"
                          : e.status === "contacted"
                            ? "warn"
                            : "ok"
                      }
                    >
                      {String(e.status ?? "new")}
                    </Badge>
                    <span
                      className="hidden sm:block w-16 text-right text-[11px] shrink-0"
                      style={{ color: "var(--a-text3)" }}
                    >
                      {timeAgo(toDate(e.createdAt))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Recent activity"
          pad={false}
          action={
            <Link
              to="/admin/activity"
              className="text-xs font-medium inline-flex items-center gap-1"
              style={{ color: "var(--a-accent)" }}
            >
              Full log <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          {activity.isLoading ? (
            <SkeletonRows n={4} h={30} />
          ) : (activity.data ?? []).length === 0 ? (
            <p className="px-5 pb-5 pt-2 text-[13px]" style={{ color: "var(--a-text3)" }}>
              Every create, edit and delete is recorded here.
            </p>
          ) : (
            <ul className="px-5 pb-4 pt-1 space-y-3">
              {(activity.data ?? []).map((a) => (
                <li key={a.__id} className="flex items-start gap-2.5">
                  <ActivityIcon
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    style={{ color: "var(--a-text3)" }}
                  />
                  <p
                    className="min-w-0 flex-1 text-[12px] leading-snug"
                    style={{ color: "var(--a-text2)" }}
                  >
                    <span className="font-semibold" style={{ color: "var(--a-text)" }}>
                      {String(a.action)}
                    </span>{" "}
                    <span style={{ color: "var(--a-text3)" }}>in {String(a.module)}</span> —{" "}
                    <span className="break-words">{String(a.label)}</span>
                    <span className="ml-1 whitespace-nowrap" style={{ color: "var(--a-text3)" }}>
                      · {timeAgo(toDate(a.at))}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
