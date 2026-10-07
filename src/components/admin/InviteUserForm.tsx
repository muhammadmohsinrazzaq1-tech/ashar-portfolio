"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import type { ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function InviteUserForm({
  action,
  canInviteSuperAdmin,
}: {
  action: (fd: FormData) => Promise<ActionResult>;
  canInviteSuperAdmin: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSent(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    if (!email || !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    startTransition(async () => {
      const result = await action(fd);
      if (result.ok) {
        setSent(`Invite sent to ${email}. They will set their own password from the email.`);
        e.currentTarget.reset();
      } else {
        setError(result.error ?? "Could not send the invite.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite admin</CardTitle>
        <CardDescription>
          Sends a Supabase invite email. The new user sets their own password from the link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
          <div>
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" name="email" type="email" placeholder="colleague@example.com" required />
          </div>
          <div>
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              name="role"
              defaultValue="editor"
              className="flex h-11 w-full cursor-pointer rounded-md border border-line bg-graphite px-4 text-sm text-cream focus:border-gold-muted focus:outline-none"
            >
              <option value="editor" className="bg-graphite">Editor</option>
              <option value="admin" className="bg-graphite">Admin</option>
              {canInviteSuperAdmin && (
                <option value="super_admin" className="bg-graphite">Super Admin</option>
              )}
            </select>
          </div>
          <Button type="submit" disabled={isPending}>
            <UserPlus className="h-4 w-4" />
            {isPending ? "Sending…" : "Send invite"}
          </Button>
        </form>
        {error && (
          <p className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}
        {sent && (
          <p className="mt-4 rounded-md border border-gold-muted/40 bg-gold/10 px-4 py-3 text-sm text-gold-light">
            {sent}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
