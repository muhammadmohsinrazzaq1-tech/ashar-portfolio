import { NextRequest, NextResponse } from "next/server";
import {
  createServiceRoleClient,
  isSupabaseConfigured,
} from "@/lib/supabase";

interface ChatResponse {
  reply: string;
  configured: boolean;
}

interface AiSettingRow {
  feature: string;
  enabled: boolean | null;
  fallback_message: string | null;
}

async function getChatbotSettings(): Promise<{ enabled: boolean; fallback: string | null }> {
  let enabled = false;
  let fallback: string | null = null;

  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createServiceRoleClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("ai_settings")
          .select("feature, enabled, fallback_message")
          .eq("feature", "chatbot")
          .maybeSingle();
        if (!error && data) {
          const row = data as AiSettingRow;
          enabled = row.enabled === true;
          fallback = row.fallback_message;
        }
      }
    } catch {
      // Best-effort: fall back to disabled.
    }
  }

  return { enabled, fallback };
}

/**
 * Placeholder chatbot endpoint. No AI provider is wired yet, so the bot only
 * ever returns the configured fallback message — it must NEVER fabricate
 * achievements, clients, or projects.
 */
export async function POST(req: NextRequest) {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    const res: ChatResponse = {
      reply: "Please send your message as JSON.",
      configured: false,
    };
    return NextResponse.json(res, { status: 400 });
  }

  const message =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>).message
      : undefined;

  if (typeof message !== "string" || message.trim().length === 0) {
    const res: ChatResponse = {
      reply: "Please write a message first.",
      configured: false,
    };
    return NextResponse.json(res, { status: 400 });
  }

  if (message.length > 1000) {
    const res: ChatResponse = {
      reply: "Please keep your message under 1000 characters.",
      configured: false,
    };
    return NextResponse.json(res, { status: 400 });
  }

  const settings = await getChatbotSettings();

  if (!settings.enabled) {
    const res: ChatResponse = {
      reply: "AI assistant is disabled.",
      configured: false,
    };
    return NextResponse.json(res, { status: 403 });
  }

  const res: ChatResponse = {
    reply:
      settings.fallback ||
      "Thanks for your message! The AI assistant isn't connected yet — please use the contact form and I'll reply personally.",
    configured: false,
  };
  return NextResponse.json(res, { status: 200 });
}
