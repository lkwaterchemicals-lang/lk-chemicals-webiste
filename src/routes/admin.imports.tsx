// Import Center — the dashboard face of the PDF pipeline.
//
// Drop technical or safety data sheets into the import folder and this page
// does the rest: it scans, classifies, extracts, files the content under the
// right category, uploads the original to Cloudinary, attaches it as the
// downloadable document and clears the local file. Every run is recorded, so a
// failure explains itself and can be retried in one click.
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileText,
  FolderOpen,
  HelpCircle,
  Import,
  Loader2,
  Play,
  RefreshCw,
  RotateCcw,
  SkipForward,
  Trash2,
} from "lucide-react";
import { useCol, useInvalidate } from "@/admin/api";
import { timeAgo, toDate, type Row } from "@/admin/registry";
import {
  discardDuplicate,
  importFile,
  scanImportFolder,
  LEDGER,
  type ImportContext,
} from "@/admin/import-pipeline";
import { label as kindLabel } from "@/lib/pdf-import/parse";
import type { ImportRecord, ImportStatus, ScannedFile } from "@/lib/pdf-import/types";
import { Badge, Btn, Card, Empty, Drawer, IconBtn, PageHeader, SkeletonRows } from "@/admin/ui";

export const Route = createFileRoute("/admin/imports")({
  head: () => ({ meta: [{ title: "Import Center — LK Admin" }] }),
  component: ImportCenter,
});

/* ------------------------------------------------------------------ helpers */

const STATUS_TONE: Record<ImportStatus, "neutral" | "accent" | "ok" | "warn" | "danger"> = {
  pending: "neutral",
  running: "accent",
  imported: "ok",
  failed: "danger",
  review: "warn",
  skipped: "neutral",
};

const STATUS_LABEL: Record<ImportStatus, string> = {
  pending: "Waiting",
  running: "Importing…",
  imported: "Imported",
  failed: "Failed",
  review: "Needs review",
  skipped: "Duplicate",
};

const kb = (bytes: number) =>
  bytes > 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

/** One row of the page: a file on disk, a ledger entry, or both. */
type Entry = {
  id: string;
  fileName: string;
  bytes: number;
  file?: ScannedFile;
  record?: ImportRecord & { __id?: string };
  status: ImportStatus;
};

function buildEntries(files: ScannedFile[], ledger: Row[]): Entry[] {
  const byHash = new Map(
    ledger.map((r) => [String(r.hash ?? r.__id), r as unknown as ImportRecord]),
  );
  const onDisk: Entry[] = files.map((f) => {
    const record = byHash.get(f.hash);
    return {
      id: f.hash,
      fileName: f.name,
      bytes: f.bytes,
      file: f,
      record,
      // A file still on disk that was previously imported is a re-drop.
      status: record ? (record.status === "imported" ? "skipped" : record.status) : "pending",
    };
  });
  const seen = new Set(onDisk.map((e) => e.id));
  // History: everything the ledger knows whose file is gone.
  const history: Entry[] = ledger
    .map((r) => r as unknown as ImportRecord)
    .filter((r) => !seen.has(r.hash))
    .map((r) => ({
      id: r.hash,
      fileName: r.fileName,
      bytes: r.bytes ?? 0,
      record: r,
      status: r.status,
    }));
  return [...onDisk, ...history];
}

/* --------------------------------------------------------------------- page */

/** Is Cloudinary STILL refusing to serve the uploaded documents?
 *
 * `deliveryBlocked` is written onto an import row at the moment that row ran,
 * so once the account setting is fixed the flag lingers on old rows and this
 * warning keeps shouting about a problem that no longer exists. Re-probe one
 * flagged URL and believe the network, not the history. */
