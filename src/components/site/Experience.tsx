import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SiteContent } from "@/lib/site-data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

interface ExperienceProps {
  experience: SiteContent["experience"];
  heading: SiteContent["headings"][string];
}

export default function Experience({ experience, heading }: ExperienceProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <SectionHeading
        eyebrow={heading.eyebrow}
        title={heading.title}
        description={heading.description || undefined}
      />

      {/* Vertical gold-line timeline */}
      <div className="relative pl-8 md:pl-12">
        <div
          className="absolute bottom-0 left-2 top-2 w-px bg-gradient-to-b from-gold via-gold-muted to-transparent md:left-4"
          aria-hidden="true"
        />

        <div className="flex flex-col gap-10">
          {experience.map((job, i) => (
            <Reveal key={`${job.company}-${job.role}`} delay={i * 0.08}>
              <div className="relative">
                {/* Timeline node */}
                <span
                  className="absolute -left-8 top-7 h-4 w-4 rounded-full border-2 border-gold bg-ink shadow-[0_0_12px_rgba(199,154,43,0.5)] md:-left-12"
                  aria-hidden="true"
                />

                <Card className="overflow-hidden">
                  <CardHeader className="gap-3 border-b border-line bg-graphite/60 p-6 md:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-2xl font-semibold tracking-wide text-cream">
                          {job.role}
                        </h3>
                        <p className="mt-1 text-sm font-medium uppercase tracking-[0.14em] text-gold">
                          {job.company}
                        </p>
                      </div>
                      <Badge variant="muted">{job.status}</Badge>
                    </div>
                    <p className="text-sm text-sand">{job.duration}</p>
                  </CardHeader>

                  <CardContent className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
                    <div>
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sand">
                        Responsibilities
                      </h4>
                      <ul className="flex flex-col gap-2.5">
                        {job.responsibilities.map((r) => (
                          <li key={r} className="flex items-start gap-3 text-sm text-cream/90">
                            <span
                              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                              aria-hidden="true"
                            />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {job.achievements.length > 0 && (
                      <div>
                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sand">
                          Achievements
                        </h4>
                        <ul className="flex flex-col gap-2.5">
                          {job.achievements.map((a) => (
                            <li key={a} className="flex items-start gap-3 text-sm text-cream/90">
                              <Check
                                className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                                aria-hidden="true"
                              />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
