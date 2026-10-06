import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Audit Logs | Admin" };

export default async function AdminAuditPage() {
  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("audit_logs")
    .select("id, action, entity, entity_id, details, created_at, actor_id")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Read-only record of admin actions. Latest 200 entries."
      />
      <DataTable
        columns={[
          {
            key: "when",
            header: "When",
            render: (r) => (
              <span className="whitespace-nowrap text-sand">
                {new Date(r.created_at).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            ),
          },
          {
            key: "action",
            header: "Action",
            render: (r) => <Badge variant="muted">{r.action}</Badge>,
          },
          {
            key: "entity",
            header: "Entity",
            render: (r) => (
              <span className="text-cream">
                {r.entity}
                {r.entity_id && (
                  <span className="block max-w-[180px] truncate text-xs text-sand" title={r.entity_id}>
                    {r.entity_id}
                  </span>
                )}
              </span>
            ),
          },
          {
            key: "actor",
            header: "Actor",
            render: (r) => (
              <span className="block max-w-[200px] truncate text-xs text-sand" title={r.actor_id ?? ""}>
                {r.details?.by ?? r.actor_id?.slice(0, 8) ?? "—"}
              </span>
            ),
          },
        ]}
        rows={rows ?? []}
        empty={
          <EmptyState
            title="No audit entries yet"
            message="Actions taken in the admin panel will be recorded here."
          />
        }
      />
    </div>
  );
}