function useDeliveryStillBlocked(
  entries: { record?: { deliveryBlocked?: boolean; documentUrl?: string } }[],
) {
  const flagged = entries.find((e) => e.record?.deliveryBlocked);
  const probeUrl = flagged?.record?.documentUrl ?? "";
  const [blocked, setBlocked] = useState(Boolean(flagged));

  useEffect(() => {
    if (!flagged) {
      setBlocked(false);
      return;
    }
    if (!probeUrl) {
      setBlocked(true);
      return;
    }
    let alive = true;
    // A HEAD costs nothing; any 2xx means delivery is working again.
    fetch(probeUrl, { method: "HEAD" })
      .then((r) => alive && setBlocked(!r.ok))
      .catch(() => alive && setBlocked(true));
    return () => {
      alive = false;
    };
  }, [flagged, probeUrl]);

  return blocked;
}

function ImportCenter() {
  const invalidate = useInvalidate();
  const categories = useCol("categories");
  const serviceCategories = useCol("serviceCategories");
  const products = useCol("products");
  const services = useCol("services");
  const ledger = useCol(LEDGER);

  const [publish, setPublish] = useState(false);
  const [verifyDelivery, setVerifyDelivery] = useState(true);
  const [autoRun, setAutoRun] = useState(true);
  const [busy, setBusy] = useState<{ hash: string; stage: string } | null>(null);
  const [open, setOpen] = useState<Entry | null>(null);
  const runningRef = useRef(false);

  const scan = useQuery({
    queryKey: ["admin", "import-scan"],
    queryFn: scanImportFolder,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const entries = useMemo(
    () => buildEntries(scan.data?.files ?? [], ledger.data ?? []),
    [scan.data, ledger.data],
  );
  const pending = useMemo(() => entries.filter((e) => e.status === "pending"), [entries]);

  const dataReady =
    !categories.isLoading && !products.isLoading && !services.isLoading && !ledger.isLoading;

  const context = useCallback(
    (onProgress: (stage: string) => void): ImportContext => ({
      categories: categories.data ?? [],
      serviceCategories: serviceCategories.data ?? [],
      products: products.data ?? [],
      services: services.data ?? [],
      publish,
      verifyDelivery,
      onProgress,
    }),
    [
      categories.data,
      serviceCategories.data,
      products.data,
      services.data,
      publish,
      verifyDelivery,
    ],
  );

  const runOne = useCallback(
    async (file: ScannedFile) => {
      setBusy({ hash: file.hash, stage: "Starting" });
      const record = await importFile(
        file,
        context((stage) => setBusy({ hash: file.hash, stage })),
      );
      setBusy(null);
      if (record.status === "imported") {
        toast.success(
          `${record.targetName ?? file.name} — ${record.targetCreated ? "created" : "updated"}`,
        );
      } else if (record.status === "skipped") {
        toast(`${file.name} skipped — already imported`);
      } else if (record.status === "review") {
        toast.warning(`${file.name} needs review`, { description: record.error });
      } else {
        toast.error(`${file.name} failed`, { description: record.error });
      }
      return record;
    },
    [context],
  );

  /** Processes the queue one file at a time — Firestore reads between files
   * would otherwise race, and two documents for the same product must be
   * merged in sequence to combine rather than collide. */
  const runAll = useCallback(
    async (files: ScannedFile[]) => {
      if (runningRef.current || !files.length) return;
      runningRef.current = true;
      try {
        for (const file of files) {
          await runOne(file);
          // Re-read the catalog so the next file sees what this one wrote.
          await Promise.all([
            products.refetch(),
            services.refetch(),
            categories.refetch(),
            ledger.refetch(),
          ]);
        }
      } finally {
        runningRef.current = false;
        invalidate("products");
        void scan.refetch();
      }
    },
    [runOne, products, services, categories, ledger, invalidate, scan],
  );

  // Fully automated: anything new in the folder is imported without being asked.
  useEffect(() => {
    if (!autoRun || !dataReady || runningRef.current || !pending.length) return;
    const files = pending.map((e) => e.file).filter((f): f is ScannedFile => Boolean(f));
    void runAll(files);
  }, [autoRun, dataReady, pending, runAll]);

  /** Clears a re-dropped duplicate out of the folder. */
  const discard = useCallback(
    async (file: ScannedFile) => {
      try {
        await discardDuplicate(file);
        toast.success(`${file.name} removed from the import folder`);
      } catch (err) {
        toast.error("Couldn't remove the file", {
          description: err instanceof Error ? err.message : String(err),
        });
      }
      await Promise.all([scan.refetch(), ledger.refetch()]);
    },
    [scan, ledger],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { pending: 0, imported: 0, failed: 0, review: 0, skipped: 0 };
    entries.forEach((e) => (c[e.status] = (c[e.status] ?? 0) + 1));
    return c;
  }, [entries]);

  const folderMissing = scan.data && !scan.data.available;
  // One account setting can block every download link at once; say it once,
  // above the list, instead of repeating it on every row.
  const deliveryBlocked = useDeliveryStillBlocked(entries);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Import Center"
        sub={
          scan.data?.dir
            ? `Watching ${scan.data.dir} — drop data sheets in and they become catalog records.`
            : "Automated PDF → CMS pipeline."
        }
        actions={
          <>
            <Btn
              icon={RefreshCw}
              busy={scan.isFetching}
              onClick={() => {
                void scan.refetch();
                void ledger.refetch();
              }}
            >
              Scan now
            </Btn>
            <Btn
              variant="primary"
              icon={Play}
              disabled={!pending.length || Boolean(busy) || !dataReady}
              onClick={() =>
                void runAll(pending.map((e) => e.file).filter((f): f is ScannedFile => Boolean(f)))
              }
            >
              Import {pending.length || ""}
            </Btn>
          </>
        }
      />

      {/* Pipeline settings — deliberately few, and both default to the safe side. */}
      <Card>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px]">
          <Toggle
            checked={autoRun}
            onChange={setAutoRun}
            label="Import automatically"
            hint="New files are processed as soon as they appear"
          />
          <Toggle
            checked={publish}
            onChange={setPublish}
            label="Publish immediately"
            hint="Off: new records land as drafts for a quick look first"
          />
          <Toggle
            checked={verifyDelivery}
            onChange={setVerifyDelivery}
            label="Verify download link"
            hint="Keeps the local PDF until the Cloudinary URL really serves"
          />
        </div>
      </Card>

      {folderMissing && (
        <Card>
          <div className="flex gap-3">
            <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: "var(--a-warn)" }} />
            <div className="text-[13px]" style={{ color: "var(--a-text2)" }}>
              <p className="font-semibold" style={{ color: "var(--a-text)" }}>
                The import folder isn't readable here.
              </p>
              <p className="mt-1">{scan.data?.error}</p>
            </div>
          </div>
        </Card>
      )}

      {deliveryBlocked && (
        <Card>
          <div className="flex gap-3">
            <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: "var(--a-warn)" }} />
            <div className="text-[13px]" style={{ color: "var(--a-text2)" }}>
              <p className="font-semibold" style={{ color: "var(--a-text)" }}>
                Cloudinary isn't serving PDFs yet — one setting fixes every import.
              </p>
              <p className="mt-1">
                The catalog records were saved and the files are uploaded, but the download links
                return 401, so the local PDFs were kept. In the{" "}
                <a
                  className="underline"
                  style={{ color: "var(--a-accent)" }}
                  href="https://console.cloudinary.com/settings/security"
                  target="_blank"
                  rel="noreferrer"
                >
                  Cloudinary console → Settings → Security
                </a>{" "}
                allow delivery of PDF and ZIP files, then hit Retry on the affected rows.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {(
          [
            ["Waiting", counts.pending, FolderOpen],
            ["Imported", counts.imported, CheckCircle2],
            ["Needs review", counts.review, HelpCircle],
            ["Failed", counts.failed, AlertTriangle],
            ["Duplicates", counts.skipped, SkipForward],
          ] as const
        ).map(([name, n, Icon]) => (
          <div key={name} className="a-card p-4">
            <div
              className="flex items-center gap-2 text-[11px] font-semibold"
              style={{ color: "var(--a-text3)" }}
            >
              <Icon className="h-3.5 w-3.5" /> {name.toUpperCase()}
            </div>
            <div className="mt-1 text-2xl tabular-nums">{n}</div>
          </div>
        ))}
      </div>

      <Card title="Imports" pad={false}>
        {scan.isLoading || ledger.isLoading ? (
          <SkeletonRows n={4} />
        ) : entries.length === 0 ? (
          <Empty
            icon={Import}
            title="Nothing to import"
            body={
              <>
                Drop product or safety data sheets into{" "}
                <code>{scan.data?.dir ?? "the import folder"}</code> and they'll turn into catalog
                records automatically.
              </>
            }
          />
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--a-border)" }}>
            {entries.map((e) => (
              <ImportRow
                key={e.id}
                entry={e}
                busyStage={busy?.hash === e.id ? busy.stage : null}
                onOpen={() => setOpen(e)}
                onRetry={e.file ? () => void runAll([e.file!]) : undefined}
                onDiscard={
                  e.file && e.status === "skipped" ? () => void discard(e.file!) : undefined
                }
              />
            ))}
          </ul>
        )}
      </Card>

      <DetailDrawer entry={open} onClose={() => setOpen(null)} />
    </div>
  );
}

