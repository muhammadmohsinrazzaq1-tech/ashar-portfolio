"use server";

import { revalidatePath } from "next/cache";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from "@/lib/supabase";
import {
  requireRole,
  logAudit,
  type AdminRole,
  type AdminSession,
} from "@/lib/admin-auth";
import { defaultSections } from "@/lib/content";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const ok = (): ActionResult => ({ ok: true });
const fail = (error: string): ActionResult => ({ ok: false, error });

/* ------------------------------------------------------------------ */
/* Form helpers                                                        */
/* ------------------------------------------------------------------ */

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function intOrNull(fd: FormData, key: string): number | null {
  const raw = str(fd, key);
  if (raw === "") return null;
  const n = Number.parseInt(raw, 10);
  return Number.isNaN(n) ? null : n;
}

function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1";
}

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/* ------------------------------------------------------------------ */
/* Generic CRUD engine                                                 */
/* ------------------------------------------------------------------ */

interface CrudConfig {
  table: string;
  adminPath: string;
  /** Also revalidate the public site when this content changes. */
  publicRevalidate?: boolean;
  minRole?: AdminRole;
  /** Plain text fields (empty string stored as-is unless nullable). */
  fields: string[];
  bools?: string[];
  ints?: string[];
  /** Textarea fields stored as text[] (one entry per line). */
  arrays?: string[];
  /** JSON-validated fields. */
  json?: string[];
  /** Fields where an empty string becomes NULL. */
  nullable?: string[];
}

function parseCrudForm(
  fd: FormData,
  cfg: CrudConfig
): { row: Record<string, unknown> } | { error: string } {
  const row: Record<string, unknown> = {};
  const nullable = new Set(cfg.nullable ?? []);

  for (const key of cfg.fields) {
    const value = str(fd, key);
    row[key] = value === "" && nullable.has(key) ? null : value;
  }
  for (const key of cfg.bools ?? []) row[key] = bool(fd, key);
  for (const key of cfg.ints ?? []) row[key] = intOrNull(fd, key);
  for (const key of cfg.arrays ?? []) row[key] = splitLines(str(fd, key));
  for (const key of cfg.json ?? []) {
    const raw = str(fd, key);
    if (raw === "") {
      row[key] = nullable.has(key) ? null : {};
      continue;
    }
    try {
      row[key] = JSON.parse(raw);
    } catch {
      return { error: `Field "${key}" must contain valid JSON.` };
    }
  }
  return { row };
}

async function crudCreate(
  cfg: CrudConfig,
  fd: FormData
): Promise<ActionResult> {
  const auth = await requireRole(cfg.minRole ?? "editor");
  if (!auth.ok) return auth;
  const parsed = parseCrudForm(fd, cfg);
  if ("error" in parsed) return fail(parsed.error);

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from(cfg.table)
    .insert(parsed.row)
    .select("id")
    .single();
  if (error) return fail(error.message);

  await logAudit("create", cfg.table, data?.id, { by: auth.session.email });
  revalidatePath(cfg.adminPath);
  if (cfg.publicRevalidate) revalidatePath("/");
  return ok();
}

async function crudUpdate(
  cfg: CrudConfig,
  fd: FormData
): Promise<ActionResult> {
  const auth = await requireRole(cfg.minRole ?? "editor");
  if (!auth.ok) return auth;
  const id = str(fd, "id");
  if (!id) return fail("Missing record id.");
  const parsed = parseCrudForm(fd, cfg);
  if ("error" in parsed) return fail(parsed.error);

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from(cfg.table).update(parsed.row).eq("id", id);
  if (error) return fail(error.message);

  await logAudit("update", cfg.table, id, { by: auth.session.email });
  revalidatePath(cfg.adminPath);
  if (cfg.publicRevalidate) revalidatePath("/");
  return ok();
}

async function crudDelete(
  cfg: CrudConfig,
  fd: FormData
): Promise<ActionResult> {
  const auth = await requireRole(cfg.minRole ?? "editor");
  if (!auth.ok) return auth;
  const id = str(fd, "id");
  if (!id) return fail("Missing record id.");

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from(cfg.table).delete().eq("id", id);
  if (error) return fail(error.message);

  await logAudit("delete", cfg.table, id, { by: auth.session.email });
  revalidatePath(cfg.adminPath);
  if (cfg.publicRevalidate) revalidatePath("/");
  return ok();
}

