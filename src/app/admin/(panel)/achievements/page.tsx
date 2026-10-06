import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { Badge } from "@/components/ui/badge";
import {
  createAchievement,
  updateAchievement,
  deleteAchievement,
  toggleAchievementPublish,
  updateSiteSettings,
} from "@/app/admin/actions";
import { getSiteSettings } from "@/app/admin/settings";
import { DEFAULT_SETTINGS } from "@/lib/site-data";

export const metadata = { title: "Achievements | Admin" };

export default async function AdminAchievementsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("achievements")
    .select("*")
    .order("display_order", { ascending: true });
  const milestoneValues = await getSiteSettings(["achievements_milestone"], {
    achievements_milestone: DEFAULT_SETTINGS["achievements_milestone"],
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Achievements"
        description="Stat counters shown on the portfolio (e.g. 300+ students enrolled). Use verified numbers only."
      />
      <SettingsForm
        title="Personal milestone strip"
        description="The small banner under the stat cards — a verified personal milestone."
        hidden={{ settings_group: "achievements" }}
        values={milestoneValues}
        action={updateSiteSettings}
        fields={[
          {
            name: "achievements_milestone",
            label: "Milestone text",
            type: "textarea",
            rows: 2,
          },
        ]}
      />
      <ResourceManager
        resourceName="Achievement"
        rows={rows ?? []}
        createAction={createAchievement}
        updateAction={updateAchievement}
        deleteAction={deleteAchievement}
        toggleAction={toggleAchievementPublish}
        emptyTitle="No achievements yet"
        emptyMessage="Add your first stat counter."
        columns={[
          {
            key: "value",
            header: "Value",
            render: (r) => (
              <span className="font-display text-lg font-semibold text-gold-light">
                {r.value}
                {r.suffix}
              </span>
            ),
          },
          {
            key: "label",
            header: "Label",
            render: (r) => (
              <span>
                <span className="block font-semibold">{r.label}</span>
                <span className="block text-xs text-sand">{r.note}</span>
              </span>
            ),
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
          { name: "value", label: "Value", type: "number", required: true, placeholder: "300" },
          { name: "suffix", label: "Suffix", type: "text", placeholder: "+", hint: "e.g. +, %, k" },
          { name: "label", label: "Label", type: "text", required: true, placeholder: "Students Enrolled" },
          { name: "note", label: "Note", type: "text", placeholder: "At Master Mind Institute" },
          { name: "display_order", label: "Display order", type: "number", placeholder: "0" },
          { name: "is_published", label: "Published", type: "checkbox", hint: "Show this stat on the public site." },
        ]}
      />
    </div>
  );
}
