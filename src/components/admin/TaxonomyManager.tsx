"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

interface TaxonomyManagerProps {
  title: string;
  description: string;
  items: { id: string; name: string; postCount?: number }[];
  createAction: (fd: FormData) => Promise<ActionResult>;
  deleteAction: (fd: FormData) => Promise<ActionResult>;
  itemLabel: string;
  placeholder: string;
}

export function TaxonomyManager({
  title,
  description,
  items,
  createAction,
  deleteAction,
  itemLabel,
  placeholder,
}: TaxonomyManagerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    if (!name) {
      setError(`${itemLabel} name is required.`);
      return;
    }
    startTransition(async () => {
      const result = await createAction(fd);
      if (result.ok) {
        e.currentTarget.reset();
      } else {
        setError(result.error ?? `Could not create ${itemLabel.toLowerCase()}.`);
      }
    });
  }

  return (
    <div className="rounded-xl border border-line bg-charcoal p-6">
      <h2 className="font-display text-xl font-semibold tracking-wide text-cream">
        {title}
      </h2>
      <p className="mb-5 mt-1 text-sm text-sand">{description}</p>

      <form onSubmit={handleSubmit} className="mb-5 flex gap-2">
        <Input name="name" placeholder={placeholder} className="flex-1" />
        <Button type="submit" disabled={isPending} size="sm" className="shrink-0">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </form>
      {error && (
        <p className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-sand/70">None yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-md border border-line bg-graphite px-4 py-2.5"
            >
              <span className="flex items-center gap-2 text-sm text-cream">
                {item.name}
                {typeof item.postCount === "number" && (
                  <Badge variant="muted">{item.postCount} posts</Badge>
                )}
              </span>
              <ConfirmButton
                action={deleteAction}
                id={item.id}
                confirmMessage={`Delete ${itemLabel.toLowerCase()} "${item.name}"? Posts will keep working but lose this ${itemLabel.toLowerCase()}.`}
                title={`Delete ${itemLabel.toLowerCase()}`}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </ConfirmButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