/** Flips a boolean column (default `is_published`) on a row. */
async function crudToggle(
  table: string,
  adminPath: string,
  fd: FormData,
  column = "is_published",
  minRole: AdminRole = "editor",
  publicRevalidate = true
): Promise<ActionResult> {
  const auth = await requireRole(minRole);
  if (!auth.ok) return auth;
  const id = str(fd, "id");
  if (!id) return fail("Missing record id.");

  const supabase = await createServerSupabaseClient();
  const { data: current, error: readError } = await supabase
    .from(table)
    .select(`id, ${column}`)
    .eq("id", id)
    .single();
  if (readError || !current) return fail(readError?.message ?? "Record not found.");

  const nextValue = !Boolean((current as unknown as Record<string, unknown>)[column]);
  const { error } = await supabase
    .from(table)
    .update({ [column]: nextValue })
    .eq("id", id);
  if (error) return fail(error.message);

  await logAudit("toggle", table, id, {
    column,
    value: nextValue,
    by: auth.session.email,
  });
  revalidatePath(adminPath);
  if (publicRevalidate) revalidatePath("/");
  return ok();
}

/* ------------------------------------------------------------------ */
/* Content resources (editor+ can manage)                              */
/* ------------------------------------------------------------------ */

const SKILLS_CFG: CrudConfig = {
  table: "skills",
  adminPath: "/admin/skills",
  publicRevalidate: true,
  fields: ["title", "description", "icon"],
  bools: ["is_published"],
  ints: ["display_order"],
};
export async function createSkill(fd: FormData) {
  return crudCreate(SKILLS_CFG, fd);
}
export async function updateSkill(fd: FormData) {
  return crudUpdate(SKILLS_CFG, fd);
}
export async function deleteSkill(fd: FormData) {
  return crudDelete(SKILLS_CFG, fd);
}
export async function toggleSkillPublish(fd: FormData) {
  return crudToggle("skills", "/admin/skills", fd);
}

const EXPERIENCE_CFG: CrudConfig = {
  table: "experience",
  adminPath: "/admin/experience",
  publicRevalidate: true,
  fields: ["company", "role", "duration", "status"],
  arrays: ["responsibilities", "achievements"],
  bools: ["is_published"],
  ints: ["display_order"],
};
export async function createExperience(fd: FormData) {
  return crudCreate(EXPERIENCE_CFG, fd);
}
export async function updateExperience(fd: FormData) {
  return crudUpdate(EXPERIENCE_CFG, fd);
}
export async function deleteExperience(fd: FormData) {
  return crudDelete(EXPERIENCE_CFG, fd);
}
export async function toggleExperiencePublish(fd: FormData) {
  return crudToggle("experience", "/admin/experience", fd);
}

const SERVICES_CFG: CrudConfig = {
  table: "services",
  adminPath: "/admin/services",
  publicRevalidate: true,
  fields: ["title", "tagline", "value_proposition", "icon"],
  arrays: ["deliverables"],
  bools: ["is_published"],
  ints: ["display_order"],
};
export async function createService(fd: FormData) {
  return crudCreate(SERVICES_CFG, fd);
}
export async function updateService(fd: FormData) {
  return crudUpdate(SERVICES_CFG, fd);
}
export async function deleteService(fd: FormData) {
  return crudDelete(SERVICES_CFG, fd);
}
export async function toggleServicePublish(fd: FormData) {
  return crudToggle("services", "/admin/services", fd);
}

const PROJECTS_CFG: CrudConfig = {
  table: "projects",
  adminPath: "/admin/projects",
  publicRevalidate: true,
  fields: ["title", "category", "objective", "approach", "role", "metrics", "link"],
  arrays: ["tools", "evidence_urls"],
  bools: ["is_published"],
  ints: ["display_order"],
  nullable: ["category", "objective", "approach", "role", "metrics", "link"],
};
export async function createProject(fd: FormData) {
  return crudCreate(PROJECTS_CFG, fd);
}
export async function updateProject(fd: FormData) {
  return crudUpdate(PROJECTS_CFG, fd);
}
export async function deleteProject(fd: FormData) {
  return crudDelete(PROJECTS_CFG, fd);
}
export async function toggleProjectPublish(fd: FormData) {
  return crudToggle("projects", "/admin/projects", fd);
}

const ACHIEVEMENTS_CFG: CrudConfig = {
  table: "achievements",
  adminPath: "/admin/achievements",
  publicRevalidate: true,
  fields: ["suffix", "label", "note"],
  ints: ["value", "display_order"],
  bools: ["is_published"],
  nullable: ["suffix", "note"],
};
export async function createAchievement(fd: FormData) {
  return crudCreate(ACHIEVEMENTS_CFG, fd);
}
export async function updateAchievement(fd: FormData) {
  return crudUpdate(ACHIEVEMENTS_CFG, fd);
}
export async function deleteAchievement(fd: FormData) {
  return crudDelete(ACHIEVEMENTS_CFG, fd);
}
export async function toggleAchievementPublish(fd: FormData) {
  return crudToggle("achievements", "/admin/achievements", fd);
}

