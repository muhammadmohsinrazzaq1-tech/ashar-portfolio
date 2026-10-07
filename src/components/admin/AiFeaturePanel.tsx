"use client";

import { SettingsForm } from "./SettingsForm";
import { updateAiSettings } from "@/app/admin/actions";

export interface AiFeature {
  feature: "chatbot" | "contact_assistant";
  enabled: boolean;
  system_instructions: string | null;
  welcome_message: string | null;
  fallback_message: string | null;
  usage_limits: unknown;
}

/** One AI feature panel: toggle + prompt copy + validated JSON limits. No API keys here. */
export function AiFeaturePanel({
  title,
  description,
  feature,
  data,
}: {
  title: string;
  description: string;
  feature: "chatbot" | "contact_assistant";
  data: AiFeature | null;
}) {
  const usageDefault =
    data?.usage_limits !== undefined && data?.usage_limits !== null
      ? JSON.stringify(data.usage_limits, null, 2)
      : "";

  return (
    <SettingsForm
      title={title}
      description={description}
      hidden={{ feature }}
      values={{
        enabled: data?.enabled ? "true" : "false",
        system_instructions: data?.system_instructions ?? "",
        welcome_message: data?.welcome_message ?? "",
        fallback_message: data?.fallback_message ?? "",
        usage_limits: usageDefault,
      }}
      action={updateAiSettings}
      fields={[
        {
          name: "enabled",
          label: "Enabled",
          type: "checkbox",
          hint: "When off, the feature stays hidden on the public site.",
        },
        {
          name: "system_instructions",
          label: "System instructions",
          type: "textarea",
          rows: 6,
          placeholder: "How the assistant should behave…",
        },
        {
          name: "welcome_message",
          label: "Welcome message",
          type: "textarea",
          rows: 3,
          placeholder: "First message visitors see…",
        },
        {
          name: "fallback_message",
          label: "Fallback message",
          type: "textarea",
          rows: 3,
          placeholder: "Shown when the assistant cannot answer…",
        },
        {
          name: "usage_limits",
          label: "Usage limits (JSON)",
          type: "textarea",
          rows: 4,
          placeholder: '{\n  "messages_per_day": 50\n}',
          hint: "Must be valid JSON. Example: { \"messages_per_day\": 50 }",
        },
      ]}
      note={
        <p className="rounded-md border border-gold-muted/40 bg-gold/5 px-4 py-3 text-sm text-gold-light">
          API keys are configured via server environment variables, never here.
        </p>
      }
    />
  );
}
