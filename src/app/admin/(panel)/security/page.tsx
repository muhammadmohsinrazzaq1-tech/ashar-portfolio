import { ShieldCheck, KeyRound, Database, MonitorCheck } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignOutEverywhereButton } from "@/components/admin/SignOutEverywhereButton";

export const metadata = { title: "Security | Admin" };

export default async function AdminSecurityPage() {
  const session = await getAdminSession();

  return (
    <div>
      <PageHeader
        title="Security"
        description="Session overview and security guidance for the admin panel."
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MonitorCheck className="h-5 w-5 text-gold-light" /> Current session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-sand">Signed in as</dt>
                <dd className="mt-1 break-all text-cream">{session?.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-sand">Role</dt>
                <dd className="mt-1 text-cream">{session?.role.replace("_", " ") ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-sand">User ID</dt>
                <dd className="mt-1 break-all font-mono text-xs text-cream">{session?.userId ?? "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-gold-light" /> Data access summary
            </CardTitle>
            <CardDescription>How this panel reads and writes your data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-sand">
            <p>
              <span className="font-semibold text-cream">Reads & writes</span> go through
              Supabase with your signed-in session, so Row Level Security (RLS) policies
              on each table decide what each admin can see and change.
            </p>
            <p>
              <span className="font-semibold text-cream">Privileged writes</span> (audit
              logs, user invites) use the server-only service-role key, which bypasses
              RLS. That key lives only in <code className="text-gold-light">SUPABASE_SERVICE_ROLE_KEY</code> and
              is never sent to the browser.
            </p>
            <p>
              <span className="font-semibold text-cream">Media uploads</span> are stored in
              the public <code className="text-gold-light">media</code> bucket (public
              read, authenticated write). Only admins can upload, archive, or delete files.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-gold-light" /> Rotate keys
            </CardTitle>
            <CardDescription>If a key may have leaked, rotate it immediately.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-sand">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Open the Supabase dashboard → Project Settings → API, and roll the
                compromised key (anon or service_role).
              </li>
              <li>
                Update the matching environment variable on the server (
                <code className="text-gold-light">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> or{" "}
                <code className="text-gold-light">SUPABASE_SERVICE_ROLE_KEY</code>) and
                redeploy / restart.
              </li>
              <li>
                Use “Sign out all sessions” below to force every admin to sign in again.
              </li>
            </ol>
            <SignOutEverywhereButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-gold-light" /> Good habits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-sand">
              <li>Give each person the lowest role they need: editor, then admin, then super_admin.</li>
              <li>Remove access promptly when someone no longer needs it (Users & Roles).</li>
              <li>Review the audit log periodically for unexpected changes.</li>
              <li>Never paste API keys or secrets into AI settings, prompts, or messages — keys live only in server environment variables.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
