import { FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SiteContent } from "@/lib/site-data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

interface ProjectsProps {
  projects: SiteContent["projects"];
  heading: SiteContent["headings"][string];
  placeholders: SiteContent["placeholders"];
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * Projects section. The projects list is intentionally empty by design —
 * content.ts forbids inventing projects — so the default render is a
 * premium "coming soon" panel. If verified rows ever exist (future DB
 * content), they render as case-study cards. Fully defensive: never
 * crashes on unexpected row shapes.
 */
export default function Projects({ projects, heading, placeholders }: ProjectsProps) {
  const hasProjects = Array.isArray(projects) && projects.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <SectionHeading
        eyebrow={heading.eyebrow}
        title={heading.title}
        description={heading.description || undefined}
      />

      {!hasProjects ? (
        <Reveal variant="zoom">
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-gold-muted/40 bg-charcoal p-10 text-center md:p-14">
            <div className="tech-grid pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="relative flex flex-col items-center gap-5">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-muted/60 bg-gold/10 text-gold-light">
                <FolderOpen className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="font-display text-2xl font-semibold tracking-wide text-cream md:text-3xl">
                {placeholders.projectsTitle}
              </h3>
              <p className="max-w-xl text-base leading-relaxed text-sand">
                {placeholders.projectsBody}
              </p>
              <Badge variant="muted">Verified work only — no filler</Badge>
            </div>
          </div>
        </Reveal>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((raw, i) => {
            const p = (raw ?? {}) as Record<string, unknown>;
            const title = asString(p.title) ?? asString(p.name) ?? "Untitled project";
            const summary =
              asString(p.summary) ?? asString(p.description) ?? asString(p.excerpt);
            const tags = Array.isArray(p.tags) ? p.tags.filter((t) => typeof t === "string") : [];
            const link = asString(p.url) ?? asString(p.link);
            return (
              <Reveal key={asString(p.slug) ?? asString(p.id) ?? i} delay={(i % 3) * 0.08}>
                <Card className="h-full transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-muted/70">
                  <CardHeader>
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 pt-0">
                    {summary ? (
                      <p className="text-sm leading-relaxed text-sand">{summary}</p>
                    ) : null}
                    {tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((t) => (
                          <Badge key={t} variant="muted">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-gold-light hover:text-gold"
                      >
                        View case study
                      </a>
                    ) : null}
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