const TESTIMONIALS_CFG: CrudConfig = {
  table: "testimonials",
  adminPath: "/admin/testimonials",
  publicRevalidate: true,
  fields: ["author_name", "author_role", "quote"],
  bools: ["is_published"],
  ints: ["display_order"],
  nullable: ["author_role"],
};
export async function createTestimonial(fd: FormData) {
  return crudCreate(TESTIMONIALS_CFG, fd);
}
export async function updateTestimonial(fd: FormData) {
  return crudUpdate(TESTIMONIALS_CFG, fd);
}
export async function deleteTestimonial(fd: FormData) {
  return crudDelete(TESTIMONIALS_CFG, fd);
}
export async function toggleTestimonialPublish(fd: FormData) {
  return crudToggle("testimonials", "/admin/testimonials", fd);
}

const SOCIAL_LINKS_CFG: CrudConfig = {
  table: "social_links",
  adminPath: "/admin/social-links",
  publicRevalidate: true,
  fields: ["key", "label", "url"],
  bools: ["is_published"],
  ints: ["display_order"],
};
export async function createSocialLink(fd: FormData) {
  return crudCreate(SOCIAL_LINKS_CFG, fd);
}
export async function updateSocialLink(fd: FormData) {
  return crudUpdate(SOCIAL_LINKS_CFG, fd);
}
export async function deleteSocialLink(fd: FormData) {
  return crudDelete(SOCIAL_LINKS_CFG, fd);
}
export async function toggleSocialLinkPublish(fd: FormData) {
  return crudToggle("social_links", "/admin/social-links", fd);
}

/* ------------------------------------------------------------------ */
/* Blog posts, categories, tags                                        */
/* ------------------------------------------------------------------ */

function parseBlogPostForm(fd: FormData):
  | { row: Record<string, unknown>; tags: string[] }
  | { error: string } {
  const title = str(fd, "title");
  if (!title) return { error: "Title is required." };
  const slug = slugify(str(fd, "slug") || title);
  if (!slug) return { error: "Could not generate a slug from the title." };
  const status = str(fd, "status");
  if (!["draft", "published"].includes(status))
    return { error: "Status must be draft or published." };

  const categoryId = str(fd, "category_id");
  const publishedAt = str(fd, "published_at");

  const row: Record<string, unknown> = {
    title,
    slug,
    excerpt: str(fd, "excerpt") || null,
    content: str(fd, "content") || null,
    cover_image_url: str(fd, "cover_image_url") || null,
    category_id: categoryId === "" || categoryId === "none" ? null : categoryId,
    status,
    published_at:
      status === "published" ? publishedAt || new Date().toISOString() : null,
    seo_title: str(fd, "seo_title") || null,
    seo_description: str(fd, "seo_description") || null,
  };

  const tags = str(fd, "tags")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20);

  return { row, tags };
}

async function syncPostTags(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  postId: string,
  tags: string[]
): Promise<string | null> {
  // Remove existing links, then upsert tags and re-link.
  const { error: clearError } = await supabase
    .from("blog_post_tags")
    .delete()
    .eq("post_id", postId);
  if (clearError) return clearError.message;

  for (const name of tags) {
    const tagSlug = slugify(name);
    const { data: tag, error: tagError } = await supabase
      .from("blog_tags")
      .upsert({ name, slug: tagSlug }, { onConflict: "name" })
      .select("id")
      .single();
    if (tagError || !tag) return tagError?.message ?? "Could not save tag.";
    const { error: linkError } = await supabase
      .from("blog_post_tags")
      .insert({ post_id: postId, tag_id: tag.id });
    if (linkError) return linkError.message;
  }
  return null;
}

export async function createBlogPost(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("editor");
  if (!auth.ok) return auth;
  const parsed = parseBlogPostForm(fd);
  if ("error" in parsed) return fail(parsed.error);

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .insert(parsed.row)
    .select("id")
    .single();
  if (error) return fail(error.message);

  const tagError = await syncPostTags(supabase, data.id, parsed.tags);
  if (tagError) return fail(tagError);

  await logAudit("create", "blog_posts", data.id, { by: auth.session.email });
  revalidatePath("/admin/blog");
  revalidatePath("/");
  return ok();
}

export async function updateBlogPost(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("editor");
  if (!auth.ok) return auth;
  const id = str(fd, "id");
  if (!id) return fail("Missing post id.");
  const parsed = parseBlogPostForm(fd);
  if ("error" in parsed) return fail(parsed.error);

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("blog_posts")
    .update(parsed.row)
    .eq("id", id);
  if (error) return fail(error.message);

  const tagError = await syncPostTags(supabase, id, parsed.tags);
  if (tagError) return fail(tagError);

  await logAudit("update", "blog_posts", id, { by: auth.session.email });
  revalidatePath("/admin/blog");
  revalidatePath("/");
  return ok();
}

