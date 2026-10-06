import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/ui/badge";
import {
  createLead,
  updateLead,
  deleteLead,
} from "@/app/admin/actions";

export const metadata = { title: "Leads | Admin" };

const STATUS_VARIANT: Record<string, "default" | "muted"> = {
  new: "default",
  contacted: "muted",
  qualified: "default",
  closed: "muted",
};

export default async function AdminLeadsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Simple CRM: track people who reach out or show interest."
      />
      <ResourceManager
        resourceName="Lead"
        rows={rows ?? []}
        createAction={createLead}
        updateAction={updateLead}
        deleteAction={deleteLead}
        emptyTitle="No leads yet"
        emptyMessage="Add your first lead to start tracking."
        columns={[
          {
            key: "name",
            header: "Lead",
            render: (r) => (
              <span>
                <span className="block font-semibold">{r.name}</span>
                <span className="block text-xs text-sand">{r.email}</span>
                {r.phone && <span className="block text-xs text-sand">{r.phone}</span>}
              </span>
            ),
          },
          {
            key: "source",
            header: "Source",
            render: (r) => r.source || <span className="text-sand/60">—</span>,
          },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <Badge variant={STATUS_VARIANT[r.status] ?? "muted"}>
                {r.status}
              </Badge>
            ),
          },
          {
            key: "notes",
            header: "Notes",
            render: (r) => (
              <span className="line-clamp-2 max-w-xs text-sand">{r.notes || "—"}</span>
            ),
          },
          {
            key: "created",
            header: "Added",
            render: (r) =>
              new Date(r.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
          },
        ]}
        fields={[
          { name: "name", label: "Name", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "phone", label: "Phone", type: "text" },
          { name: "source", label: "Source", type: "text", placeholder: "Contact form, Instagram…" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "new", label: "New" },
              { value: "contacted", label: "Contacted" },
              { value: "qualified", label: "Qualified" },
              { value: "closed", label: "Closed" },
            ],
          },
          { name: "notes", label: "Notes", type: "textarea", rows: 3 },
        ]}
      />
    </div>
  );
}
