import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/ui/badge";
import {
  createProject,
  updateProject,
  deleteProject,
  toggleProjectPublish,
} from "@/app/admin/actions";

export const metadata = { title: "Projects | Admin" };

export default async function AdminProjectsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("projects")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Case studies and project entries. Never invent projects — this list stays empty until there is real, verified work to show."
      />
      <ResourceManager
        resourceName="Project"
        rows={rows ?? []}
        createAction={createProject}
        updateAction={updateProject}
        deleteAction={deleteProject}
        toggleAction={toggleProjectPublish}
        emptyTitle="No projects yet"
        emptyMessage="Real, verified case studies will appear here once they are ready. Nothing is fabricated — this space stays empty until then."
        columns={[
          {
            key: "title",
            header: "Project",
            render: (r) => (
              <span>
                <span className="block font-semibold">{r.title}</span>
                <span className="block text-xs text-sand">{r.category || "No category"}</span>
              </span>
            ),
          },
          {
            key: "objective",
            header: "Objective",
            render: (r) => <span className="line-clamp-2 max-w-md text-sand">{r.objective || "—"}</span>,
          },
          { key: "order", header: "Order", render: (r) => r.display_order ?? "—" },
          {
            key: "status",
            header: "Status",
            render: (r) =>
              r.is_published ? <Badge>Published</Badge> : <Badge variant="muted">Hidden</Badge>,
          },
        ]}
        fields={[
          { name: "title", label: "Title", type: "text", required: true },
          { name: "category", label: "Category", type: "text", placeholder: "YouTube Automation" },
          { name: "objective", label: "Objective", type: "textarea", rows: 3 },
          { name: "approach", label: "Approach", type: "textarea", rows: 3 },
          { name: "role", label: "Your role", type: "text" },
          { name: "tools", label: "Tools", type: "multiline", rows: 3, hint: "One tool per line." },
          { name: "evidence_urls", label: "Evidence URLs", type: "multiline", rows: 3, hint: "One URL per line." },
          { name: "metrics", label: "Metrics", type: "textarea", rows: 2, hint: "Verified metrics only." },
          { name: "link", label: "Project link", type: "url", placeholder: "https://…" },
          { name: "display_order", label: "Display order", type: "number", placeholder: "0" },
          { name: "is_published", label: "Published", type: "checkbox", hint: "Show this project on the public site." },
        ]}
      />
    </div>
  );
}
