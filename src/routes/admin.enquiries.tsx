// Enquiries — the leads inbox. Status pipeline (new → contacted → closed),
// one-tap call / WhatsApp / email, CSV export, delete with undo.
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Inbox, Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import {
  deleteEnquiries,
  setEnquiryStatus,
  useEnquiries,
  useInvalidate,
  type EnquiryStatus,
} from "@/admin/api";
import { timeAgo, toDate, type Row } from "@/admin/registry";
import { DataTable, type Col } from "@/admin/table";
import { Badge, Btn, Confirm, Drawer, IconBtn, PageHeader } from "@/admin/ui";

type S = { q?: string };

export const Route = createFileRoute("/admin/enquiries")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
  }),
  head: () => ({ meta: [{ title: "Enquiries — LK Admin" }] }),
  component: EnquiriesAdmin,
});

const STATUSES: { id: EnquiryStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "closed", label: "Closed" },
];

const statusOf = (r: Row): EnquiryStatus =>
  r.status === "contacted" || r.status === "closed" ? r.status : "new";

const statusTone = (s: EnquiryStatus): "accent" | "warn" | "ok" =>
  s === "new" ? "accent" : s === "contacted" ? "warn" : "ok";

function EnquiriesAdmin() {
  const { q } = Route.useSearch();
  const { data: rows = [], isLoading, error } = useEnquiries();
  const invalidate = useInvalidate();
  const [tab, setTab] = useState<EnquiryStatus | "all">("all");
  const [open, setOpen] = useState<Row | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Row[] | null>(null);

  const filtered = useMemo(
    () => (tab === "all" ? rows : rows.filter((r) => statusOf(r) === tab)),
    [rows, tab],
  );
  const counts = useMemo(() => {
    const c = { all: rows.length, new: 0, contacted: 0, closed: 0 };
    rows.forEach((r) => c[statusOf(r)]++);
    return c;
  }, [rows]);

  const setStatus = async (row: Row, status: EnquiryStatus) => {
    await setEnquiryStatus(row.__id, status, String(row.name ?? row.__id));
    invalidate("enquiries");
    setOpen((o) => (o && o.__id === row.__id ? { ...o, status } : o));
    toast.success(`Marked as ${status}`);
  };

  const doDelete = async (targets: Row[]) => {
    const undo = await deleteEnquiries(targets);
    invalidate("enquiries");
    setOpen(null);
    toast(`Deleted ${targets.length === 1 ? "enquiry" : `${targets.length} enquiries`}`, {
      action: {
        label: "Undo",
        onClick: async () => {
          await undo();
          invalidate("enquiries");
          toast.success("Restored");
        },
      },
    });
  };

  const cols: Col<Row>[] = [
    {
      id: "who",
      label: "From",
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
            <div className="text-[13px] font-semibold truncate">
              {String(r.name ?? "Unknown")}
              {typeof r.company === "string" && r.company && (
                <span className="font-normal" style={{ color: "var(--a-text3)" }}>
                  {" "}
                  · {r.company}
                </span>
              )}
              {r.kind === "call-request" && (
                <Badge tone="warn" className="ml-2 align-middle">
                  📞 call back
                </Badge>
              )}
            </div>
            <div className="text-[11px] truncate" style={{ color: "var(--a-text3)" }}>
              {String(r.phone ?? "")}
              {typeof r.email === "string" && r.email ? ` · ${r.email}` : ""}
              {typeof r.callSlot === "string" && r.callSlot ? ` · prefers ${r.callSlot}` : ""}
            </div>
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
        <p className="max-w-[380px] truncate text-xs" style={{ color: "var(--a-text2)" }}>
          {String(r.requirement ?? "")}
        </p>
      ),
    },
    {
      id: "source",
      label: "Source",
      hideBelow: "lg",
      sortVal: (r) => String(r.source ?? ""),
      csv: (r) => String(r.source ?? ""),
      render: (r) => (
        <span className="text-[11px]" style={{ color: "var(--a-text3)" }}>
          {String(r.source ?? "")}
          {typeof r.product_ref === "string" && r.product_ref ? ` · ${r.product_ref}` : ""}
        </span>
      ),
    },
    {
      id: "status",
      label: "Status",
      sortVal: (r) => statusOf(r),
      csv: (r) => statusOf(r),
      render: (r) => <Badge tone={statusTone(statusOf(r))}>{statusOf(r)}</Badge>,
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
        title="Enquiries"
        sub="Every form submission from the public site, newest first."
        actions={
          <div className="a-card flex items-center gap-1 p-1">
            {STATUSES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setTab(s.id)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                style={
                  tab === s.id
                    ? { background: "var(--a-accent-soft)", color: "var(--a-accent)" }
                    : { color: "var(--a-text3)" }
                }
              >
                {s.label} <span className="tabular-nums opacity-70">{counts[s.id]}</span>
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
          `${r.name ?? ""} ${r.company ?? ""} ${r.phone ?? ""} ${r.email ?? ""} ${r.requirement ?? ""} ${r.source ?? ""}`
        }
        searchPlaceholder="Search enquiries…  ( / )"
        csvName="enquiries"
        onRow={(r) => setOpen(r)}
        emptyTitle="No enquiries yet"
        emptyBody="They'll appear here the moment a visitor submits any form on the site."
        rowActions={(r) => (
          <>
            {statusOf(r) !== "closed" && (
              <IconBtn
                label={statusOf(r) === "new" ? "Mark contacted" : "Mark closed"}
                icon={CheckCircle2}
                size="sm"
                onClick={() => void setStatus(r, statusOf(r) === "new" ? "contacted" : "closed")}
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
              <Badge tone={statusTone(statusOf(r))} className="shrink-0">
                {statusOf(r)}
              </Badge>
            </div>
            <div className="text-[11px] truncate" style={{ color: "var(--a-text3)" }}>
              {String(r.requirement ?? "")}
            </div>
          </div>
        )}
      />

      {/* Detail drawer */}
      <Drawer
        open={openRow !== null}
        onClose={() => setOpen(null)}
        title={openRow ? String(openRow.name ?? "Enquiry") : ""}
        sub={
          openRow
            ? `${timeAgo(toDate(openRow.createdAt))} · ${String(openRow.source ?? "")}`
            : undefined
        }
        footer={
          openRow && (
            <>
              <Btn variant="danger" icon={Trash2} onClick={() => setConfirmDelete([openRow])}>
                Delete
              </Btn>
              <div className="ml-auto flex gap-2">
                {STATUSES.filter((s) => s.id !== "all").map((s) => (
                  <Btn
                    key={s.id}
                    size="sm"
                    variant={statusOf(openRow) === s.id ? "primary" : "ghost"}
                    onClick={() => void setStatus(openRow, s.id as EnquiryStatus)}
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

            <div>
              <div className="text-xs font-semibold mb-1.5" style={{ color: "var(--a-text3)" }}>
                REQUIREMENT
              </div>
              <div
                className="a-card p-4 text-[13px] whitespace-pre-wrap leading-relaxed"
                style={{ color: "var(--a-text2)", background: "var(--a-surface2)" }}
              >
                {String(openRow.requirement ?? "—")}
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
              {[
                ["Type", openRow.kind === "call-request" ? "📞 Call-back request" : "Enquiry"],
                ["Preferred time", String(openRow.callSlot ?? "") || "—"],
                ["Company", String(openRow.company ?? "") || "—"],
                ["Email", String(openRow.email ?? "") || "—"],
                ["Product", String(openRow.product_ref ?? "") || "—"],
                ["Source", String(openRow.source ?? "") || "—"],
                ["Received", toDate(openRow.createdAt)?.toLocaleString() ?? "—"],
                ["Status", statusOf(openRow)],
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
              <Inbox className="h-3 w-3" /> Replying fast wins the order — the brochure promise is
              service.
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
            ? `Delete ${confirmDelete.length} enquiries?`
            : "Delete this enquiry?"
        }
        body="You can undo from the toast for a few seconds after deleting."
      />
    </div>
  );
}
