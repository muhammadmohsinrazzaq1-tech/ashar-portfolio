import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/ui/badge";
import {
  createSkill,
  updateSkill,
  deleteSkill,
  toggleSkillPublish,
} from "@/app/admin/actions";

export const metadata = { title: "Skills | Admin" };

export default async function AdminSkillsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("skills")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Skills"
        description="The skills shown on the portfolio. Unpublished skills stay hidden."
      />
      <ResourceManager
        resourceName="Skill"
        rows={rows ?? []}
        createAction={createSkill}
        updateAction={updateSkill}
        deleteAction={deleteSkill}
        toggleAction={toggleSkillPublish}
        emptyTitle="No skills yet"
        emptyMessage="Add your first skill to show it on the portfolio."
        columns={[
          { key: "title", header: "Title", render: (r) => <span className="font-semibold">{r.title}</span> },
          {
            key: "description",
            header: "Description",
            render: (r) => <span className="line-clamp-2 max-w-md text-sand">{r.description}</span>,
          },
          { key: "icon", header: "Icon", render: (r) => <code className="text-xs text-gold-light">{r.icon || "—"}</code> },
          { key: "order", header: "Order", render: (r) => r.display_order ?? "—" },
          {
            key: "status",
            header: "Status",
            render: (r) =>
              r.is_published ? <Badge>Published</Badge> : <Badge variant="muted">Hidden</Badge>,
          },
        ]}
        fields={[
          { name: "title", label: "Title", type: "text", required: true, placeholder: "YouTube Automation" },
          { name: "description", label: "Description", type: "textarea", rows: 3, required: true },
          { name: "icon", label: "Icon hint", type: "text", placeholder: "youtube", hint: "Lucide icon name used by the public site." },
          { name: "display_order", label: "Display order", type: "number", placeholder: "0" },
          { name: "is_published", label: "Published", type: "checkbox", hint: "Show this skill on the public site." },
        ]}
      />
    </div>
  );
}
