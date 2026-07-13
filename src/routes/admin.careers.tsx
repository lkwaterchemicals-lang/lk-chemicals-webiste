// Careers admin — two tabs: the Openings module (publish/edit roles) and the
// Applications inbox (candidates from the public apply form: status pipeline,
// resume link, one-tap call / WhatsApp / email, CSV, delete with undo).
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  CheckCircle2,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  deleteApplications,
  setApplicationStatus,
  useApplications,
  useInvalidate,
  type ApplicationStatus,
} from "@/admin/api";
import { moduleById, timeAgo, toDate, type Row } from "@/admin/registry";
import { ModulePage } from "@/admin/module-page";
import { DataTable, type Col } from "@/admin/table";
import { Badge, Btn, Confirm, Drawer, IconBtn, PageHeader } from "@/admin/ui";

type S = { q?: string; new?: string; tab?: string };

export const Route = createFileRoute("/admin/careers")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    new: s.new === "1" ? "1" : undefined,
    tab: s.tab === "applications" ? "applications" : undefined,
  }),
  head: () => ({ meta: [{ title: "Careers — LK Admin" }] }),
  component: CareersAdmin,
});

const def = moduleById("careers");

function CareersAdmin() {
  const { q, new: isNew, tab: urlTab } = Route.useSearch();
  const applications = useApplications();
  const appRows = applications.data ?? [];
  const newApps = appRows.filter((a) => !a.status || a.status === "new").length;
  // A palette/record search lands on the applications tab automatically when
  // the query matches an applicant rather than an opening.
  const [tab, setTab] = useState<"openings" | "applications">(
    urlTab === "applications" ||
      (Boolean(q) &&
        appRows.some((a) =>
          String(a.name ?? "")
            .toLowerCase()
            .includes(q!.toLowerCase()),
        ))
      ? "applications"
      : "openings",
  );

  return (
    <div className="space-y-4">
      <div className="a-pills a-card !gap-0 p-1 w-fit max-w-full">
        {(
          [
            ["openings", "Openings"],
            ["applications", "Applications"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className="shrink-0 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
            style={
              tab === id
                ? { background: "var(--a-accent-soft)", color: "var(--a-accent)" }
                : { color: "var(--a-text3)" }
            }
          >
            {label}
            {id === "applications" && newApps > 0 && (
              <span className="a-badge a-badge-accent !px-1.5">{newApps}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "openings" ? <OpeningsTab q={q} isNew={isNew === "1"} /> : <ApplicationsTab q={q} />}
    </div>
  );
}

/* ---------------------------------------------------------------- openings */

function OpeningsTab({ q, isNew }: { q?: string; isNew: boolean }) {
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
      urlNew={isNew}
      searchText={(r) =>
        `${r.title ?? ""} ${r.department ?? ""} ${r.location ?? ""} ${r.type ?? ""} ${r.summary ?? ""}`
      }
    />
  );
}

/* ------------------------------------------------------------ applications */

const APP_STATUSES: { id: ApplicationStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "hired", label: "Hired" },
  { id: "rejected", label: "Rejected" },
];

const appStatusOf = (r: Row): ApplicationStatus =>
  r.status === "shortlisted" || r.status === "hired" || r.status === "rejected" ? r.status : "new";

const appTone = (s: ApplicationStatus): "accent" | "warn" | "ok" | "neutral" =>
  s === "new" ? "accent" : s === "shortlisted" ? "warn" : s === "hired" ? "ok" : "neutral";

function ApplicationsTab({ q }: { q?: string }) {
  const { data: rows = [], isLoading, error } = useApplications();
  const invalidate = useInvalidate();
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  const [open, setOpen] = useState<Row | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Row[] | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => appStatusOf(r) === filter)),
    [rows, filter],
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: rows.length,
      new: 0,
      shortlisted: 0,
      hired: 0,
      rejected: 0,
    };
    rows.forEach((r) => c[appStatusOf(r)]++);
    return c;
  }, [rows]);

  const setStatus = async (row: Row, status: ApplicationStatus) => {
    await setApplicationStatus(row.__id, status, String(row.name ?? row.__id));
    invalidate("applications");
    setOpen((o) => (o && o.__id === row.__id ? { ...o, status } : o));
    toast.success(`Marked as ${status}`);
  };

  const doDelete = async (targets: Row[]) => {
    const undo = await deleteApplications(targets);
    invalidate("applications");
    setOpen(null);
    toast(`Deleted ${targets.length === 1 ? "application" : `${targets.length} applications`}`, {
      action: {
        label: "Undo",
        onClick: async () => {
          await undo();
          invalidate("applications");
          toast.success("Restored");
        },
      },
    });
  };

  const cols: Col<Row>[] = [
    {
      id: "who",
      label: "Applicant",
      sortVal: (r) => String(r.name ?? ""),
      csv: (r) => String(r.name ?? ""),
      render: (r) => (
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold"
            style={{ background: "var(--a-accent-soft)", color: "var(--a-accent)" }}
          >
            {String(r.name ?? "?")
              .trim()
              .charAt(0)
              .toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold truncate">{String(r.name ?? "Unknown")}</div>
            <div className="text-[11px] truncate" style={{ color: "var(--a-text3)" }}>
              {String(r.phone ?? "")}
              {typeof r.email === "string" && r.email ? ` · ${r.email}` : ""}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      label: "Applied for",
      hideBelow: "md",
      sortVal: (r) => String(r.jobTitle ?? ""),
      csv: (r) => String(r.jobTitle ?? ""),
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--a-text2)" }}>
          {String(r.jobTitle ?? "—")}
        </span>
      ),
    },
    {
      id: "resume",
      label: "Resume",
      hideBelow: "lg",
      csv: (r) => String(r.resumeUrl ?? ""),
      render: (r) =>
        typeof r.resumeUrl === "string" && r.resumeUrl ? (
          <a
            href={r.resumeUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs underline underline-offset-2"
            style={{ color: "var(--a-accent)" }}
          >
            <FileText className="h-3.5 w-3.5" /> View
          </a>
        ) : (
          <span className="text-xs" style={{ color: "var(--a-text3)" }}>
            —
          </span>
        ),
    },
    {
      id: "status",
      label: "Status",
      sortVal: (r) => appStatusOf(r),
      csv: (r) => appStatusOf(r),
      render: (r) => <Badge tone={appTone(appStatusOf(r))}>{appStatusOf(r)}</Badge>,
    },
    {
      id: "when",
      label: "Received",
      sortVal: (r) => toDate(r.createdAt)?.getTime() ?? 0,
      csv: (r) => toDate(r.createdAt)?.toISOString() ?? "",
      render: (r) => (
        <span className="text-xs whitespace-nowrap" style={{ color: "var(--a-text3)" }}>
          {timeAgo(toDate(r.createdAt))}
        </span>
      ),
    },
  ];

  const openRow = open ? (rows.find((r) => r.__id === open.__id) ?? open) : null;
  const phoneDigits = openRow ? String(openRow.phone ?? "").replace(/\D/g, "") : "";

  return (
    <div className="space-y-4">
      <PageHeader
        title="Applications"
        sub="Candidates from the public careers form, newest first."
        actions={
          <div className="a-pills a-card p-1">
            {(["all", ...APP_STATUSES.map((s) => s.id)] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id as ApplicationStatus | "all")}
                className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors"
                style={
                  filter === id
                    ? { background: "var(--a-accent-soft)", color: "var(--a-accent)" }
                    : { color: "var(--a-text3)" }
                }
              >
                {id} <span className="tabular-nums opacity-70">{counts[id]}</span>
              </button>
            ))}
          </div>
        }
      />

      <DataTable<Row>
        rows={filtered}
        cols={cols}
        loading={isLoading}
        error={error}
        initialSearch={q ?? ""}
        searchText={(r) =>
          `${r.name ?? ""} ${r.phone ?? ""} ${r.email ?? ""} ${r.jobTitle ?? ""} ${r.currentRole ?? ""} ${r.message ?? ""}`
        }
        searchPlaceholder="Search applications…  ( / )"
        csvName="applications"
        onRow={(r) => setOpen(r)}
        emptyTitle="No applications yet"
        emptyBody="When someone applies through the careers page, they land here instantly."
        rowActions={(r) => (
          <>
            {appStatusOf(r) === "new" && (
              <IconBtn
                label="Shortlist"
                icon={CheckCircle2}
                size="sm"
                onClick={() => void setStatus(r, "shortlisted")}
              />
            )}
            <IconBtn label="Delete" icon={Trash2} size="sm" onClick={() => setConfirmDelete([r])} />
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
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold truncate">
                {String(r.name ?? "Unknown")}
              </span>
              <Badge tone={appTone(appStatusOf(r))} className="shrink-0">
                {appStatusOf(r)}
              </Badge>
            </div>
            <div className="text-[11px] truncate" style={{ color: "var(--a-text3)" }}>
              {String(r.jobTitle ?? "")}
            </div>
          </div>
        )}
      />

      {/* Candidate drawer */}
      <Drawer
        open={openRow !== null}
        onClose={() => setOpen(null)}
        title={openRow ? String(openRow.name ?? "Application") : ""}
        sub={
          openRow
            ? `${String(openRow.jobTitle ?? "")} · ${timeAgo(toDate(openRow.createdAt))}`
            : undefined
        }
        footer={
          openRow && (
            <>
              <Btn variant="danger" icon={Trash2} onClick={() => setConfirmDelete([openRow])}>
                Delete
              </Btn>
              <div className="ml-auto flex flex-wrap gap-2">
                {APP_STATUSES.map((s) => (
                  <Btn
                    key={s.id}
                    size="sm"
                    variant={appStatusOf(openRow) === s.id ? "primary" : "ghost"}
                    icon={s.id === "rejected" ? XCircle : undefined}
                    onClick={() => void setStatus(openRow, s.id)}
                  >
                    {s.label}
                  </Btn>
                ))}
              </div>
            </>
          )
        }
      >
        {openRow && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {String(openRow.phone ?? "") && (
                <a
                  href={`tel:${String(openRow.phone)}`}
                  className="a-btn a-btn-ghost justify-start"
                >
                  <Phone className="h-3.5 w-3.5" /> {String(openRow.phone)}
                </a>
              )}
              {phoneDigits && (
                <a
                  href={`https://wa.me/${phoneDigits.length === 10 ? "91" + phoneDigits : phoneDigits}`}
                  target="_blank"
                  rel="noreferrer"
                  className="a-btn a-btn-ghost justify-start"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              )}
              {typeof openRow.email === "string" && openRow.email && (
                <a
                  href={`mailto:${openRow.email}`}
                  className="a-btn a-btn-ghost justify-start truncate"
                >
                  <Mail className="h-3.5 w-3.5" /> Email
                </a>
              )}
            </div>

            {typeof openRow.resumeUrl === "string" && openRow.resumeUrl && (
              <a
                href={openRow.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="a-card flex items-center gap-3 p-4 hover:bg-[var(--a-hover)] transition-colors"
              >
                <FileText className="h-5 w-5 shrink-0" style={{ color: "var(--a-accent)" }} />
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold truncate">
                    {String(openRow.resumeName ?? "Resume")}
                  </span>
                  <span className="block text-[11px]" style={{ color: "var(--a-text3)" }}>
                    Open in a new tab
                  </span>
                </span>
              </a>
            )}

            {typeof openRow.message === "string" && openRow.message && (
              <div>
                <div className="text-xs font-semibold mb-1.5" style={{ color: "var(--a-text3)" }}>
                  MESSAGE
                </div>
                <div
                  className="a-card p-4 text-[13px] whitespace-pre-wrap leading-relaxed"
                  style={{ color: "var(--a-text2)", background: "var(--a-surface2)" }}
                >
                  {String(openRow.message)}
                </div>
              </div>
            )}

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
              {[
                ["Applied for", String(openRow.jobTitle ?? "—")],
                ["Current role", String(openRow.currentRole ?? "") || "—"],
                ["Email", String(openRow.email ?? "") || "—"],
                ["Phone", String(openRow.phone ?? "") || "—"],
                ["Received", toDate(openRow.createdAt)?.toLocaleString() ?? "—"],
                ["Status", appStatusOf(openRow)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] font-semibold" style={{ color: "var(--a-text3)" }}>
                    {k}
                  </dt>
                  <dd className="mt-0.5 break-words" style={{ color: "var(--a-text2)" }}>
                    {v}
                  </dd>
                </div>
              ))}
            </dl>

            <p
              className="flex items-center gap-1.5 text-[11px]"
              style={{ color: "var(--a-text3)" }}
            >
              <Briefcase className="h-3 w-3" /> Good candidates go fast — shortlist and call the
              same day.
            </p>
          </div>
        )}
      </Drawer>

      <Confirm
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (confirmDelete) await doDelete(confirmDelete);
        }}
        title={
          confirmDelete && confirmDelete.length > 1
            ? `Delete ${confirmDelete.length} applications?`
            : "Delete this application?"
        }
        body="You can undo from the toast for a few seconds after deleting."
      />
    </div>
  );
}
