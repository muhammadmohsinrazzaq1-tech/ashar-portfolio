import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";
import {
  createBlogCategory,
  deleteBlogCategory,
  createBlogTag,
  deleteBlogTag,
} from "@/app/admin/actions";

export const metadata = { title: "Categories & tags | Admin" };

export default async function AdminBlogTaxonomyPage() {
  const supabase = await createServerSupabaseClient();
  const [{ data: categories }, { data: tags }, { data: posts }] = await Promise.all([
    supabase.from("blog_categories").select("id, name").order("name"),
    supabase.from("blog_tags").select("id, name").order("name"),
    supabase.from("blog_posts").select("id, category_id"),
  ]);

  const categoryCounts = new Map<string, number>();
  for (const p of posts ?? []) {
    if (p.category_id) {
      categoryCounts.set(p.category_id, (categoryCounts.get(p.category_id) ?? 0) + 1);
    }
  }

  return (
    <div>
      <PageHeader
        title="Categories & tags"
        description="Organize blog posts. Deleting a category or tag never deletes posts."
        backHref="/admin/blog"
        backLabel="All posts"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <TaxonomyManager
          title="Categories"
          description="One category per post."
          itemLabel="Category"
          placeholder="e.g. YouTube Automation"
          items={(categories ?? []).map((c) => ({
            id: c.id,
            name: c.name,
            postCount: categoryCounts.get(c.id) ?? 0,
          }))}
          createAction={createBlogCategory}
          deleteAction={deleteBlogCategory}
        />
        <TaxonomyManager
          title="Tags"
          description="Free-form labels; posts can have many."
          itemLabel="Tag"
          placeholder="e.g. ai"
          items={(tags ?? []).map((t) => ({ id: t.id, name: t.name }))}
          createAction={createBlogTag}
          deleteAction={deleteBlogTag}
        />
      </div>
    </div>
  );
}
