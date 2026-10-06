import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { updateSiteSettings } from "@/app/admin/actions";
import { getSiteSettings } from "@/app/admin/settings";
import { DEFAULT_SETTINGS } from "@/lib/site-data";

export const metadata = { title: "Contact Info | Admin" };

const DETAILS_KEYS = [
  "contact_email",
  "contact_phone",
  "contact_location",
  "contact_details_heading",
  "contact_follow_heading",
] as const;

const FORM_KEYS = [
  "contact_form_button_label",
  "contact_form_label_name",
  "contact_form_label_email",
  "contact_form_label_subject",
  "contact_form_label_message",
  "contact_form_placeholder_name",
  "contact_form_placeholder_email",
  "contact_form_placeholder_subject",
  "contact_form_placeholder_message",
] as const;

const MESSAGE_KEYS = [
  "contact_form_error_name",
  "contact_form_error_email",
  "contact_form_error_subject",
  "contact_form_error_message",
  "contact_form_send_error",
  "contact_form_network_error",
] as const;

const ALL_KEYS = [...DETAILS_KEYS, ...FORM_KEYS, ...MESSAGE_KEYS];

export default async function AdminContactInfoPage() {
  const values = await getSiteSettings(
    [...ALL_KEYS],
    Object.fromEntries(ALL_KEYS.map((k) => [k, DEFAULT_SETTINGS[k] ?? ""]))
  );

  return (
    <div>
      <PageHeader
        title="Contact Info"
        description="The email, phone, and location shown on the public contact section."
      />
      <div className="grid gap-6">
        <SettingsForm
          title="Contact details"
          hidden={{ settings_group: "contact" }}
          values={values}
          action={updateSiteSettings}
          fields={[
            { name: "contact_email", label: "Contact email", type: "email", required: true },
            { name: "contact_phone", label: "Contact phone", type: "text" },
            {
              name: "contact_location",
              label: "Location",
              type: "text",
              hint: "Leave empty to hide the location card.",
            },
            { name: "contact_details_heading", label: "Details panel heading", type: "text" },
            { name: "contact_follow_heading", label: "Social links heading", type: "text" },
          ]}
        />
        <SettingsForm
          title="Contact form text"
          hidden={{ settings_group: "contact" }}
          values={values}
          action={updateSiteSettings}
          fields={[
            { name: "contact_form_button_label", label: "Submit button label", type: "text" },
            { name: "contact_form_label_name", label: "Name field label", type: "text" },
            { name: "contact_form_placeholder_name", label: "Name placeholder", type: "text" },
            { name: "contact_form_label_email", label: "Email field label", type: "text" },
            { name: "contact_form_placeholder_email", label: "Email placeholder", type: "text" },
            { name: "contact_form_label_subject", label: "Subject field label", type: "text" },
            { name: "contact_form_placeholder_subject", label: "Subject placeholder", type: "text" },
            { name: "contact_form_label_message", label: "Message field label", type: "text" },
            { name: "contact_form_placeholder_message", label: "Message placeholder", type: "text" },
          ]}
        />
        <SettingsForm
          title="Form messages"
          hidden={{ settings_group: "contact" }}
          values={values}
          action={updateSiteSettings}
          fields={[
            { name: "contact_form_error_name", label: "Name validation message", type: "text" },
            { name: "contact_form_error_email", label: "Email validation message", type: "text" },
            { name: "contact_form_error_subject", label: "Subject validation message", type: "text" },
            { name: "contact_form_error_message", label: "Message validation message", type: "text" },
            { name: "contact_form_send_error", label: "Send failure message", type: "textarea", rows: 2 },
            { name: "contact_form_network_error", label: "Network error message", type: "textarea", rows: 2 },
          ]}
        />
      </div>
    </div>
  );
}
