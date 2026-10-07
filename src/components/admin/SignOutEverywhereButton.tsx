"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutEverywhere } from "@/app/admin/actions";

export function SignOutEverywhereButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (
      !window.confirm(
        "Sign out every session on every device, including this one? You will need to sign in again."
      )
    )
      return;
    setError(null);
    startTransition(async () => {
      const result = await signOutEverywhere();
      if (result.ok) {
        router.push("/admin/login");
        router.refresh();
      } else {
        setError(result.error ?? "Could not sign out everywhere.");
      }
    });
  }

  return (
    <span className="inline-flex flex-col items-start gap-2">
      <Button
        type="button"
        variant="dark"
        disabled={isPending}
        onClick={handleClick}
        className="border-red-500/40 text-red-300 hover:border-red-500/70"
      >
        <LogOut className="h-4 w-4" />
        {isPending ? "Signing out…" : "Sign out all sessions"}
      </Button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </span>
  );
}
