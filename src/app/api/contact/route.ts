import { NextRequest, NextResponse } from "next/server";
import {
  createServiceRoleClient,
  isSupabaseConfigured,
} from "@/lib/supabase";
import { sendContactNotification, type ContactPayload } from "@/lib/email";
import { profile } from "@/lib/content";

interface ApiResponse {
  ok: boolean;
  delivered: boolean;
  message: string;
}

/** In-memory per-IP rate limiting: max 10 requests per 10 minutes per IP. */
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
const requestTimestamps = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestTimestamps.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  requestTimestamps.set(ip, timestamps);

  // Opportunistic cleanup so the map can't grow unboundedly.
  if (requestTimestamps.size > 5000) {
    const cutoff = now - RATE_LIMIT_WINDOW_MS;
    for (const [key, times] of requestTimestamps) {
      const fresh = times.filter((t) => t > cutoff);
      if (fresh.length === 0) requestTimestamps.delete(key);
      else requestTimestamps.set(key, fresh);
    }
  }

  return timestamps.length > RATE_LIMIT_MAX;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Strip HTML tags so stored/emailed content can't carry markup. */
function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").replace(/[\u0000-\u001F\u007F]/g, "");
}

function firstProblem(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) {
    return "Please submit the form as JSON.";
  }
  const p = payload as Record<string, unknown>;
  const asString = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

  const name = asString(p.name);
  if (!name) return "Please tell me your name.";
  if (name.length < 2 || name.length > 100)
    return "Your name must be between 2 and 100 characters.";

  const email = asString(p.email);
  if (!email) return "Please provide your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "That email address doesn't look valid.";

  const subject = asString(p.subject);
  if (!subject) return "Please add a subject.";
  if (subject.length < 2 || subject.length > 150)
    return "The subject must be between 2 and 150 characters.";

  const message = asString(p.message);
  if (!message) return "Please write a message.";
  if (message.length < 10 || message.length > 5000)
    return "Your message must be between 10 and 5000 characters.";

  return null;
}

function sanitizedPayload(payload: Record<string, unknown>): ContactPayload {
  const s = (v: unknown): string =>
    stripHtml(typeof v === "string" ? v.trim() : "");
  return {
    name: s(payload.name),
    email: s(payload.email),
    subject: s(payload.subject),
    message: s(payload.message),
  };
}

export async function POST(req: NextRequest) {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    const res: ApiResponse = {
      ok: false,
      delivered: false,
      message: "Please submit the form as JSON.",
    };
    return NextResponse.json(res, { status: 400 });
  }

  const problem = firstProblem(body);
  if (problem) {
    const res: ApiResponse = { ok: false, delivered: false, message: problem };
    return NextResponse.json(res, { status: 400 });
  }

  if (isRateLimited(getClientIp(req))) {
    const res: ApiResponse = {
      ok: false,
      delivered: false,
      message: "You're sending messages too quickly. Please wait a few minutes and try again.",
    };
    return NextResponse.json(res, { status: 429 });
  }

  const payload = sanitizedPayload(body as Record<string, unknown>);

  // Persist to Supabase (best-effort — storage failure must not fail the request).
  let stored = false;
  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createServiceRoleClient();
      if (supabase) {
        const { error } = await supabase.from("contact_messages").insert({
          name: payload.name,
          email: payload.email,
          subject: payload.subject,
          message: payload.message,
        });
        stored = !error;
      }
    } catch {
      stored = false;
    }
  }

  // Email notification (best-effort).
  const to = process.env.CONTACT_TO_EMAIL ?? profile.email;
  const emailResult = await sendContactNotification(to, payload);

  if (!stored && !emailResult.delivered) {
    const res: ApiResponse = {
      ok: false,
      delivered: false,
      message:
        "Something went wrong saving your message. Please email contact.asharasif@gmail.com directly.",
    };
    return NextResponse.json(res, { status: 500 });
  }

  if (emailResult.delivered) {
    const res: ApiResponse = {
      ok: true,
      delivered: true,
      message: `Thanks ${payload.name} — your message has been sent. I'll get back to you soon.`,
    };
    return NextResponse.json(res, { status: 200 });
  }

  const res: ApiResponse = {
    ok: true,
    delivered: false,
    message: `Thanks ${payload.name} — your message was received and saved. Email delivery is being configured, so a reply may take a little longer.`,
  };
  return NextResponse.json(res, { status: 200 });
}
