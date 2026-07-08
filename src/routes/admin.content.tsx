// Website content hub — one card per editable public page. Each opens the
// schema-driven editor at /admin/content/$page.
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { PAGE_SCHEMAS } from "@/admin/content-schema";
import { PageHeader } from "@/admin/ui";

export const Route = createFileRoute("/admin/content")({
  head: () => ({ meta: [{ title: "Website content — LK Admin" }] }),
  component: ContentHub,
});

function ContentHub() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Website content"
        sub="Edit the text and images on every public page. Changes go live the moment you save."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {PAGE_SCHEMAS.map((p, i) => (
          <Link
            key={p.id}
            to="/admin/content/$page"
            params={{ page: p.id }}
            className="a-card a-card-hover a-rise group p-4"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-center justify-between">
              <span
                className="grid h-9 w-9 place-items-center rounded-lg"
                style={{ background: "var(--a-accent-soft)", color: "var(--a-accent)" }}
              >
                <p.icon className="h-4 w-4" />
              </span>
              <ArrowUpRight
                className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                style={{ color: "var(--a-text3)" }}
              />
            </div>
            <div className="mt-3 text-sm font-semibold">{p.label}</div>
            <p className="mt-1 text-[12px] leading-snug" style={{ color: "var(--a-text3)" }}>
              {p.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
