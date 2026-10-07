import Image from "next/image";
import { Check, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SiteContent } from "@/lib/site-data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

interface AboutProps {
  profile: SiteContent["profile"];
  about: SiteContent["about"];
  heading: SiteContent["headings"][string];
}

function splitBio(bio: string): string[] {
  // The seed bio is one long string; break it into readable paragraphs at
  // natural sentence boundaries without altering the wording.
  const sentences = bio.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [bio];
  const paragraphs: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    current = current ? `${current} ${sentence}` : sentence;
    if (current.length > 140) {
      paragraphs.push(current);
      current = "";
    }
  }
  if (current) paragraphs.push(current);
  return paragraphs;
}

function EducationCard({ about }: { about: SiteContent["about"] }) {
  return (
    <Card className="border-gold-muted/40">
      <CardHeader className="flex-row items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gold-muted/50 bg-gold/10 text-gold-light">
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <CardTitle className="text-lg">Education</CardTitle>
          <p className="mt-1 text-sm text-sand">
            {about.qualification} — {about.program}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between gap-4 border-t border-line pt-3">
            <dt className="text-sand">Institute</dt>
            <dd className="text-right font-medium text-cream">{about.institute}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-line pt-3">
            <dt className="text-sand">Year</dt>
            <dd className="font-medium text-cream">{about.year}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

export default function About({ profile, about, heading }: AboutProps) {
  const paragraphs = splitBio(about.bio);

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <SectionHeading
        eyebrow={heading.eyebrow}
        title={heading.title}
        description={heading.description || undefined}
      />

      <div className="grid items-start gap-12 lg:grid-cols-[2fr_3fr] lg:gap-16">
        {/* Portrait */}
        <Reveal variant="slide-right" className="mx-auto w-full max-w-sm lg:mx-0">
          <div className="relative">
            <div
              className="absolute -left-3 -top-3 h-24 w-24 rounded-tl-2xl border-l-2 border-t-2 border-gold"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-3 -right-3 h-24 w-24 rounded-br-2xl border-b-2 border-r-2 border-gold"
              aria-hidden="true"
            />
            <div className="overflow-hidden rounded-2xl border border-line">
              <Image
                src={profile.profileImage}
                alt={`Portrait of ${profile.name}`}
                width={480}
                height={560}
                className="aspect-[6/7] w-full object-cover"
              />
            </div>
          </div>
        </Reveal>

        {/* Story + highlights + education */}
        <div className="flex flex-col gap-8">
          <Reveal variant="slide-left" delay={0.1}>
            <div className="flex flex-col gap-5 text-base leading-relaxed text-sand">
              {paragraphs.map((p, i) => (
                <p key={i} className={i === 0 ? "text-lg text-cream/90" : undefined}>
                  {p}
                </p>
              ))}
            </div>
          </Reveal>

          {about.highlights.length > 0 ? (
            <Reveal variant="fade-up" delay={0.14}>
              <ul className="flex flex-col gap-3">
                {about.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-sm text-cream/90">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold-muted/50 bg-gold/10 text-gold-light">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          <Reveal variant="fade-up" delay={0.18}>
            <EducationCard about={about} />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
