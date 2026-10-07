import { siteMeta } from "@/lib/content";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { updateSiteSettings } from "@/app/admin/actions";
import { getSiteSettings } from "@/app/admin/settings";

export const metadata = { title: "SEO | Admin" };

export default async function AdminSeoPage() {
  const values = await getSiteSettings(
    ["seo_title", "seo_description", "og_image_url"],
    {
      seo_title: siteMeta.title,
      seo_description: siteMeta.description,
      og_image_url: "",
    }
  );

  return (
    <div>
      <PageHeader
        title="SEO"
        description="Default meta tags used across the public site."
      />
      <SettingsForm
        title="Search & social metadata"
        description="Used for the site-wide title, meta description, and link preview image."
        hidden={{ settings_group: "seo" }}
        values={values}
        action={updateSiteSettings}
        fields={[
          { name: "seo_title", label: "SEO title", type: "text", required: true },
          { name: "seo_description", label: "SEO description", type: "textarea", rows: 3 },
          {
            name: "og_image_url",
            label: "Social preview image URL",
            type: "url",
            placeholder: "https://…",
            hint: "Shown when the site is shared on social media.",
          },
        ]}
      />
    </div>
  );
}
