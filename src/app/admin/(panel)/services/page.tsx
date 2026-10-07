import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/ui/badge";
import {
  createService,
  updateService,
  deleteService,
  toggleServicePublish,
} from "@/app/admin/actions";

export const metadata = { title: "Services | Admin" };

export default async function AdminServicesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("services")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Services"
        description="The services you offer. Keep deliverables concrete and accurate."
      />
      <ResourceManager
        resourceName="Service"
        rows={rows ?? []}
        createAction={createService}
        updateAction={updateService}
        deleteAction={deleteService}
        toggleAction={toggleServicePublish}
        emptyTitle="No services yet"
        emptyMessage="Add your first service to show it on the portfolio."
        columns={[
          {
            key: "title",
            header: "Service",
            render: (r) => (
              <span>
                <span className="block font-semibold">{r.title}</span>
                <span className="block text-xs text-sand">{r.tagline}</span>
              </span>
            ),
          },
          {
            key: "value_proposition",
            header: "Value proposition",
            render: (r) => <span className="line-clamp-2 max-w-md text-sand">{r.value_proposition}</span>,
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
          { name: "tagline", label: "Tagline", type: "text", placeholder: "Short punchy tagline" },
          { name: "value_proposition", label: "Value proposition", type: "textarea", rows: 3 },
          {
            name: "deliverables",
            label: "Deliverables",
            type: "multiline",
            rows: 4,
            hint: "One deliverable per line.",
          },
          { name: "icon", label: "Icon hint", type: "text", placeholder: "video" },
          { name: "display_order", label: "Display order", type: "number", placeholder: "0" },
          { name: "is_published", label: "Published", type: "checkbox", hint: "Show this service on the public site." },
        ]}
      />
    </div>
  );
}
