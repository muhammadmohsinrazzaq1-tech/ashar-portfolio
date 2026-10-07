import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/ui/badge";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialPublish,
} from "@/app/admin/actions";

export const metadata = { title: "Testimonials | Admin" };

export default async function AdminTestimonialsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("testimonials")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Client feedback from genuine sources only. Never invent quotes — this list stays empty until real testimonials arrive."
      />
      <ResourceManager
        resourceName="Testimonial"
        rows={rows ?? []}
        createAction={createTestimonial}
        updateAction={updateTestimonial}
        deleteAction={deleteTestimonial}
        toggleAction={toggleTestimonialPublish}
        emptyTitle="No testimonials yet"
        emptyMessage="Genuine client feedback will appear here once available. No placeholders, no invented quotes."
        columns={[
          {
            key: "author",
            header: "Author",
            render: (r) => (
              <span>
                <span className="block font-semibold">{r.author_name}</span>
                <span className="block text-xs text-sand">{r.author_role || "—"}</span>
              </span>
            ),
          },
          {
            key: "quote",
            header: "Quote",
            render: (r) => <span className="line-clamp-2 max-w-md text-sand">“{r.quote}”</span>,
          },
          { key: "order", header: "Order", render: (r) => r.display_order ?? "—" },
          {
            key: "status",
            header: "Status",
            render: (r) =>
              r.is_published ? <Badge>Published</Badge> : <Badge variant="muted">Hidden</Badge>,
          },
        ]}
        fields={[
          { name: "author_name", label: "Author name", type: "text", required: true },
          { name: "author_role", label: "Author role", type: "text", placeholder: "Client, YouTube Automation" },
          { name: "quote", label: "Quote", type: "textarea", rows: 4, required: true, hint: "Only genuine, verifiable quotes." },
          { name: "display_order", label: "Display order", type: "number", placeholder: "0" },
          { name: "is_published", label: "Published", type: "checkbox", hint: "Show this testimonial on the public site." },
        ]}
      />
    </div>
  );
}
