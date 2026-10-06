import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { updateSiteSettings } from "@/app/admin/actions";
import { getSiteSettings } from "@/app/admin/settings";
import { DEFAULT_SETTINGS } from "@/lib/site-data";
import { FONT_CHOICES } from "@/lib/fonts";

export const metadata = { title: "Appearance | Admin" };

const KEYS = [
  "brand_name",
  "site_tagline",
  "logo_image_url",
  "favicon_url",
  "nav_cta_label",
  "font_heading",
  "font_body",
  "accent_color",
  "bg_color",
  "animations_enabled",
] as const;

const fontOptions = FONT_CHOICES.map((f) => ({ value: f.value, label: f.label }));

export default async function AdminAppearancePage() {
  const values = await getSiteSettings(
    [...KEYS],
    Object.fromEntries(KEYS.map((k) => [k, DEFAULT_SETTINGS[k]]))
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Appearance"
        description="Site identity, typography, colors, and motion — every visual choice for the public site."
      />

      <SettingsForm
        title="Site identity"
        description="Brand name, logo, and favicon used across the public site."
        hidden={{ settings_group: "appearance" }}
        values={values}
        action={updateSiteSettings}
        fields={[
          { name: "brand_name", label: "Brand name", type: "text", required: true },
          { name: "site_tagline", label: "Site tagline", type: "text" },
          {
            name: "logo_image_url",
            label: "Logo image URL",
            type: "url",
            placeholder: "https://…",
            hint: "Shown as a small circle in the navbar and footer. Tip: upload in the Media Library, then use “Set as logo”, or paste a URL here.",
          },
          {
            name: "favicon_url",
            label: "Favicon URL",
            type: "url",
            placeholder: "https://…",
            hint: "Browser tab icon. Leave empty to use the default.",
          },
          { name: "nav_cta_label", label: "Navbar button label", type: "text" },
        ]}
      />

      <SettingsForm
        title="Typography"
        description="Heading and body fonts, loaded from Google Fonts. The defaults (Sora + Inter) are bundled; other choices load on demand."
        hidden={{ settings_group: "appearance" }}
        values={values}
        action={updateSiteSettings}
        fields={[
          { name: "font_heading", label: "Heading font", type: "select", options: fontOptions },
          { name: "font_body", label: "Body font", type: "select", options: fontOptions },
        ]}
      />

      <SettingsForm
        title="Colors"
        description="The black/charcoal + metallic gold brand palette. Derived shades update automatically."
        hidden={{ settings_group: "appearance" }}
        values={values}
        action={updateSiteSettings}
        fields={[
          {
            name: "accent_color",
            label: "Accent (gold) color",
            type: "color",
            hint: "Default #c79a2b.",
          },
          {
            name: "bg_color",
            label: "Page background",
            type: "color",
            hint: "Default #070707.",
          },
        ]}
      />

      <SettingsForm
        title="Motion"
        hidden={{ settings_group: "appearance" }}
        values={values}
        action={updateSiteSettings}
        fields={[
          {
            name: "animations_enabled",
            label: "Enable animations",
            type: "checkbox",
            hint: "Turn off to disable all entrance animations, floats, and ambient orbs site-wide.",
          },
        ]}
      />
    </div>
  );
}
