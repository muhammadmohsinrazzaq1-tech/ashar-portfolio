import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { updateSiteSettings } from "@/app/admin/actions";
import { getSiteSettings } from "@/app/admin/settings";
import { DEFAULT_SETTINGS } from "@/lib/site-data";

export const metadata = { title: "Footer | Admin" };

const KEYS = [
  "footer_about",
  "footer_copyright",
  "footer_tagline",
  "footer_nav_heading",
  "footer_connect_heading",
  "footer_links",
] as const;

export default async function AdminFooterPage() {
  const values = await getSiteSettings(
    [...KEYS],
    Object.fromEntries(KEYS.map((k) => [k, DEFAULT_SETTINGS[k] ?? ""]))
  );

  return (
    <div>
      <PageHeader
        title="Footer"
        description="The bottom section of every public page."
      />
      <div className="grid gap-6">
        <SettingsForm
          title="Footer content"
          hidden={{ settings_group: "footer" }}
          values={values}
          action={updateSiteSettings}
          fields={[
            { name: "footer_about", label: "About blurb", type: "textarea", rows: 3 },
            { name: "footer_copyright", label: "Copyright line", type: "text" },
            { name: "footer_tagline", label: "Tagline (bottom right)", type: "text" },
            { name: "footer_nav_heading", label: "Quick links heading", type: "text" },
            { name: "footer_connect_heading", label: "Social links heading", type: "text" },
          ]}
        />
        <SettingsForm
          title="Quick links"
          hidden={{ settings_group: "footer" }}
          values={values}
          action={updateSiteSettings}
          fields={[
            {
              name: "footer_links",
              label: "Footer links",
              type: "textarea",
              rows: 8,
              hint: "One link per line as “Label | href” (e.g. “Home | #home”). Leave empty to use the default navigation links.",
            },
          ]}
        />
      </div>
    </div>
  );
}
