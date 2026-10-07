"use client";

import { useState, useTransition } from "react";
import { Pencil, Check } from "lucide-react";
import type { ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MediaAltEditor({
  id,
  initialAlt,
  action,
}: {
  id: string;
  initialAlt: string;
  action: (fd: FormData) => Promise<ActionResult>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialAlt);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("alt_text", value);
      const result = await action(fd);
      if (result.ok) setEditing(false);
      else setError(result.error ?? "Could not save alt text.");
    });
  }

  if (!editing) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-sand">{initialAlt || "—"}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Edit alt text"
          className="h-6 w-6"
          onClick={() => setEditing(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Alt text"
          className="h-8 w-48 text-xs"
        />
        <Button
          type="button"
          variant="dark"
          size="icon"
          title="Save alt text"
          className="h-8 w-8"
          disabled={isPending}
          onClick={handleSave}
        >
          <Check className="h-4 w-4" />
        </Button>
      </span>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </span>
  );
}
