import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { updateSiteSettings } from "@/app/admin/actions";
import { getSiteSettings } from "@/app/admin/settings";
import { DEFAULT_SETTINGS } from "@/lib/site-data";

export const metadata = { title: "About | Admin" };

const KEYS = [
  "about_bio",
  "about_qualification",
  "about_program",
  "about_institute",
  "about_year",
  "about_highlights",
] as const;

export default async function AdminAboutPage() {
  const values = await getSiteSettings(
    [...KEYS],
    Object.fromEntries(KEYS.map((k) => [k, DEFAULT_SETTINGS[k] ?? ""]))
  );

  return (
    <div>
      <PageHeader
        title="About"
        description="The about section and education details shown on the homepage."
      />
      <SettingsForm
        title="About content"
        description="Stored as individual site_settings keys."
        hidden={{ settings_group: "about" }}
        values={values}
        action={updateSiteSettings}
        fields={[
          { name: "about_bio", label: "Bio", type: "textarea", rows: 6 },
          {
            name: "about_highlights",
            label: "Highlight bullets",
            type: "multiline",
            rows: 4,
            hint: "One highlight per line. Shown as checkmark bullets under the bio.",
          },
          { name: "about_qualification", label: "Qualification", type: "text" },
          { name: "about_program", label: "Program", type: "text" },
          { name: "about_institute", label: "Institute", type: "text" },
          { name: "about_year", label: "Year", type: "text" },
        ]}
      />
    </div>
  );
}
