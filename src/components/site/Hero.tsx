import Image from "next/image";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { SiteContent } from "@/lib/site-data";
import Reveal from "./Reveal";

interface HeroProps {
  profile: SiteContent["profile"];
  hero: SiteContent["hero"];
  achievements: SiteContent["achievements"];
}

/**
 * Renders the name with the middle word(s) in gold, preserving the
 * signature "MUHAMMAD ASHAR ASIF" treatment for the default name while
 * staying graceful for admin-edited names.
 */
function GoldName({ name }: { name: string }) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;
  if (words.length === 1) {
    return <span className="text-gold">{words[0]}</span>;
  }
  if (words.length === 2) {
    return (
      <>
        {words[0]} <span className="text-gold">{words[1]}</span>
      </>
    );
  }
  return (
    <>
      {words[0]}{" "}
      <span className="text-gold">{words.slice(1, -1).join(" ")}</span>{" "}
      {words[words.length - 1]}
    </>
  );
}

export default function Hero({ profile, hero, achievements }: HeroProps) {
  const metrics = achievements.slice(0, 3);

  return (
    <div className="relative overflow-hidden">
      {/* Ambient backdrop */}
      <div className="tech-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="orb pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-32 sm:px-6 md:pt-40 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Copy column — staggered entrance */}
        <div className="flex flex-col items-start gap-6">
          <Reveal variant="fade-in">
            <Badge variant="default">{hero.badge}</Badge>
          </Reveal>

          <Reveal variant="fade-up" delay={0.08}>
            <h1 className="font-display text-5xl font-bold uppercase leading-[1.05] tracking-wide text-cream md:text-6xl xl:text-7xl">
              <GoldName name={profile.name} />
            </h1>
          </Reveal>

          <Reveal variant="fade-up" delay={0.16}>
            <p className="max-w-xl text-lg font-medium leading-relaxed text-cream/90">
              {profile.headline}
            </p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-sand">{profile.shortBio}</p>
          </Reveal>

          <Reveal variant="fade-up" delay={0.24}>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={hero.ctaPrimaryUrl}
                className={buttonVariants({ variant: "default", size: "lg", className: "btn-lift" })}
              >
                {hero.ctaPrimaryLabel}
              </a>
              <a
                href={hero.ctaSecondaryUrl}
                className={buttonVariants({ variant: "outline", size: "lg", className: "btn-lift" })}
              >
                {hero.ctaSecondaryLabel}
              </a>
              <a
                href={hero.cvUrl}
                className={buttonVariants({ variant: "ghost", size: "lg", className: "underline underline-offset-4" })}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {hero.cvLabel}
              </a>
            </div>
          </Reveal>

          <Reveal variant="fade-up" delay={0.32}>
            <dl className="mt-4 grid grid-cols-3 gap-6 border-t border-line pt-6 sm:gap-10">
              {metrics.map((m, i) => (
                <div key={m.label ?? i}>
                  <dt className="sr-only">{m.label}</dt>
                  <dd className="font-display text-3xl font-semibold text-gold-light md:text-4xl">
                    {m.value}
                    {m.suffix}
                  </dd>
                  <dd className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-sand">
                    {m.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Portrait column — zoom entrance + slow float */}
        <Reveal variant="zoom" delay={0.2} className="flex justify-center lg:justify-end">
          <div className="animate-float relative h-72 w-72 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
            <div
              className="absolute -inset-8 rounded-full bg-gold/15 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="tech-grid absolute -inset-4 rounded-full opacity-70"
              aria-hidden="true"
            />
            <div
              className="absolute -inset-1.5 rounded-full border border-gold/40"
              aria-hidden="true"
            />
            <Image
              src={profile.profileImage}
              alt={`Portrait of ${profile.name}`}
              width={384}
              height={384}
              priority
              className="relative h-full w-full rounded-full object-cover ring-2 ring-gold ring-offset-8 ring-offset-ink"
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
