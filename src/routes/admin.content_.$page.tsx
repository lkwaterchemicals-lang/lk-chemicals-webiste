// Editor route for a single public page. The trailing underscore on `content_`
// keeps this off the /admin/content hub layout (same trick as products_.$slug).
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { schemaById } from "@/admin/content-schema";
import { PageContentEditor } from "@/admin/page-editor";

export const Route = createFileRoute("/admin/content_/$page")({
  head: () => ({ meta: [{ title: "Edit page — LK Admin" }] }),
  component: PageEditorRoute,
});

function PageEditorRoute() {
  const { page } = Route.useParams();
  const schema = schemaById(page);

  return (
    <div className="space-y-4">
      <Link
        to="/admin/content"
        className="inline-flex items-center gap-1.5 text-[13px]"
        style={{ color: "var(--a-text3)" }}
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All pages
      </Link>
      {schema ? (
        <PageContentEditor schema={schema} />
      ) : (
        <div className="a-card p-6 text-[13px]" style={{ color: "var(--a-text2)" }}>
          Unknown page “{page}”.{" "}
          <Link to="/admin/content" style={{ color: "var(--a-accent)" }}>
            Back to content
          </Link>
          .
        </div>
      )}
    </div>
  );
}
