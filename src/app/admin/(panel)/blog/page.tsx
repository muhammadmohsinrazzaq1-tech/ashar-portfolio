import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteBlogPost } from "@/app/admin/actions";

export const metadata = { title: "Blog | Admin" };

export default async function AdminBlogPage() {
  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("blog_posts")
    .select("id, title, slug, status, published_at, updated_at, blog_categories(name)")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Blog"
        description="Write and publish posts for the portfolio blog."
        action={
          <div className="flex gap-2">
            <Link href="/admin/blog/categories">
              <Button variant="dark" size="sm">Categories & tags</Button>
            </Link>
            <Link href="/admin/blog/new">
              <Button size="sm">
                <Plus className="h-4 w-4" /> New post
              </Button>
            </Link>
          </div>
        }
      />
      <DataTable
        columns={[
          {
            key: "title",
            header: "Post",
            render: (r) => (
              <span>
                <span className="block font-semibold">{r.title}</span>
                <span className="block text-xs text-sand">
                  /{r.slug}
                  {r.blog_categories?.name ? ` · ${r.blog_categories.name}` : ""}
                </span>
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (r) =>
              r.status === "published" ? (
                <Badge>Published</Badge>
              ) : (
                <Badge variant="muted">Draft</Badge>
              ),
          },
          {
            key: "published_at",
            header: "Published",
            render: (r) =>
              r.published_at
                ? new Date(r.published_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : <span className="text-sand/60">—</span>,
          },
        ]}
        rows={rows ?? []}
        rowActions={(row) => (
          <>
            <Link href={`/admin/blog/${row.id}`}>
              <Button type="button" variant="ghost" size="icon" title="Edit post" className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <ConfirmButton
              action={deleteBlogPost}
              id={row.id}
              confirmMessage={`Delete "${row.title}"? This cannot be undone.`}
              title="Delete post"
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
            title="No blog posts yet"
            message="Write your first post to start the blog."
            action={
              <Link href="/admin/blog/new">
                <Button>
                  <Plus className="h-4 w-4" /> New post
                </Button>
              </Link>
            }
          />
        }
      />
    </div>
  );
}
