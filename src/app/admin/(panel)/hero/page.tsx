import { profile } from "@/lib/content";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { updateSiteSettings } from "@/app/admin/actions";
import { getSiteSettings } from "@/app/admin/settings";
import { DEFAULT_SETTINGS } from "@/lib/site-data";

export const metadata = { title: "Hero | Admin" };

const KEYS = [
  "hero_name",
  "hero_headline",
  "hero_badge",
  "hero_short_bio",
  "hero_bio",
  "hero_profile_image_url",
  "hero_cta_primary_label",
  "hero_cta_primary_url",
  "hero_cta_secondary_label",
  "hero_cta_secondary_url",
  "hero_cv_label",
  "hero_cv_url",
] as const;

export default async function AdminHeroPage() {
  const values = await getSiteSettings(
    [...KEYS],
    Object.fromEntries(KEYS.map((k) => [k, DEFAULT_SETTINGS[k] ?? ""]))
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Hero"
        description="The top section of the homepage. Tip: you can also set the profile image from the Media Library with “Set as profile image”."
      />
      <SettingsForm
        title="Hero content"
        description="Stored as individual site_settings keys and shown on the public homepage."
        hidden={{ settings_group: "hero" }}
        values={values}
        action={updateSiteSettings}
        fields={[
          { name: "hero_name", label: "Name", type: "text", required: true },
          { name: "hero_badge", label: "Badge text", type: "text" },
          { name: "hero_headline", label: "Headline (role line)", type: "text", required: true },
          { name: "hero_short_bio", label: "Short bio", type: "textarea", rows: 3 },
          { name: "hero_bio", label: "Full bio", type: "textarea", rows: 6 },
          {
            name: "hero_profile_image_url",
            label: "Profile image URL",
            type: "url",
            placeholder: "https://…",
          },
        ]}
      />
      <SettingsForm
        title="Hero buttons"
        description="Call-to-action labels and links, plus the CV download button."
        hidden={{ settings_group: "hero" }}
        values={values}
        action={updateSiteSettings}
        fields={[
          { name: "hero_cta_primary_label", label: "Primary button label", type: "text" },
          { name: "hero_cta_primary_url", label: "Primary button link", type: "text", placeholder: "#projects or https://…" },
          { name: "hero_cta_secondary_label", label: "Secondary button label", type: "text" },
          { name: "hero_cta_secondary_url", label: "Secondary button link", type: "text", placeholder: "#contact or https://…" },
          { name: "hero_cv_label", label: "CV button label", type: "text" },
          {
            name: "hero_cv_url",
            label: "CV button link",
            type: "text",
            placeholder: "/resume or https://…",
            hint: "Use /resume for the built-in printable CV page, or link a PDF.",
          },
        ]}
      />
    </div>
  );
}
