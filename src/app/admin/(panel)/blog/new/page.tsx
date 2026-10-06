import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { createBlogPost } from "@/app/admin/actions";

export const metadata = { title: "New post | Admin" };

export default async function AdminBlogNewPage() {
  const supabase = await createServerSupabaseClient();
  const { data: categories } = await supabase
    .from("blog_categories")
    .select("id, name")
    .order("name");

  return (
    <div>
      <PageHeader
        title="New post"
        description="Draft a post. Publish it when it's ready for the public blog."
        backHref="/admin/blog"
        backLabel="All posts"
      />
      <BlogPostForm
        mode="create"
        categories={categories ?? []}
        initialTags=""
        saveAction={createBlogPost}
      />
    </div>
  );
}
