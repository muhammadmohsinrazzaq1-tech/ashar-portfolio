"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Plus, Pencil, Eye, EyeOff, X, Trash2 } from "lucide-react";
import type { ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "./DataTable";
import { EmptyState } from "./EmptyState";
import { ConfirmButton } from "./ConfirmButton";
import { AdminField, type FieldConfig } from "./form-fields";

interface ResourceManagerProps {
  /** Singular label, e.g. "Skill". */
  resourceName: string;
  description?: string;
  columns: Column[];
  fields: FieldConfig[];
  rows: Record<string, any>[];
  createAction: (fd: FormData) => Promise<ActionResult>;
  updateAction: (fd: FormData) => Promise<ActionResult>;
  deleteAction: (fd: FormData) => Promise<ActionResult>;
  /** Optional publish toggle. */
  toggleAction?: (fd: FormData) => Promise<ActionResult>;
  toggleField?: string;
  emptyTitle: string;
  emptyMessage: string;
  /** Extra content rendered above the table (e.g. integrity notices). */
  headerNote?: ReactNode;
}

export function ResourceManager({
  resourceName,
  description,
  columns,
  fields,
  rows,
  createAction,
  updateAction,
  deleteAction,
  toggleAction,
  toggleField = "is_published",
  emptyTitle,
  emptyMessage,
  headerNote,
}: ResourceManagerProps) {
  const [editing, setEditing] = useState<Record<string, any> | "new" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isCreating = editing === "new";
  const editingRow = editing !== null && editing !== "new" ? editing : null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = isCreating ? await createAction(fd) : await updateAction(fd);
      if (result.ok) {
        setEditing(null);
      } else {
        setFormError(result.error ?? "Could not save. Please try again.");
      }
    });
  }

  function rowActions(row: Record<string, any>) {
    return (
      <>
        {toggleAction && (
          <ConfirmButton
            action={toggleAction}
            id={row.id}
            title={row[toggleField] ? "Unpublish" : "Publish"}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            {row[toggleField] ? (
              <Eye className="h-4 w-4 text-gold" />
            ) : (
              <EyeOff className="h-4 w-4 text-sand" />
            )}
          </ConfirmButton>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={`Edit ${resourceName.toLowerCase()}`}
          className="h-8 w-8"
          onClick={() => {
            setFormError(null);
            setEditing(row);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <ConfirmButton
          action={deleteAction}
          id={row.id}
          confirmMessage={`Delete this ${resourceName.toLowerCase()}? This cannot be undone.`}
          title="Delete"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-400 hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
        </ConfirmButton>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-sand">
            {description ?? `Manage ${resourceName.toLowerCase()} entries.`}
          </p>
          <Badge variant="muted" className="mt-2">
            {rows.length} total
          </Badge>
        </div>
        {!editing && (
          <Button onClick={() => { setFormError(null); setEditing("new"); }}>
            <Plus className="h-4 w-4" /> New {resourceName}
          </Button>
        )}
      </div>

      {headerNote}

      {editing ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>
              {isCreating ? `New ${resourceName}` : `Edit ${resourceName}`}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setEditing(null)}
              title="Close form"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              {!isCreating && editingRow && (
                <input type="hidden" name="id" value={editingRow.id} />
              )}
              {fields.map((f) => (
                <div
                  key={f.name}
                  className={f.type === "textarea" || f.type === "multiline" ? "md:col-span-2" : ""}
                >
                  <AdminField field={f} value={editingRow?.[f.name]} />
                </div>
              ))}
              {formError && (
                <p className="md:col-span-2 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {formError}
                </p>
              )}
              <div className="flex gap-3 md:col-span-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving…" : isCreating ? `Create ${resourceName}` : "Save changes"}
                </Button>
                <Button
                  type="button"
                  variant="dark"
                  disabled={isPending}
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowActions={rowActions}
          empty={
            <EmptyState
              title={emptyTitle}
              message={emptyMessage}
              action={
                <Button onClick={() => setEditing("new")}>
                  <Plus className="h-4 w-4" /> New {resourceName}
                </Button>
              }
            />
          }
        />
      )}
    </div>
  );
}
