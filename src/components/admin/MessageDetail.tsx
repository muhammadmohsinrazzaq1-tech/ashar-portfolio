"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MailOpen, Mail, Trash2, Reply } from "lucide-react";
import type { ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { setMessageRead, deleteMessage } from "@/app/admin/actions";

interface MessageDetailProps {
  message: {
    id: string;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    is_read: boolean;
    created_at: string;
  };
}

export function MessageDetail({ message }: MessageDetailProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function toggleRead(next: boolean) {
    setError(null);
    const fd = new FormData();
    fd.set("id", message.id);
    fd.set("is_read", next ? "true" : "false");
    const result: ActionResult = await setMessageRead(fd);
    if (!result.ok) setError(result.error ?? "Could not update the message.");
    else router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm("Delete this message? This cannot be undone.")) return;
    const fd = new FormData();
    fd.set("id", message.id);
    startTransition(async () => {
      const result = await deleteMessage(fd);
      if (result.ok) router.push("/admin/messages");
      else setError(result.error ?? "Could not delete the message.");
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="dark"
          size="sm"
          disabled={isPending}
          onClick={() => toggleRead(!message.is_read)}
        >
          {message.is_read ? (
            <>
              <Mail className="h-4 w-4" /> Mark as unread
            </>
          ) : (
            <>
              <MailOpen className="h-4 w-4" /> Mark as read
            </>
          )}
        </Button>
        <a
          href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "your message"}`)}`}
        >
          <Button type="button" variant="dark" size="sm">
            <Reply className="h-4 w-4" /> Reply by email
          </Button>
        </a>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={handleDelete}
          className="text-red-400 hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </div>

      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-line bg-charcoal p-6">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-sand">From</dt>
            <dd className="mt-1 text-cream">{message.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-sand">Email</dt>
            <dd className="mt-1 text-cream">{message.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-sand">Subject</dt>
            <dd className="mt-1 text-cream">{message.subject || "(no subject)"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-sand">Received</dt>
            <dd className="mt-1 text-cream">
              {new Date(message.created_at).toLocaleString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </dd>
          </div>
        </dl>
        <div className="mt-6 border-t border-line pt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-sand">
            Message
          </p>
          <p className="whitespace-pre-wrap text-cream/90">{message.message}</p>
        </div>
      </div>
    </div>
  );
}
