import { redirect } from "next/navigation";
import { ShieldX } from "lucide-react";
import { isSupabaseConfigured, createServerSupabaseClient } from "@/lib/supabase";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

/**
 * Auth-gated shell for every /admin route except /admin/login
 * (which lives outside this route group).
 */
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-ink text-cream">
        <SetupNotice />
      </div>
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const session = await getAdminSession();
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-16 text-cream">
        <Card className="w-full max-w-md border-red-500/30">
          <CardHeader className="items-center text-center">
            <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 text-red-400">
              <ShieldX className="h-6 w-6" />
            </span>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>
              You are signed in as {user.email ?? "an unknown account"}, but this
              account has no admin role. Ask a super_admin to grant you access.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SignOutButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminShell
      sidebar={<Sidebar />}
      header={<Topbar email={session.email} role={session.role} />}
    >
      {children}
    </AdminShell>
  );
}
