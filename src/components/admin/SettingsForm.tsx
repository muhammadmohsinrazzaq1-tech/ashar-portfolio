"use client";

import { useState, useTransition, type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import type { ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminField, type FieldConfig } from "./form-fields";

interface SettingsFormProps {
  title: string;
  description?: string;
  fields: FieldConfig[];
  /** Current values keyed by field name. */
  values: Record<string, string>;
  action: (fd: FormData) => Promise<ActionResult>;
  /** Extra hidden inputs (e.g. settings_group). */
  hidden?: Record<string, string>;
  submitLabel?: string;
  note?: ReactNode;
}

/** Generic key/value settings form bound to a server action. */
export function SettingsForm({
  title,
  description,
  fields,
  values,
  action,
  hidden,
  submitLabel = "Save changes",
  note,
}: SettingsFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(fd);
      if (result.ok) setSaved(true);
      else setError(result.error ?? "Could not save. Please try again.");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-5">
          {hidden &&
            Object.entries(hidden).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
          {fields.map((f) => (
            <AdminField key={f.name} field={f} value={values[f.name] ?? ""} />
          ))}
          {note}
          {error && (
            <p className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}
          {saved && (
            <p className="flex items-center gap-2 rounded-md border border-gold-muted/40 bg-gold/10 px-4 py-3 text-sm text-gold-light">
              <CheckCircle2 className="h-4 w-4" /> Saved successfully.
            </p>
          )}
          <div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
