"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, Loader2, Send, X } from "lucide-react";

/**
 * Floating AI chat widget.
 *
 * API contract (assumed, owned by another agent):
 * - GET  /api/ai/status -> { enabled: boolean; configured: boolean; welcomeMessage?: string }
 * - POST /api/ai/chat  -> { reply: string; configured: boolean } with body { message: string }
 *
 * The widget never fabricates answers: when the assistant is disabled or the
 * request fails, it says so and points at the contact form instead.
 */

interface StatusResponse {
  enabled: boolean;
  configured: boolean;
  welcomeMessage?: string;
}

interface ChatResponse {
  reply: string;
  configured?: boolean;
}

interface Message {
  id: number;
  role: "assistant" | "user";
  text: string;
}

const UNAVAILABLE_TEXT =
  "AI assistant is currently unavailable — use the contact form.";

let messageId = 0;
function nextId() {
  messageId += 1;
  return messageId;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unconfigured, setUnconfigured] = useState(false);
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch status lazily on first open.
  useEffect(() => {
    if (!open || status || statusError) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ai/status", { method: "GET" });
        const data = (await res.json().catch(() => ({}))) as Partial<StatusResponse>;
        if (cancelled) return;
        const enabled = data.enabled === true;
        const s: StatusResponse = {
          enabled,
          configured: data.configured === true,
          welcomeMessage:
            typeof data.welcomeMessage === "string" && data.welcomeMessage.length > 0
              ? data.welcomeMessage
              : undefined,
        };
        setStatus(s);
        setMessages([
          {
            id: nextId(),
            role: "assistant",
            text: enabled
              ? (s.welcomeMessage ?? "Hi! Ask me anything about Ashar's work and services.")
              : UNAVAILABLE_TEXT,
          },
        ]);
      } catch {
        if (!cancelled) setStatusError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, status, statusError]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  useEffect(() => {
    if (open && status?.enabled) inputRef.current?.focus();
  }, [open, status]);

  async function send() {
    const text = input.trim();
    if (!text || sending || !status?.enabled) return;
    setInput("");
    setMessages((m) => [...m, { id: nextId(), role: "user", text }]);
    setSending(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<ChatResponse>;
      const reply =
        typeof data.reply === "string" && data.reply.length > 0
          ? data.reply
          : "Sorry, I couldn't generate a reply. Please try again or use the contact form.";
      if (data.configured === false) setUnconfigured(true);
      setMessages((m) => [...m, { id: nextId(), role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          role: "assistant",
          text: "Something went wrong reaching the assistant. Please try again or use the contact form.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16, scale: reduceMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 16, scale: reduceMotion ? 1 : 0.98 }}
            transition={{ duration: 0.22 }}
            className="flex h-[26rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-line bg-charcoal shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
            role="dialog"
            aria-label="AI assistant chat"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line bg-graphite px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-ink">
                  <Bot className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-cream">AI Assistant</p>
                  <p className="text-xs text-sand">
                    {status === null && !statusError
                      ? "Connecting…"
                      : status?.enabled
                        ? "Online"
                        : "Unavailable"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-8 w-8 items-center justify-center rounded-md text-sand transition-colors hover:bg-white/5 hover:text-cream"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              {status === null && !statusError ? (
                <div className="flex items-center gap-2 text-sm text-sand">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Checking availability…
                </div>
              ) : null}
              {statusError ? (
                <p className="rounded-lg bg-graphite p-3 text-sm text-sand">
                  {UNAVAILABLE_TEXT}
                </p>
              ) : null}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === "user"
                      ? "ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-gold px-3.5 py-2.5 text-sm text-ink"
                      : "mr-auto max-w-[85%] rounded-xl rounded-bl-sm bg-graphite px-3.5 py-2.5 text-sm leading-relaxed text-cream"
                  }
                >
                  {m.text}
                </div>
              ))}
              {sending ? (
                <div className="mr-auto flex items-center gap-2 rounded-xl rounded-bl-sm bg-graphite px-3.5 py-2.5 text-sm text-sand">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Thinking…
                </div>
              ) : null}
            </div>

            {unconfigured ? (
              <p className="border-t border-line px-4 py-2 text-xs text-sand/80">
                Note: the assistant is running in unconfigured mode — answers may be limited.
              </p>
            ) : null}

            {/* Input */}
            <form
              className="flex items-center gap-2 border-t border-line p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <label htmlFor="chat-input" className="sr-only">
                Type your message
              </label>
              <input
                id="chat-input"
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  status?.enabled ? "Ask about Ashar's services…" : "Assistant unavailable"
                }
                disabled={!status?.enabled || sending}
                className="h-10 flex-1 rounded-md border border-line bg-graphite px-3 text-sm text-cream placeholder:text-sand/60 focus:border-gold-muted focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!status?.enabled || sending || input.trim().length === 0}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gold text-ink transition-colors hover:bg-gold-light disabled:opacity-40"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-ink shadow-[0_0_28px_rgba(199,154,43,0.4)] transition-all duration-200 hover:scale-105 hover:bg-gold-light"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>
    </div>
  );
}