export async function deleteBlogPost(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("editor");
  if (!auth.ok) return auth;
  const id = str(fd, "id");
  if (!id) return fail("Missing post id.");

  const supabase = await createServerSupabaseClient();
  await supabase.from("blog_post_tags").delete().eq("post_id", id);
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return fail(error.message);

  await logAudit("delete", "blog_posts", id, { by: auth.session.email });
  revalidatePath("/admin/blog");
  revalidatePath("/");
  return ok();
}

export async function createBlogCategory(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("editor");
  if (!auth.ok) return auth;
  const name = str(fd, "name");
  if (!name) return fail("Category name is required.");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("blog_categories")
    .insert({ name, slug: slugify(name) });
  if (error) return fail(error.message);
  await logAudit("create", "blog_categories", name, { by: auth.session.email });
  revalidatePath("/admin/blog/categories");
  return ok();
}

export async function deleteBlogCategory(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("editor");
  if (!auth.ok) return auth;
  const id = str(fd, "id");
  if (!id) return fail("Missing category id.");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("blog_categories").delete().eq("id", id);
  if (error) return fail(error.message);
  await logAudit("delete", "blog_categories", id, { by: auth.session.email });
  revalidatePath("/admin/blog/categories");
  return ok();
}

export async function createBlogTag(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("editor");
  if (!auth.ok) return auth;
  const name = str(fd, "name");
  if (!name) return fail("Tag name is required.");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("blog_tags")
    .insert({ name, slug: slugify(name) });
  if (error) return fail(error.message);
  await logAudit("create", "blog_tags", name, { by: auth.session.email });
  revalidatePath("/admin/blog/categories");
  return ok();
}

export async function deleteBlogTag(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("editor");
  if (!auth.ok) return auth;
  const id = str(fd, "id");
  if (!id) return fail("Missing tag id.");
  const supabase = await createServerSupabaseClient();
  await supabase.from("blog_post_tags").delete().eq("tag_id", id);
  const { error } = await supabase.from("blog_tags").delete().eq("id", id);
  if (error) return fail(error.message);
  await logAudit("delete", "blog_tags", id, { by: auth.session.email });
  revalidatePath("/admin/blog/categories");
  return ok();
}

/* ------------------------------------------------------------------ */
/* Site settings (hero, about, contact, SEO)                           */
/* ------------------------------------------------------------------ */

const SETTING_GROUPS: Record<string, { keys: string[]; adminPath: string }> = {
  hero: {
    keys: [
      "hero_name",
      "hero_headline",
      "hero_short_bio",
      "hero_bio",
      "hero_profile_image_url",
      "hero_badge",
      "hero_cta_primary_label",
      "hero_cta_primary_url",
      "hero_cta_secondary_label",
      "hero_cta_secondary_url",
      "hero_cv_label",
      "hero_cv_url",
    ],
    adminPath: "/admin/hero",
  },
  about: {
    keys: [
      "about_bio",
      "about_qualification",
      "about_program",
      "about_institute",
      "about_year",
      "about_highlights",
    ],
    adminPath: "/admin/about",
  },
  contact: {
    keys: [
      "contact_email",
      "contact_phone",
      "contact_location",
      "contact_details_heading",
      "contact_follow_heading",
      "contact_form_button_label",
      "contact_form_label_name",
      "contact_form_label_email",
      "contact_form_label_subject",
      "contact_form_label_message",
      "contact_form_placeholder_name",
      "contact_form_placeholder_email",
      "contact_form_placeholder_subject",
      "contact_form_placeholder_message",
      "contact_form_error_name",
      "contact_form_error_email",
      "contact_form_error_subject",
      "contact_form_error_message",
      "contact_form_send_error",
      "contact_form_network_error",
    ],
    adminPath: "/admin/contact-info",
  },
  appearance: {
    keys: [
      "brand_name",
      "site_tagline",
      "logo_image_url",
      "favicon_url",
      "font_heading",
      "font_body",
      "accent_color",
      "bg_color",
      "animations_enabled",
      "nav_cta_label",
    ],
    adminPath: "/admin/appearance",
  },
  footer: {
    keys: [
      "footer_about",
      "footer_copyright",
      "footer_tagline",
      "footer_nav_heading",
      "footer_connect_heading",
      "footer_links",
    ],
    adminPath: "/admin/footer",
  },
  resume: {
    keys: [
      "resume_page_title",
      "resume_back_label",
      "resume_summary_heading",
      "resume_skills_heading",
      "resume_experience_heading",
      "resume_education_heading",
    ],
    adminPath: "/admin/cv",
  },
  headings: {
    keys: [
      "heading_about_eyebrow",
      "heading_about_title",
      "heading_about_description",
      "heading_skills_eyebrow",
      "heading_skills_title",
      "heading_skills_description",
      "heading_experience_eyebrow",
      "heading_experience_title",
      "heading_experience_description",
      "heading_services_eyebrow",
      "heading_services_title",
      "heading_services_description",
      "heading_projects_eyebrow",
      "heading_projects_title",
      "heading_projects_description",
      "heading_achievements_eyebrow",
      "heading_achievements_title",
      "heading_achievements_description",
      "heading_blog_eyebrow",
      "heading_blog_title",
      "heading_blog_description",
      "heading_testimonials_eyebrow",
      "heading_testimonials_title",
      "heading_testimonials_description",
      "heading_contact_eyebrow",
      "heading_contact_title",
      "heading_contact_description",
    ],
    adminPath: "/admin/section-headings",
  },
  achievements: {
    keys: ["achievements_milestone"],
    adminPath: "/admin/achievements",
  },
  placeholders: {
    keys: [
      "projects_coming_soon_title",
      "projects_coming_soon_body",
      "testimonials_coming_soon_title",
      "testimonials_coming_soon_body",
    ],
    adminPath: "/admin/placeholders",
  },
  seo: {
    keys: ["seo_title", "seo_description", "og_image_url"],
    adminPath: "/admin/seo",
  },
};

