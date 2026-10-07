"use client";

import { useEffect, useRef, useState } from "react";
import { Smartphone } from "lucide-react";
import { iphoneMilestone as defaultMilestone } from "@/lib/content";
import type { SiteContent } from "@/lib/site-data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

interface AchievementsProps {
  achievements: SiteContent["achievements"];
  heading: SiteContent["headings"][string];
  milestone: string;
}

/**
 * Large gold number that counts up once when it scrolls into view.
 * requestAnimationFrame-based; honors reduced motion and the admin
 * "animations off" toggle by jumping straight to the final value.
 */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduceMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.animations === "off";
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || started) return;
        started = true;
        io.disconnect();
        const startedAt = performance.now();
        const duration = 1600;
        const tick = (now: number) => {
          const p = Math.min(1, (now - startedAt) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(Math.round(eased * value));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString("en-US")}
    </span>
  );
}

export default function Achievements({ achievements, heading, milestone }: AchievementsProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <SectionHeading
        eyebrow={heading.eyebrow}
        title={heading.title}
        description={heading.description || undefined}
      />

      <div className="grid gap-5 sm:grid-cols-3">
        {achievements.map((a, i) => (
          <Reveal key={a.label} variant="zoom" delay={i * 0.1}>
            <div className="flex h-full flex-col items-center gap-2 rounded-xl border border-line bg-charcoal px-6 py-10 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-muted/60 hover:shadow-[0_12px_36px_rgba(199,154,43,0.12)]">
              <p className="font-display text-5xl font-bold text-gold md:text-6xl">
                <CountUp value={a.value} />
                {a.suffix}
              </p>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cream">
                {a.label}
              </p>
              <p className="text-sm text-sand">{a.note}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Personal milestone strip — verified fact, no fabricated proof graphics */}
      <Reveal variant="slide-left" delay={0.15} className="mt-8">
        <div className="flex items-center gap-4 rounded-xl border border-gold-muted/50 bg-gradient-to-r from-gold/15 via-gold/5 to-transparent px-6 py-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-muted/60 bg-gold/10 text-gold-light">
            <Smartphone className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm leading-relaxed text-cream/90 md:text-base">
            <span className="font-semibold text-gold-light">Personal milestone: </span>
            {(milestone || defaultMilestone).replace(/^Personal milestone:\s*/i, "")}
          </p>
        </div>
      </Reveal>
    </div>
  );
}
