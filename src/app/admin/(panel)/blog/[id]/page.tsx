import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { updateBlogPost } from "@/app/admin/actions";

export const metadata = { title: "Edit post | Admin" };

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();
  if (!post) notFound();

  const { data: categories } = await supabase
    .from("blog_categories")
    .select("id, name")
    .order("name");

  const { data: tagLinks } = await supabase
    .from("blog_post_tags")
    .select("blog_tags(name)")
    .eq("post_id", id);
  const initialTags = (tagLinks ?? [])
    .map((t) => (t.blog_tags as unknown as { name: string } | null)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <PageHeader
        title="Edit post"
        description={`Editing “${post.title}”.`}
        backHref="/admin/blog"
        backLabel="All posts"
      />
      <BlogPostForm
        mode="edit"
        post={post}
        categories={categories ?? []}
        initialTags={initialTags}
        saveAction={updateBlogPost}
      />
    </div>
  );
}