/**
 * Settings keys that behave as booleans. An unchecked checkbox submits no
 * value at all, so normalize "" -> "false" and anything truthy -> "true".
 */
const BOOLEAN_SETTING_KEYS = new Set(["animations_enabled"]);

export async function updateSiteSettings(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("editor");
  if (!auth.ok) return auth;
  const group = str(fd, "settings_group");
  const cfg = SETTING_GROUPS[group];
  if (!cfg) return fail("Unknown settings group.");

  const supabase = await createServerSupabaseClient();
  for (const key of cfg.keys) {
    const present = fd.has(key);
    // Only touch keys this form actually submitted — a group may be split
    // across several cards. Unchecked checkboxes submit nothing, so boolean
    // keys are the exception: absent means "false".
    if (!present && !BOOLEAN_SETTING_KEYS.has(key)) continue;
    const raw = str(fd, key);
    const value = BOOLEAN_SETTING_KEYS.has(key)
      ? present && raw !== "false" && raw !== "0"
        ? "true"
        : "false"
      : raw;
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value }, { onConflict: "key" });
    if (error) return fail(`Could not save "${key}": ${error.message}`);
  }

  await logAudit("settings.update", "site_settings", group, {
    by: auth.session.email,
  });
  revalidatePath(cfg.adminPath);
  revalidatePath("/");
  return ok();
}

/* ------------------------------------------------------------------ */
/* Media library (admin+ can manage media)                              */
/* ------------------------------------------------------------------ */

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function mediaTypeOf(mime: string): "image" | "document" | null {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "document";
  return null;
}

export async function uploadMedia(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth;

  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0)
    return fail("No file selected.");
  if (file.size > MAX_UPLOAD_BYTES)
    return fail("File must be 10 MB or smaller.");
  const mediaType = mediaTypeOf(file.type);
  if (!mediaType)
    return fail("Only images and PDF files are allowed.");

  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const storagePath = `${auth.session.userId}/${crypto.randomUUID()}.${ext}`;

  const supabase = await createServerSupabaseClient();
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) return fail(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      uploaded_by: auth.session.userId,
      file_name: file.name,
      storage_path: storagePath,
      public_url: publicUrl,
      mime_type: file.type,
      file_size: file.size,
      alt_text: str(fd, "alt_text") || file.name,
      media_type: mediaType,
      status: "active",
    })
    .select("id")
    .single();
  if (error) {
    await supabase.storage.from("media").remove([storagePath]);
    return fail(error.message);
  }

  await logAudit("media.upload", "media_assets", data.id, {
    file: file.name,
    by: auth.session.email,
  });
  revalidatePath("/admin/media");
  return ok();
}

export async function updateMediaAlt(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth;
  const id = str(fd, "id");
  if (!id) return fail("Missing media id.");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("media_assets")
    .update({ alt_text: str(fd, "alt_text") || null })
    .eq("id", id);
  if (error) return fail(error.message);
  await logAudit("media.alt", "media_assets", id, { by: auth.session.email });
  revalidatePath("/admin/media");
  return ok();
}

export async function toggleMediaStatus(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth;
  const id = str(fd, "id");
  if (!id) return fail("Missing media id.");
  const supabase = await createServerSupabaseClient();
  const { data: current } = await supabase
    .from("media_assets")
    .select("status")
    .eq("id", id)
    .single();
  if (!current) return fail("Media asset not found.");
  const next = current.status === "active" ? "archived" : "active";
  const { error } = await supabase
    .from("media_assets")
    .update({ status: next })
    .eq("id", id);
  if (error) return fail(error.message);
  await logAudit("media.status", "media_assets", id, {
    status: next,
    by: auth.session.email,
  });
  revalidatePath("/admin/media");
  return ok();
}

