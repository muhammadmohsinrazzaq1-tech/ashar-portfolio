import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/ui/badge";
import {
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  toggleSocialLinkPublish,
} from "@/app/admin/actions";

export const metadata = { title: "Social Links | Admin" };

export default async function AdminSocialLinksPage() {
  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("social_links")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Social Links"
        description="The social profiles linked from the portfolio. Keys should be lowercase slugs (e.g. instagram)."
      />
      <ResourceManager
        resourceName="Social link"
        rows={rows ?? []}
        createAction={createSocialLink}
        updateAction={updateSocialLink}
        deleteAction={deleteSocialLink}
        toggleAction={toggleSocialLinkPublish}
        emptyTitle="No social links yet"
        emptyMessage="Add your first social profile link."
        columns={[
          {
            key: "label",
            header: "Profile",
            render: (r) => (
              <span>
                <span className="block font-semibold">{r.label}</span>
                <span className="block text-xs text-sand">
                  <code className="text-gold-light/80">{r.key}</code>
                </span>
              </span>
            ),
          },
          {
            key: "url",
            header: "URL",
            render: (r) => (
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="max-w-md truncate text-gold-light underline-offset-2 hover:underline"
              >
                {r.url}
              </a>
            ),
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
          { name: "key", label: "Key", type: "text", required: true, placeholder: "instagram", hint: "Unique lowercase slug." },
          { name: "label", label: "Label", type: "text", required: true, placeholder: "Instagram" },
          { name: "url", label: "URL", type: "url", required: true, placeholder: "https://…" },
          { name: "display_order", label: "Display order", type: "number", placeholder: "0" },
          { name: "is_published", label: "Published", type: "checkbox", hint: "Show this link on the public site." },
        ]}
      />
    </div>
  );
}
