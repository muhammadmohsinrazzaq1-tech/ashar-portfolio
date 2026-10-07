"use client";

import { useRef, useState, useTransition } from "react";
import { Upload } from "lucide-react";
import type { ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminField } from "./form-fields";

const MAX_BYTES = 10 * 1024 * 1024;

export function ResumeUploadForm({
  action,
}: {
  action: (fd: FormData) => Promise<ActionResult>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError("Choose a PDF file to upload.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File must be 10 MB or smaller.");
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed for the CV.");
      return;
    }
    startTransition(async () => {
      const result = await action(fd);
      if (result.ok) {
        formRef.current?.reset();
        setFileName(null);
      } else {
        setError(result.error ?? "Upload failed.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload new CV version</CardTitle>
        <CardDescription>
          PDF only, up to 10 MB. Mark it as current to make it the downloadable CV.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-5">
          <div>
            <label
              htmlFor="resume-file"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-sand"
            >
              PDF file <span className="ml-1 text-gold">*</span>
            </label>
            <input
              id="resume-file"
              name="file"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              className="flex h-11 w-full cursor-pointer items-center rounded-md border border-line bg-graphite px-4 text-sm text-cream file:mr-4 file:cursor-pointer file:rounded file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink"
            />
            {fileName && <p className="mt-1 text-xs text-sand/80">{fileName}</p>}
          </div>
          <AdminField
            field={{
              name: "label",
              label: "Version label",
              type: "text",
              placeholder: "e.g. CV 2026 — YouTube Automation",
              hint: "Defaults to the file name.",
            }}
          />
          <AdminField
            field={{
              name: "set_current",
              label: "Set as current CV",
              type: "checkbox",
              hint: "Replaces the currently published CV.",
            }}
          />
          {error && (
            <p className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}
          <div>
            <Button type="submit" disabled={isPending}>
              <Upload className="h-4 w-4" />
              {isPending ? "Uploading…" : "Upload CV"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
