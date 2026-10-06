import { Trash2, Star, FileText, ExternalLink } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { ResumeUploadForm } from "@/components/admin/ResumeUploadForm";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSiteSettings } from "@/app/admin/settings";
import { DEFAULT_SETTINGS } from "@/lib/site-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  uploadResume,
  setCurrentResume,
  deleteResume,
  updateSiteSettings,
} from "@/app/admin/actions";

const RESUME_TEXT_KEYS = [
  "resume_page_title",
  "resume_back_label",
  "resume_summary_heading",
  "resume_skills_heading",
  "resume_experience_heading",
  "resume_education_heading",
] as const;

export const metadata = { title: "CV / Resume | Admin" };

export default async function AdminCvPage() {
  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("resume_assets")
    .select("id, label, is_current, created_at, media_assets(file_name, public_url, file_size)")
    .order("created_at", { ascending: false });

  const textValues = await getSiteSettings(
    [...RESUME_TEXT_KEYS],
    Object.fromEntries(RESUME_TEXT_KEYS.map((k) => [k, DEFAULT_SETTINGS[k] ?? ""]))
  );

  return (
    <div>
      <PageHeader
        title="CV / Resume"
        description="Manage downloadable CV versions. Exactly one version should be marked current."
      />
      <div className="grid gap-8">
        <SettingsForm
          title="Resume page text"
          hidden={{ settings_group: "resume" }}
          values={textValues}
          action={updateSiteSettings}
          fields={[
            { name: "resume_page_title", label: "Browser tab title", type: "text" },
            { name: "resume_back_label", label: "“Back” link label", type: "text" },
            { name: "resume_summary_heading", label: "Summary heading", type: "text" },
            { name: "resume_skills_heading", label: "Skills heading", type: "text" },
            { name: "resume_experience_heading", label: "Experience heading", type: "text" },
            { name: "resume_education_heading", label: "Education heading", type: "text" },
          ]}
        />
        <ResumeUploadForm action={uploadResume} />
        <DataTable
          columns={[
            {
              key: "label",
              header: "Version",
              render: (r) => (
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-sand" />
                  <span>
                    <span className="block font-semibold">{r.label}</span>
                    <span className="block text-xs text-sand">
                      {r.media_assets?.file_name ?? "—"}
                    </span>
                  </span>
                </span>
              ),
            },
            {
              key: "current",
              header: "Status",
              render: (r) =>
                r.is_current ? (
                  <Badge>
                    <Star className="mr-1 h-3 w-3" /> Current
                  </Badge>
                ) : (
                  <Badge variant="muted">Archived version</Badge>
                ),
            },
            {
              key: "created",
              header: "Uploaded",
              render: (r) =>
                new Date(r.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
            },
          ]}
          rows={rows ?? []}
          rowActions={(row) => (
            <>
              {row.media_assets?.public_url && (
                <a
                  href={row.media_assets.public_url}
                  target="_blank"
                  rel="noreferrer"
                  title="Open PDF"
                >
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {!row.is_current && (
                <ConfirmButton
                  action={setCurrentResume}
                  id={row.id}
                  title="Set as current CV"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Star className="h-4 w-4 text-gold-light" />
                </ConfirmButton>
              )}
              <ConfirmButton
                action={deleteResume}
                id={row.id}
                confirmMessage={`Delete CV version "${row.label}"? The file is removed from storage too.`}
                title="Delete version"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </ConfirmButton>
            </>
          )}
          empty={
            <EmptyState
              title="No CV uploaded yet"
              message="Upload a PDF version of the CV using the form above."
            />
          }
        />
      </div>
    </div>
  );
}