/* ---------------------------------------------------------------- row + UI */

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(ev) => onChange(ev.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-current"
        style={{ accentColor: "var(--a-accent)" }}
      />
      <span className="min-w-0">
        <span className="block font-semibold">{label}</span>
        <span className="block text-[11px]" style={{ color: "var(--a-text3)" }}>
          {hint}
        </span>
      </span>
    </label>
  );
}

/** The one-line "what happened to this file" caption. */
function summarise(entry: Entry): string {
  const r = entry.record;
  return [
    r?.kind ? kindLabel(r.kind) : null,
    r?.targetName,
    r?.categoryName ? `→ ${r.categoryName}` : null,
    entry.bytes ? kb(entry.bytes) : null,
    r?.importedAt ? timeAgo(toDate(r.importedAt)) : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function ImportRow({
  entry,
  busyStage,
  onOpen,
  onRetry,
  onDiscard,
}: {
  entry: Entry;
  busyStage: string | null;
  onOpen: () => void;
  onRetry?: () => void;
  onDiscard?: () => void;
}) {
  const r = entry.record;
  const status = busyStage ? "running" : entry.status;
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
        style={{ background: "var(--a-surface2)", color: "var(--a-text3)" }}
      >
        {busyStage ? (
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--a-accent)" }} />
        ) : (
          <FileText className="h-4 w-4" />
        )}
      </span>

      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[13px] font-semibold">{entry.fileName}</span>
        <span className="block truncate text-[11px]" style={{ color: "var(--a-text3)" }}>
          {busyStage ?? (summarise(entry) || "Not imported yet")}
        </span>
      </button>

      {r?.targetCreated !== undefined && status === "imported" && (
        <Badge tone="neutral" className="hidden sm:inline-flex">
          {r.targetCreated ? "created" : "updated"}
        </Badge>
      )}
      {r?.documentUrl && (
        <a
          href={r.documentUrl}
          target="_blank"
          rel="noreferrer"
          className="a-btn a-btn-bare a-btn-sm a-iconbtn"
          aria-label="Open the uploaded PDF"
          title="Open the uploaded PDF"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
      <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
      {onRetry && status !== "running" && (
        <IconBtn
          label={entry.status === "pending" ? "Import now" : "Retry import"}
          icon={entry.status === "pending" ? Play : RotateCcw}
          size="sm"
          onClick={onRetry}
        />
      )}
      {onDiscard && status !== "running" && (
        <IconBtn
          label="Remove this duplicate from the import folder"
          icon={Trash2}
          size="sm"
          onClick={onDiscard}
        />
      )}
    </li>
  );
}

function DetailDrawer({ entry, onClose }: { entry: Entry | null; onClose: () => void }) {
  const r = entry?.record;
  return (
    <Drawer
      open={Boolean(entry)}
      onClose={onClose}
      title={entry?.fileName ?? ""}
      sub={r?.kind ? `${kindLabel(r.kind)} · ${r.family?.toUpperCase()}` : "Not imported yet"}
    >
      {entry && (
        <div className="space-y-5 text-[13px]">
          {r?.error && (
            <div
              className="a-card p-4"
              style={{ borderColor: "color-mix(in oklab, var(--a-danger) 35%, var(--a-border))" }}
            >
              <p
                className="font-semibold flex items-center gap-2"
                style={{ color: "var(--a-danger)" }}
              >
                <AlertTriangle className="h-4 w-4" /> {STATUS_LABEL[entry.status]}
              </p>
              <p className="mt-1.5" style={{ color: "var(--a-text2)" }}>
                {r.error}
              </p>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            {(
              [
                ["Status", STATUS_LABEL[entry.status]],
                ["Identified as", r?.kind ? kindLabel(r.kind) : "—"],
                ["Confidence", r?.confidence ? `${Math.round(r.confidence * 100)}%` : "—"],
                ["Record", r?.targetName ?? "—"],
                ["Collection", r?.targetCollection ?? "—"],
                ["Category", r?.categoryName ?? "—"],
                ["Category created", r?.categoryCreated ? "yes" : "no"],
                ["Cloudinary", r?.documentUrl ? "uploaded" : "—"],
                ["Local file", r?.localFileDeleted ? "deleted" : "still in the folder"],
                ["Size", entry.bytes ? kb(entry.bytes) : "—"],
                ["Attempts", String(r?.attempts ?? 0)],
                ["Imported", r?.importedAt ? timeAgo(toDate(r.importedAt)) : "—"],
              ] as const
            ).map(([k, v]) => (
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

          {r?.previewUrl && (
            <div>
              <SectionLabel>FIRST PAGE</SectionLabel>
              <img
                src={r.previewUrl}
                alt=""
                className="mt-2 w-full rounded-xl"
                style={{ border: "1px solid var(--a-border)" }}
              />
            </div>
          )}

          {Boolean(r?.signals?.length) && (
            <div>
              <SectionLabel>WHY IT WAS CLASSIFIED THIS WAY</SectionLabel>
              <ul className="mt-2 space-y-1">
                {r?.signals?.map((s, i) => (
                  <li key={i} className="flex gap-2" style={{ color: "var(--a-text2)" }}>
                    <span className="tabular-nums" style={{ color: "var(--a-accent)" }}>
                      +{s.weight.toFixed(2)}
                    </span>
                    {s.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Boolean(r?.fieldsWritten?.length) && (
            <div>
              <SectionLabel>FIELDS WRITTEN</SectionLabel>
              <p className="mt-1.5" style={{ color: "var(--a-text2)" }}>
                {r?.fieldsWritten?.join(", ")}
              </p>
            </div>
          )}
          {Boolean(r?.fieldsSkipped?.length) && (
            <div>
              <SectionLabel>LEFT ALONE (ALREADY FILLED IN)</SectionLabel>
              <p className="mt-1.5" style={{ color: "var(--a-text2)" }}>
                {r?.fieldsSkipped?.join(", ")}
              </p>
            </div>
          )}

          {r?.targetCollection && r?.targetId && (
            <a
              href={`/admin/${r.targetCollection}?q=${encodeURIComponent(r.targetName ?? "")}`}
              className="a-btn a-btn-ghost w-full justify-center"
            >
              Open in {r.targetCollection}
            </a>
          )}
        </div>
      )}
    </Drawer>
  );
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[11px] font-semibold" style={{ color: "var(--a-text3)" }}>
    {children}
  </div>
);