export async function deleteMedia(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth;
  const id = str(fd, "id");
  if (!id) return fail("Missing media id.");
  const supabase = await createServerSupabaseClient();
  const { data: asset } = await supabase
    .from("media_assets")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (asset?.storage_path) {
    await supabase.storage.from("media").remove([asset.storage_path]);
  }
  const { error } = await supabase.from("media_assets").delete().eq("id", id);
  if (error) return fail(error.message);
  await logAudit("media.delete", "media_assets", id, { by: auth.session.email });
  revalidatePath("/admin/media");
  return ok();
}

export async function setProfileImage(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth;
  const id = str(fd, "id");
  if (!id) return fail("Missing media id.");
  const supabase = await createServerSupabaseClient();
  const { data: asset, error: readError } = await supabase
    .from("media_assets")
    .select("public_url")
    .eq("id", id)
    .single();
  if (readError || !asset) return fail("Media asset not found.");
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "profile_image_url", value: asset.public_url }, { onConflict: "key" });
  if (error) return fail(error.message);
  await logAudit("settings.profile_image", "site_settings", "profile_image_url", {
    by: auth.session.email,
  });
  revalidatePath("/admin/media");
  revalidatePath("/");
  return ok();
}

export async function setLogoImage(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth;
  const id = str(fd, "id");
  if (!id) return fail("Missing media id.");
  const supabase = await createServerSupabaseClient();
  const { data: asset, error: readError } = await supabase
    .from("media_assets")
    .select("public_url")
    .eq("id", id)
    .single();
  if (readError || !asset) return fail("Media asset not found.");
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "logo_image_url", value: asset.public_url }, { onConflict: "key" });
  if (error) return fail(error.message);
  await logAudit("settings.logo_image", "site_settings", "logo_image_url", {
    by: auth.session.email,
  });
  revalidatePath("/admin/media");
  revalidatePath("/");
  return ok();
}

/* ------------------------------------------------------------------ */
/* CV / resume (admin+)                                                */
/* ------------------------------------------------------------------ */

