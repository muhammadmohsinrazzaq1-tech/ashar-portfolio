"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

interface UserRowActionsProps {
  userId: string;
  email: string;
  role: string;
  isSelf: boolean;
  canManageRoles: boolean;
  updateRoleAction: (fd: FormData) => Promise<ActionResult>;
  removeAction: (fd: FormData) => Promise<ActionResult>;
}

export function UserRowActions({
  userId,
  email,
  role,
  isSelf,
  canManageRoles,
  updateRoleAction,
  removeAction,
}: UserRowActionsProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function changeRole(nextRole: string) {
    if (nextRole === role) return;
    if (
      !window.confirm(
        `Change ${email}'s role from ${role} to ${nextRole}?`
      )
    )
      return;
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", userId);
      fd.set("role", nextRole);
      const result = await updateRoleAction(fd);
      if (!result.ok) setError(result.error ?? "Could not update the role.");
    });
  }

  function remove() {
    if (
      !window.confirm(
        `Remove ${email}'s admin access and delete their auth account? This cannot be undone.`
      )
    )
      return;
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", userId);
      const result = await removeAction(fd);
      if (!result.ok) setError(result.error ?? "Could not remove the user.");
    });
  }

  if (isSelf) {
    return <span className="text-xs text-sand/70">This is you</span>;
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <span className="inline-flex items-center gap-1.5">
        {canManageRoles && (
          <select
            value={role}
            disabled={isPending}
            onChange={(e) => changeRole(e.target.value)}
            title="Change role (super_admin only)"
            className="h-8 cursor-pointer rounded-md border border-line bg-graphite px-2 text-xs text-cream focus:border-gold-muted focus:outline-none"
          >
            <option value="editor" className="bg-graphite">editor</option>
            <option value="admin" className="bg-graphite">admin</option>
            <option value="super_admin" className="bg-graphite">super_admin</option>
          </select>
        )}
        {canManageRoles && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Remove user"
            disabled={isPending}
            onClick={remove}
            className="h-8 w-8 text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </span>
      {error && <span className="max-w-[220px] text-right text-xs text-red-400">{error}</span>}
    </span>
  );
}
