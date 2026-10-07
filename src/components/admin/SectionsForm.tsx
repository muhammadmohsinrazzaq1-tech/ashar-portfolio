"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/admin/EmptyState";
import { updateSections, initializeSections } from "@/app/admin/actions";

export interface SectionRow {
  id: string;
  section_key: string;
  enabled: boolean;
  display_order: number;
}

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  about: "About",
  skills: "Skills",
  experience: "Experience",
  services: "Services",
  projects: "Projects",
  achievements: "Achievements",
  blog: "Blog",
  testimonials: "Testimonials",
  contact: "Contact",
};

export function SectionsForm({ sections }: { sections: SectionRow[] }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateSections(fd);
      if (result.ok) setSaved(true);
      else setError(result.error ?? "Could not save sections.");
    });
  }

  async function handleInit() {
    setError(null);
    startTransition(async () => {
      const result = await initializeSections();
      if (!result.ok) setError(result.error ?? "Could not initialize sections.");
    });
  }

  if (sections.length === 0) {
    return (
      <EmptyState
        title="No section settings yet"
        message="Initialize the default homepage sections to start controlling visibility and order."
        action={
          <Button onClick={handleInit} disabled={isPending}>
            {isPending ? "Initializing…" : "Initialize default sections"}
          </Button>
        }
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="overflow-x-auto rounded-xl border border-line bg-charcoal">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-graphite/70">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-sand">
                Section
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-sand">
                Enabled
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-sand">
                Order
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-sand">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {sections.map((s) => (
              <tr key={s.id} className="border-b border-line/50 last:border-0">
                <td className="px-4 py-3 font-semibold text-cream">
                  <input type="hidden" name="id" value={s.id} />
                  {SECTION_LABELS[s.section_key] ?? s.section_key}
                  <span className="block text-xs font-normal text-sand">
                    <code className="text-gold-light/70">{s.section_key}</code>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    name={`enabled_${s.id}`}
                    defaultChecked={s.enabled}
                    className="h-4 w-4 cursor-pointer accent-[#c79a2b]"
                    aria-label={`Enable ${s.section_key}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    name={`order_${s.id}`}
                    defaultValue={s.display_order}
                    className="h-9 w-24"
                    aria-label={`Order for ${s.section_key}`}
                  />
                </td>
                <td className="px-4 py-3">
                  {s.enabled ? <Badge>Visible</Badge> : <Badge variant="muted">Hidden</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      {saved && (
        <p className="mt-4 rounded-md border border-gold-muted/40 bg-gold/10 px-4 py-3 text-sm text-gold-light">
          Sections saved. The public homepage will update on its next render.
        </p>
      )}

      <div className="mt-4">
        <Button type="submit" disabled={isPending}>
          <Save className="h-4 w-4" />
          {isPending ? "Saving…" : "Save sections"}
        </Button>
      </div>
    </form>
  );
}
