import { KeyRound } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { AiFeaturePanel, type AiFeature } from "@/components/admin/AiFeaturePanel";

export const metadata = { title: "AI Settings | Admin" };

export default async function AdminAiPage() {
  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase.from("ai_settings").select("*");

  const byFeature = new Map<string, AiFeature>();
  for (const row of rows ?? []) {
    byFeature.set(row.feature, row as AiFeature);
  }

  // Read-only provider signal: never expose key values.
  const providerConfigured = Boolean(
    process.env.AI_PROVIDER ||
      process.env.OPENAI_API_KEY ||
      process.env.ANTHROPIC_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY
  );

  return (
    <div>
      <PageHeader
        title="AI Settings"
        description="Control the on-site AI features: copy, behavior, and usage limits."
      />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-gold-muted/40 bg-gold/5 px-5 py-4">
        <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-gold-light" />
        <div className="text-sm">
          <p className="font-semibold text-gold-light">
            API keys are configured via server environment variables, never here.
          </p>
          <p className="mt-1 text-sand">
            AI provider {providerConfigured ? "is" : "is not"} configured on this
            server {providerConfigured ? "(key detected)" : "(no key detected)"}.
            To rotate or change keys, update the server environment — this panel
            only manages prompts, messages, and limits.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <AiFeaturePanel
          title="Chatbot"
          description="The on-site assistant visitors can chat with."
          feature="chatbot"
          data={byFeature.get("chatbot") ?? null}
        />
        <AiFeaturePanel
          title="Contact assistant"
          description="Helps visitors write better contact messages."
          feature="contact_assistant"
          data={byFeature.get("contact_assistant") ?? null}
        />
      </div>
    </div>
  );
}