export async function uploadResume(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth;

  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0)
    return fail("No file selected.");
  if (file.size > MAX_UPLOAD_BYTES)
    return fail("File must be 10 MB or smaller.");
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))
    return fail("Only PDF files are allowed for the CV.");

  const label = str(fd, "label") || file.name.replace(/\.pdf$/i, "");
  const setCurrent = bool(fd, "set_current");

  const supabase = await createServerSupabaseClient();
  const storagePath = `${auth.session.userId}/resume/${crypto.randomUUID()}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(storagePath, file, { contentType: "application/pdf", upsert: false });
  if (uploadError) return fail(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(storagePath);

  const { data: asset, error: assetError } = await supabase
    .from("media_assets")
    .insert({
      uploaded_by: auth.session.userId,
      file_name: file.name,
      storage_path: storagePath,
      public_url: publicUrl,
      mime_type: "application/pdf",
      file_size: file.size,
      alt_text: label,
      media_type: "document",
      status: "active",
    })
    .select("id")
    .single();
  if (assetError) {
    await supabase.storage.from("media").remove([storagePath]);
    return fail(assetError.message);
  }

  if (setCurrent) {
    await supabase.from("resume_assets").update({ is_current: false }).eq("is_current", true);
  }
  const { data: resume, error: resumeError } = await supabase
    .from("resume_assets")
    .insert({ media_asset_id: asset.id, label, is_current: setCurrent })
    .select("id")
    .single();
  if (resumeError) {
    await supabase.from("media_assets").delete().eq("id", asset.id);
    await supabase.storage.from("media").remove([storagePath]);
    return fail(resumeError.message);
  }

  await logAudit("resume.upload", "resume_assets", resume.id, {
    label,
    by: auth.session.email,
  });
  revalidatePath("/admin/cv");
  revalidatePath("/");
  return ok();
}

export async function setCurrentResume(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth;
  const id = str(fd, "id");
  if (!id) return fail("Missing resume id.");
  const supabase = await createServerSupabaseClient();
  await supabase.from("resume_assets").update({ is_current: false }).eq("is_current", true);
  const { error } = await supabase
    .from("resume_assets")
    .update({ is_current: true })
    .eq("id", id);
  if (error) return fail(error.message);
  await logAudit("resume.set_current", "resume_assets", id, { by: auth.session.email });
  revalidatePath("/admin/cv");
  revalidatePath("/");
  return ok();
}

export async function deleteResume(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth;
  const id = str(fd, "id");
  if (!id) return fail("Missing resume id.");
  const supabase = await createServerSupabaseClient();
  const { data: resume } = await supabase
    .from("resume_assets")
    .select("media_asset_id, media_assets(storage_path)")
    .eq("id", id)
    .single();
  await supabase.from("resume_assets").delete().eq("id", id);
  const mediaId = (resume as { media_asset_id?: string } | null)?.media_asset_id;
  const storagePath = (
    resume as { media_assets?: { storage_path?: string } } | null
  )?.media_assets?.storage_path;
  if (mediaId) {
    if (storagePath) await supabase.storage.from("media").remove([storagePath]);
    await supabase.from("media_assets").delete().eq("id", mediaId);
  }
  await logAudit("resume.delete", "resume_assets", id, { by: auth.session.email });
  revalidatePath("/admin/cv");
  revalidatePath("/");
  return ok();
}

/* ------------------------------------------------------------------ */
/* Contact messages (editor+)                                          */
/* ------------------------------------------------------------------ */

export async function setMessageRead(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("editor");
  if (!auth.ok) return auth;
  const id = str(fd, "id");
  const isRead = bool(fd, "is_read");
  if (!id) return fail("Missing message id.");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ is_read: isRead })
    .eq("id", id);
  if (error) return fail(error.message);
  await logAudit("message.read", "contact_messages", id, {
    is_read: isRead,
    by: auth.session.email,
  });
  revalidatePath("/admin/messages");
  return ok();
}

export async function deleteMessage(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("editor");
  if (!auth.ok) return auth;
  const id = str(fd, "id");
  if (!id) return fail("Missing message id.");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return fail(error.message);
  await logAudit("message.delete", "contact_messages", id, { by: auth.session.email });
  revalidatePath("/admin/messages");
  return ok();
}

/* ------------------------------------------------------------------ */
/* Leads CRM (editor+)                                                 */
/* ------------------------------------------------------------------ */

const LEAD_STATUSES = ["new", "contacted", "qualified", "closed"];

const LEADS_CFG: CrudConfig = {
  table: "leads",
  adminPath: "/admin/leads",
  fields: ["name", "email", "phone", "source", "status", "notes"],
  nullable: ["phone", "source", "notes"],
};

function withLeadStatusGuard(fd: FormData): FormData | { error: string } {
  const status = str(fd, "status");
  if (status && !LEAD_STATUSES.includes(status)) {
    return { error: `Invalid lead status. Use one of: ${LEAD_STATUSES.join(", ")}.` };
  }
  return fd;
}

export async function createLead(fd: FormData): Promise<ActionResult> {
  const guarded = withLeadStatusGuard(fd);
  if (!(guarded instanceof FormData)) return fail(guarded.error);
  return crudCreate(LEADS_CFG, guarded);
}
export async function updateLead(fd: FormData): Promise<ActionResult> {
  const guarded = withLeadStatusGuard(fd);
  if (!(guarded instanceof FormData)) return fail(guarded.error);
  return crudUpdate(LEADS_CFG, guarded);
}
export async function deleteLead(fd: FormData): Promise<ActionResult> {
  return crudDelete(LEADS_CFG, fd);
}

/* ------------------------------------------------------------------ */
/* AI settings (admin+). Never any API-key field.                       */
/* ------------------------------------------------------------------ */

const AI_FEATURES = ["chatbot", "contact_assistant"] as const;

export async function updateAiSettings(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth;
  const feature = str(fd, "feature");
  if (!(AI_FEATURES as readonly string[]).includes(feature))
    return fail("Unknown AI feature.");

  const usageRaw = str(fd, "usage_limits");
  let usageLimits: unknown = {};
  if (usageRaw) {
    try {
      usageLimits = JSON.parse(usageRaw);
    } catch {
      return fail("Usage limits must be valid JSON.");
    }
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("ai_settings").upsert(
    {
      feature,
      enabled: bool(fd, "enabled"),
      system_instructions: str(fd, "system_instructions") || null,
      welcome_message: str(fd, "welcome_message") || null,
      fallback_message: str(fd, "fallback_message") || null,
      usage_limits: usageLimits,
    },
    { onConflict: "feature" }
  );
  if (error) return fail(error.message);

  await logAudit("ai.update", "ai_settings", feature, { by: auth.session.email });
  revalidatePath("/admin/ai");
  revalidatePath("/");
  return ok();
}

/* ------------------------------------------------------------------ */
/* Section settings (editor+)                                          */
/* ------------------------------------------------------------------ */

export async function initializeSections(): Promise<ActionResult> {
  const auth = await requireRole("editor");
  if (!auth.ok) return auth;
  const supabase = await createServerSupabaseClient();
  const rows = defaultSections.map((s) => ({
    section_key: s.key,
    enabled: s.enabled,
    display_order: s.order,
  }));
  const { error } = await supabase
    .from("section_settings")
    .upsert(rows, { onConflict: "section_key" });
  if (error) return fail(error.message);
  await logAudit("sections.init", "section_settings", null, {
    by: auth.session.email,
  });
  revalidatePath("/admin/sections");
  revalidatePath("/");
  return ok();
}

export async function updateSections(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("editor");
  if (!auth.ok) return auth;
  const ids = fd.getAll("id").filter((v): v is string => typeof v === "string");
  if (ids.length === 0) return fail("No sections submitted.");

  const supabase = await createServerSupabaseClient();
  for (const id of ids) {
    const enabled = bool(fd, `enabled_${id}`);
    const order = intOrNull(fd, `order_${id}`) ?? 0;
    const { error } = await supabase
      .from("section_settings")
      .update({ enabled, display_order: order, updated_by: auth.session.userId })
      .eq("id", id);
    if (error) return fail(`Could not save section: ${error.message}`);
  }

  await logAudit("sections.update", "section_settings", null, {
    by: auth.session.email,
  });
  revalidatePath("/admin/sections");
  revalidatePath("/");
  return ok();
}

/* ------------------------------------------------------------------ */
/* Users & roles                                                       */
/* ------------------------------------------------------------------ */

const MANAGEABLE_ROLES: AdminRole[] = ["editor", "admin", "super_admin"];

export async function inviteAdminUser(fd: FormData): Promise<ActionResult> {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth;
  const email = str(fd, "email").toLowerCase();
  const role = str(fd, "role") as AdminRole;
  if (!email || !email.includes("@")) return fail("A valid email is required.");
  if (!MANAGEABLE_ROLES.includes(role)) return fail("Invalid role.");
  if (role === "super_admin" && auth.session.role !== "super_admin")
    return fail("Only a super_admin can invite a super_admin.");

  const service = createServiceRoleClient();
  if (!service)
    return fail("SUPABASE_SERVICE_ROLE_KEY is not configured on the server.");

  const { data: existing } = await service
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) return fail("This email already has admin access.");

  // Send a Supabase invite email; the user sets their own password from it.
  const { data: invited, error: inviteError } =
    await service.auth.admin.inviteUserByEmail(email);
  if (inviteError || !invited.user)
    return fail(`Invite failed: ${inviteError?.message ?? "unknown error"}`);

  const { error: rowError } = await service.from("admin_users").insert({
    id: invited.user.id,
    email,
    role,
  });
  if (rowError) return fail(`Invite sent, but admin row failed: ${rowError.message}`);

  await logAudit("user.invite", "admin_users", invited.user.id, {
    email,
    role,
    by: auth.session.email,
  });
  revalidatePath("/admin/users");
  return ok();
}

export async function updateUserRole(fd: FormData): Promise<ActionResult> {
  const auth: { ok: boolean; session?: AdminSession; error?: string } =
    await requireRole("super_admin");
  if (!auth.ok || !auth.session) return fail(auth.error ?? "Not authorized.");
  const id = str(fd, "id");
  const role = str(fd, "role") as AdminRole;
  if (!id) return fail("Missing user id.");
  if (!MANAGEABLE_ROLES.includes(role)) return fail("Invalid role.");
  if (id === auth.session.userId)
    return fail("You cannot change your own role.");

  const service = createServiceRoleClient();
  if (!service)
    return fail("SUPABASE_SERVICE_ROLE_KEY is not configured on the server.");
  const { error } = await service
    .from("admin_users")
    .update({ role })
    .eq("id", id);
  if (error) return fail(error.message);

  await logAudit("user.role", "admin_users", id, {
    role,
    by: auth.session.email,
  });
  revalidatePath("/admin/users");
  return ok();
}

export async function removeAdminUser(fd: FormData): Promise<ActionResult> {
  const auth: { ok: boolean; session?: AdminSession; error?: string } =
    await requireRole("super_admin");
  if (!auth.ok || !auth.session) return fail(auth.error ?? "Not authorized.");
  const id = str(fd, "id");
  if (!id) return fail("Missing user id.");
  if (id === auth.session.userId)
    return fail("You cannot remove your own access.");

  const service = createServiceRoleClient();
  if (!service)
    return fail("SUPABASE_SERVICE_ROLE_KEY is not configured on the server.");
  const { error: rowError } = await service
    .from("admin_users")
    .delete()
    .eq("id", id);
  if (rowError) return fail(rowError.message);
  // Also remove the auth user so they can no longer sign in.
  const { error: authError } = await service.auth.admin.deleteUser(id);
  if (authError) return fail(`Access revoked, but auth user delete failed: ${authError.message}`);

  await logAudit("user.remove", "admin_users", id, { by: auth.session.email });
  revalidatePath("/admin/users");
  return ok();
}

/* ------------------------------------------------------------------ */
/* Security                                                            */
/* ------------------------------------------------------------------ */

export async function signOutEverywhere(): Promise<ActionResult> {
  const auth = await requireRole("editor");
  if (!auth.ok) return auth;
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut({ scope: "global" });
  if (error) return fail(error.message);
  await logAudit("auth.signout_all", "auth", null, { by: auth.session.email });
  return ok();
}
