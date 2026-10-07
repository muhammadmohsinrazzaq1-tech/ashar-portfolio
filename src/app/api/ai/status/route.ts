import { NextResponse } from "next/server";
import {
  createServiceRoleClient,
  isSupabaseConfigured,
} from "@/lib/supabase";

interface StatusResponse {
  enabled: boolean;
  configured: boolean;
  welcomeMessage: string;
}

interface AiSettingRow {
  feature: string;
  enabled: boolean | null;
  welcome_message: string | null;
  fallback_message: string | null;
}

/** No AI provider is wired yet (provider decision pending) — configured is always false. */
export async function GET() {
  let enabled = false;
  let welcomeMessage = "AI assistant is currently unavailable.";

  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createServiceRoleClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("ai_settings")
          .select("feature, enabled, welcome_message, fallback_message")
          .eq("feature", "chatbot")
          .maybeSingle();
        if (!error && data) {
          const row = data as AiSettingRow;
          enabled = row.enabled === true;
          if (enabled && row.welcome_message) {
            welcomeMessage = row.welcome_message;
          }
        }
      }
    } catch {
      // Best-effort: fall back to disabled.
    }
  }

  const res: StatusResponse = {
    enabled,
    configured: false,
    welcomeMessage,
  };
  return NextResponse.json(res, { status: 200 });
}
