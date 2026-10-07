import type { MetadataRoute } from "next";
import {
  createServiceRoleClient,
  isSupabaseConfigured,
} from "@/lib/supabase";

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

interface BlogRow {
  slug: string;
  updated_at: string | null;
  published_at: string | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();

  const routes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  // Include published blog posts from Supabase (best-effort).
  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createServiceRoleClient();
      if (supabase) {
        // 15s cap: a stalled DB call must not fail the production build —
        // the catch below falls back to the static routes.
        const { data, error } = await supabase
          .from("blog_posts")
          .select("slug, updated_at, published_at")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(1000)
          .abortSignal(AbortSignal.timeout(15000));
        if (!error && Array.isArray(data)) {
          for (const row of data as BlogRow[]) {
            if (!row.slug) continue;
            const lastModified = row.updated_at
              ? new Date(row.updated_at)
              : new Date();
            routes.push({
              url: `${base}/blog/${row.slug}`,
              lastModified,
              changeFrequency: "monthly",
              priority: 0.6,
            });
          }
        }
      }
    } catch {
      // Best-effort: sitemap falls back to static routes only.
    }
  }

  return routes;
}
