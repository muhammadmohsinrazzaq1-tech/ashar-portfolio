import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/ui/badge";
import {
  createExperience,
  updateExperience,
  deleteExperience,
  toggleExperiencePublish,
} from "@/app/admin/actions";

export const metadata = { title: "Experience | Admin" };

export default async function AdminExperiencePage() {
  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("experience")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Experience"
        description="Work history entries. Only add roles that are verified and accurate."
      />
      <ResourceManager
        resourceName="Experience entry"
        rows={rows ?? []}
        createAction={createExperience}
        updateAction={updateExperience}
        deleteAction={deleteExperience}
        toggleAction={toggleExperiencePublish}
        emptyTitle="No experience entries yet"
        emptyMessage="Add your first role to show it on the portfolio."
        columns={[
          {
            key: "role",
            header: "Role",
            render: (r) => (
              <span>
                <span className="block font-semibold">{r.role}</span>
                <span className="block text-xs text-sand">{r.company}</span>
              </span>
            ),
          },
          { key: "duration", header: "Duration", render: (r) => r.duration || "—" },
          { key: "status", header: "Status", render: (r) => r.status || "—" },
          { key: "order", header: "Order", render: (r) => r.display_order ?? "—" },
          {
            key: "published",
            header: "Status",
            render: (r) =>
              r.is_published ? <Badge>Published</Badge> : <Badge variant="muted">Hidden</Badge>,
          },
        ]}
        fields={[
          { name: "company", label: "Company", type: "text", required: true },
          { name: "role", label: "Role", type: "text", required: true },
          { name: "duration", label: "Duration", type: "text", placeholder: "Approximately 2 years" },
          { name: "status", label: "Status", type: "text", placeholder: "Present / Past" },
          {
            name: "responsibilities",
            label: "Responsibilities",
            type: "multiline",
            rows: 4,
            hint: "One responsibility per line.",
          },
          {
            name: "achievements",
            label: "Achievements",
            type: "multiline",
            rows: 4,
            hint: "One achievement per line. Use verified facts only.",
          },
          { name: "display_order", label: "Display order", type: "number", placeholder: "0" },
          { name: "is_published", label: "Published", type: "checkbox", hint: "Show this entry on the public site." },
        ]}
      />
    </div>
  );
}
