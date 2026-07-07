import { createFileRoute } from "@tanstack/react-router";
import { moduleById, type Row } from "@/admin/registry";
import { ModulePage } from "@/admin/module-page";
import type { Col } from "@/admin/table";

type S = { q?: string; new?: string };

export const Route = createFileRoute("/admin/testimonials")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    new: s.new === "1" ? "1" : undefined,
  }),
  head: () => ({ meta: [{ title: "Testimonials — LK Admin" }] }),
  component: TestimonialsAdmin,
});

const def = moduleById("testimonials");

function TestimonialsAdmin() {
  const { q, new: isNew } = Route.useSearch();

  const cols: Col<Row>[] = [
    {
      id: "q",
      label: "Quote",
      sortVal: (r) => String(r.q ?? ""),
      csv: (r) => String(r.q ?? ""),
      render: (r) => (
        <p className="text-[13px] max-w-[520px] line-clamp-2" style={{ color: "var(--a-text2)" }}>
          “{String(r.q ?? "")}”
        </p>
      ),
    },
    {
      id: "who",
      label: "Attribution",
      hideBelow: "md",
      sortVal: (r) => String(r.who ?? ""),
      csv: (r) => String(r.who ?? ""),
      render: (r) => <span className="text-xs font-medium">{String(r.who ?? "")}</span>,
    },
  ];

  return (
    <ModulePage
      def={def}
      cols={cols}
      urlQuery={q}
      urlNew={isNew === "1"}
      searchText={(r) => `${r.q ?? ""} ${r.who ?? ""}`}
    />
  );
}
