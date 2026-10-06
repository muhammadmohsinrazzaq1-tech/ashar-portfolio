import { Archive, ArchiveRestore, Image as ImageIcon, Trash2, UserCircle2 } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { MediaUploadForm } from "@/components/admin/MediaUploadForm";
import { MediaAltEditor } from "@/components/admin/MediaAltEditor";
import { Badge } from "@/components/ui/badge";
import {
  uploadMedia,
  updateMediaAlt,
  toggleMediaStatus,
  deleteMedia,
  setProfileImage,
  setLogoImage,
} from "@/app/admin/actions";

export const metadata = { title: "Media Library | Admin" };

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminMediaPage() {
  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Media Library"
        description="Upload images and PDFs. Archive items to hide them without deleting, or set an image as the profile photo."
      />
      <div className="grid gap-8">
        <MediaUploadForm action={uploadMedia} />
        <DataTable
          columns={[
            {
              key: "preview",
              header: "Preview",
              render: (r) =>
                r.media_type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.public_url}
                    alt={r.alt_text || r.file_name}
                    className="h-12 w-12 rounded-md border border-line object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-md border border-line bg-graphite text-[10px] font-bold uppercase text-sand">
                    PDF
                  </span>
                ),
            },
            {
              key: "file",
              header: "File",
              render: (r) => (
                <span>
                  <span className="block max-w-[220px] truncate font-semibold" title={r.file_name}>
                    {r.file_name}
                  </span>
                  <span className="block text-xs text-sand">
                    {formatBytes(r.file_size)} · {r.mime_type}
                  </span>
                </span>
              ),
            },
            {
              key: "alt",
              header: "Alt text",
              render: (r) => (
                <MediaAltEditor id={r.id} initialAlt={r.alt_text ?? ""} action={updateMediaAlt} />
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (r) =>
                r.status === "active" ? (
                  <Badge>Active</Badge>
                ) : (
                  <Badge variant="muted">{r.status}</Badge>
                ),
            },
          ]}
          rows={rows ?? []}
          rowActions={(row) => (
            <>
              {row.media_type === "image" && (
                <>
                  <ConfirmButton
                    action={setProfileImage}
                    id={row.id}
                    title="Set as profile image"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <UserCircle2 className="h-4 w-4 text-gold-light" />
                  </ConfirmButton>
                  <ConfirmButton
                    action={setLogoImage}
                    id={row.id}
                    title="Set as logo"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <ImageIcon className="h-4 w-4 text-gold-light" />
                  </ConfirmButton>
                </>
              )}
              <ConfirmButton
                action={toggleMediaStatus}
                id={row.id}
                title={row.status === "active" ? "Archive" : "Restore"}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                {row.status === "active" ? (
                  <Archive className="h-4 w-4" />
                ) : (
                  <ArchiveRestore className="h-4 w-4 text-gold-light" />
                )}
              </ConfirmButton>
              <ConfirmButton
                action={deleteMedia}
                id={row.id}
                confirmMessage={`Permanently delete "${row.file_name}"? This removes the file from storage.`}
                title="Delete permanently"
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
              title="No media yet"
              message="Upload your first image or PDF using the form above."
            />
          }
        />
      </div>
    </div>
  );
}
