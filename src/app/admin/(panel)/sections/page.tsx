import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionsForm } from "@/components/admin/SectionsForm";

export const metadata = { title: "Sections | Admin" };

export default async function AdminSectionsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("section_settings")
    .select("id, section_key, enabled, display_order")
    .order("display_order", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Sections"
        description="Control which homepage sections are visible and in what order."
      />
      <SectionsForm sections={rows ?? []} />
    </div>
  );
}
