import { redirect } from "next/navigation";
import { ShieldX } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getAdminSession } from "@/lib/admin-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InviteUserForm } from "@/components/admin/InviteUserForm";
import { UserRowActions } from "@/components/admin/UserRowActions";
import {
  inviteAdminUser,
  updateUserRole,
  removeAdminUser,
} from "@/app/admin/actions";

export const metadata = { title: "Users & Roles | Admin" };

const ROLE_BADGE: Record<string, "default" | "muted"> = {
  super_admin: "default",
  admin: "default",
  editor: "muted",
};

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    redirect("/admin");
  }
  const canManageRoles = session.role === "super_admin";

  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("admin_users")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Users & Roles"
        description="Who can access the admin panel. Role changes and removals require the super_admin role."
      />

      {!canManageRoles && (
        <Card className="mb-6 border-gold-muted/40">
          <CardContent className="flex items-center gap-3 p-5 text-sm text-sand">
            <ShieldX className="h-5 w-5 shrink-0 text-gold-light" />
            You are signed in as an <span className="font-semibold text-cream">admin</span>:
            you can invite editors and admins, but only a super_admin can change
            roles or remove users.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8">
        <InviteUserForm
          action={inviteAdminUser}
          canInviteSuperAdmin={canManageRoles}
        />

        <Card>
          <CardHeader>
            <CardTitle>Admin users</CardTitle>
            <CardDescription>
              {rows?.length ?? 0} account{(rows?.length ?? 0) === 1 ? "" : "s"} with panel access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                {
                  key: "email",
                  header: "Email",
                  render: (r) => <span className="font-semibold">{r.email}</span>,
                },
                {
                  key: "role",
                  header: "Role",
                  render: (r) => (
                    <Badge variant={ROLE_BADGE[r.role] ?? "muted"}>
                      {String(r.role).replace("_", " ")}
                    </Badge>
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
              rows={rows ?? []}
              rowActions={(row) => (
                <UserRowActions
                  userId={row.id}
                  email={row.email}
                  role={row.role}
                  isSelf={row.id === session.userId}
                  canManageRoles={canManageRoles}
                  updateRoleAction={updateUserRole}
                  removeAction={removeAdminUser}
                />
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
