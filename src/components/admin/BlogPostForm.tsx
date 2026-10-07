"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminField } from "./form-fields";

export interface BlogCategory {
  id: string;
  name: string;
}

export interface BlogPostFormProps {
  post?: Record<string, any> | null;
  categories: BlogCategory[];
  initialTags: string;
  saveAction: (fd: FormData) => Promise<ActionResult>;
  mode: "create" | "edit";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function BlogPostForm({
  post,
  categories,
  initialTags,
  saveAction,
  mode,
}: BlogPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState<string>(post?.title ?? "");
  const [slug, setSlug] = useState<string>(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState<boolean>(Boolean(post?.slug));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setTitle(next);
    if (!slugTouched) setSlug(slugify(next));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    // Ensure the controlled slug value is what gets submitted.
    fd.set("slug", slug);
    startTransition(async () => {
      const result = await saveAction(fd);
      if (result.ok) {
        router.push("/admin/blog");
        router.refresh();
      } else {
        setError(result.error ?? "Could not save the post.");
      }
    });
  }

  const publishedAtValue = post?.published_at
    ? new Date(post.published_at).toISOString().slice(0, 16)
    : "";

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid gap-5">
          {mode === "edit" && post && (
            <input type="hidden" name="id" value={post.id} />
          )}

          <div>
            <label
              htmlFor="post-title"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-sand"
            >
              Title <span className="ml-1 text-gold">*</span>
            </label>
            <input
              id="post-title"
              name="title"
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="Post title"
              className="flex h-11 w-full rounded-md border border-line bg-graphite px-4 text-sm text-cream placeholder:text-sand/60 transition-colors focus:border-gold-muted focus:outline-none"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="post-slug"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-sand"
              >
                Slug
              </label>
              <input
                id="post-slug"
                name="slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="auto-generated-from-title"
                className="flex h-11 w-full rounded-md border border-line bg-graphite px-4 text-sm text-cream placeholder:text-sand/60 transition-colors focus:border-gold-muted focus:outline-none"
              />
              <p className="mt-1 text-xs text-sand/80">
                Leave empty to auto-generate from the title.
              </p>
            </div>
            <AdminField
              field={{
                name: "status",
                label: "Status",
                type: "select",
                options: [
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Published" },
                ],
              }}
              value={post?.status ?? "draft"}
            />
          </div>

          <AdminField
            field={{
              name: "excerpt",
              label: "Excerpt",
              type: "textarea",
              rows: 3,
              placeholder: "Short summary shown on cards and previews",
            }}
            value={post?.excerpt ?? ""}
          />

          <AdminField
            field={{
              name: "content",
              label: "Content",
              type: "textarea",
              rows: 14,
              placeholder: "Full post body (Markdown supported)",
            }}
            value={post?.content ?? ""}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <AdminField
              field={{
                name: "category_id",
                label: "Category",
                type: "select",
                options: [
                  { value: "none", label: "No category" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ],
              }}
              value={post?.category_id ?? "none"}
            />
            <AdminField
              field={{
                name: "tags",
                label: "Tags",
                type: "text",
                placeholder: "ai, automation, youtube",
                hint: "Comma-separated. New tags are created automatically.",
              }}
              value={initialTags}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <AdminField
              field={{
                name: "cover_image_url",
                label: "Cover image URL",
                type: "url",
                placeholder: "https://…",
              }}
              value={post?.cover_image_url ?? ""}
            />
            <div>
              <label
                htmlFor="post-published-at"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-sand"
              >
                Publish date
              </label>
              <input
                id="post-published-at"
                name="published_at"
                type="datetime-local"
                defaultValue={publishedAtValue}
                className="flex h-11 w-full rounded-md border border-line bg-graphite px-4 text-sm text-cream transition-colors focus:border-gold-muted focus:outline-none"
              />
              <p className="mt-1 text-xs text-sand/80">
                Defaults to now when publishing.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <AdminField
              field={{
                name: "seo_title",
                label: "SEO title",
                type: "text",
                placeholder: "Defaults to the post title",
              }}
              value={post?.seo_title ?? ""}
            />
            <AdminField
              field={{
                name: "seo_description",
                label: "SEO description",
                type: "textarea",
                rows: 3,
                placeholder: "Meta description for search results",
              }}
              value={post?.seo_description ?? ""}
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving…"
                : mode === "create"
                  ? "Create post"
                  : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="dark"
              disabled={isPending}
              onClick={() => router.push("/admin/blog")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
