"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/app/admin/actions";

interface ConfirmButtonProps {
  /** Server action receiving a FormData with the `id` field. */
  action: (fd: FormData) => Promise<ActionResult>;
  id: string;
  /** When provided, a window.confirm gate is shown first. */
  confirmMessage?: string;
  title?: string;
  children: ReactNode;
  variant?: "default" | "outline" | "ghost" | "dark";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ConfirmButton({
  action,
  id,
  confirmMessage,
  title,
  children,
  variant = "ghost",
  size = "sm",
  className,
}: ConfirmButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      const result = await action(fd);
      if (!result.ok) setError(result.error ?? "Something went wrong.");
    });
  }

  return (
    <span className="inline-flex flex-col items-end">
      <Button
        type="button"
        variant={variant}
        size={size}
        title={title}
        disabled={isPending}
        onClick={handleClick}
        className={className}
      >
        {children}
      </Button>
      {error && (
        <span className="mt-1 max-w-[220px] text-right text-xs text-red-400">
          {error}
        </span>
      )}
    </span>
  );
}
