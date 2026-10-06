import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { updateSiteSettings } from "@/app/admin/actions";
import { getSiteSettings } from "@/app/admin/settings";
import { DEFAULT_SETTINGS, SECTION_KEYS } from "@/lib/site-data";
import type { FieldConfig } from "@/components/admin/form-fields";

export const metadata = { title: "Section Headings | Admin" };

const SECTION_LABELS: Record<string, string> = {
  about: "About",
  skills: "Skills",
  experience: "Experience",
  services: "Services",
  projects: "Projects",
  achievements: "Achievements",
  blog: "Blog",
  testimonials: "Testimonials",
  contact: "Contact",
};

export default async function AdminSectionHeadingsPage() {
  const keys = SECTION_KEYS.filter((s) => s !== "hero").flatMap((s) => [
    `heading_${s}_eyebrow`,
    `heading_${s}_title`,
    `heading_${s}_description`,
  ]);
  const values = await getSiteSettings(
    keys,
    Object.fromEntries(keys.map((k) => [k, DEFAULT_SETTINGS[k] ?? ""]))
  );

  const fields: FieldConfig[] = SECTION_KEYS.filter((s) => s !== "hero").flatMap(
    (s) => [
      {
        name: `heading_${s}_eyebrow`,
        label: `${SECTION_LABELS[s]} — eyebrow`,
        type: "text" as const,
      },
      {
        name: `heading_${s}_title`,
        label: `${SECTION_LABELS[s]} — title`,
        type: "text" as const,
      },
      {
        name: `heading_${s}_description`,
        label: `${SECTION_LABELS[s]} — description`,
        type: "textarea" as const,
        rows: 2,
      },
    ]
  );

  return (
    <div>
      <PageHeader
        title="Section Headings"
        description="The eyebrow, title, and description shown above every homepage section."
      />
      <SettingsForm
        title="Headings"
        hidden={{ settings_group: "headings" }}
        values={values}
        action={updateSiteSettings}
        fields={fields}
      />
    </div>
  );
}
