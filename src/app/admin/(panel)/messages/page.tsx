import Link from "next/link";
import { Eye, Trash2 } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteMessage } from "@/app/admin/actions";

export const metadata = { title: "Messages | Admin" };

export default async function AdminMessagesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, is_read, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Contact form submissions from the public site."
      />
      <DataTable
        columns={[
          {
            key: "from",
            header: "From",
            render: (r) => (
              <span>
                <span className={`block ${r.is_read ? "" : "font-bold text-cream"}`}>
                  {r.name}
                </span>
                <span className="block text-xs text-sand">{r.email}</span>
              </span>
            ),
          },
          {
            key: "subject",
            header: "Subject",
            render: (r) => (
              <Link
                href={`/admin/messages/${r.id}`}
                className={`hover:text-gold-light hover:underline ${r.is_read ? "text-sand" : "font-semibold text-cream"}`}
              >
                {r.subject || "(no subject)"}
              </Link>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (r) =>
              r.is_read ? (
                <Badge variant="muted">Read</Badge>
              ) : (
                <Badge>Unread</Badge>
              ),
          },
          {
            key: "received",
            header: "Received",
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
            <Link href={`/admin/messages/${row.id}`}>
              <Button type="button" variant="ghost" size="icon" title="View message" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <ConfirmButton
              action={deleteMessage}
              id={row.id}
              confirmMessage="Delete this message? This cannot be undone."
              title="Delete message"
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
            title="No messages yet"
            message="Contact form submissions will appear here."
          />
        }
      />
    </div>
  );
}
