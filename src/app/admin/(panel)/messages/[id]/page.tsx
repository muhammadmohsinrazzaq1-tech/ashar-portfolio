import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { MessageDetail } from "@/components/admin/MessageDetail";

export const metadata = { title: "Message | Admin" };

export default async function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: message } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", id)
    .single();
  if (!message) notFound();

  return (
    <div>
      <PageHeader
        title={message.subject || "Message"}
        description={`From ${message.name} <${message.email}>`}
        backHref="/admin/messages"
        backLabel="All messages"
      />
      <MessageDetail message={message} />
    </div>
  );
}
