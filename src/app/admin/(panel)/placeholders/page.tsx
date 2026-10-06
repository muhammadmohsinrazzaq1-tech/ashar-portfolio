import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { updateSiteSettings } from "@/app/admin/actions";
import { getSiteSettings } from "@/app/admin/settings";
import { DEFAULT_SETTINGS } from "@/lib/site-data";

export const metadata = { title: "Placeholders | Admin" };

const KEYS = [
  "projects_coming_soon_title",
  "projects_coming_soon_body",
  "testimonials_coming_soon_title",
  "testimonials_coming_soon_body",
] as const;

export default async function AdminPlaceholdersPage() {
  const values = await getSiteSettings(
    [...KEYS],
    Object.fromEntries(KEYS.map((k) => [k, DEFAULT_SETTINGS[k]]))
  );

  return (
    <div>
      <PageHeader
        title="Placeholders"
        description="Honest empty-state panels. These stay as “coming soon” until real, verified content exists — never invent projects or testimonials."
      />
      <SettingsForm
        title="Coming-soon panels"
        hidden={{ settings_group: "placeholders" }}
        values={values}
        action={updateSiteSettings}
        fields={[
          { name: "projects_coming_soon_title", label: "Projects — title", type: "text" },
          {
            name: "projects_coming_soon_body",
            label: "Projects — body",
            type: "textarea",
            rows: 4,
          },
          { name: "testimonials_coming_soon_title", label: "Testimonials — title", type: "text" },
          {
            name: "testimonials_coming_soon_body",
            label: "Testimonials — body",
            type: "textarea",
            rows: 4,
          },
        ]}
      />
    </div>
  );
}
