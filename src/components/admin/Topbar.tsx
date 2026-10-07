import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "./SignOutButton";
import type { AdminRole } from "@/lib/admin-auth";

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
};

/** Header content (email + role + sign out). The sticky wrapper lives in AdminShell. */
export function Topbar({ email, role }: { email: string | null; role: AdminRole }) {
  return (
    <div className="flex h-16 items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-cream">
          {email ?? "Admin"}
        </p>
        <p className="text-[11px] uppercase tracking-[0.16em] text-sand/70">
          Signed in
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Badge>{ROLE_LABELS[role]}</Badge>
        <SignOutButton />
      </div>
    </div>
  );
}
