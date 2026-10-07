import { TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

/** Shown when Supabase env vars are missing — guides the admin to configure them. */
export function SetupNotice({ context = "admin panel" }: { context?: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center px-4 py-16">
      <Card className="w-full border-gold-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-gold" />
            Supabase is not configured
          </CardTitle>
          <CardDescription>
            The {context} needs a Supabase project to store content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-sand">
          <p>
            Add the following environment variables and restart the server:
          </p>
          <ul className="space-y-1.5 rounded-md border border-line bg-graphite p-4 font-mono text-xs text-cream">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            <li className="text-sand">SUPABASE_SERVICE_ROLE_KEY <span className="text-sand/60">(server-only, for invites & audit logs)</span></li>
          </ul>
          <p>
            Then create the database tables from the migration contract and add
            your user to <code className="text-gold-light">admin_users</code> with
            the <code className="text-gold-light">super_admin</code> role.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
