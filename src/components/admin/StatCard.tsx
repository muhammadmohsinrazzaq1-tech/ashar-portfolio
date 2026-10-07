import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <Card
      className={`h-full transition-colors ${href ? "hover:border-gold-muted/60" : ""}`}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gold-muted/40 bg-gold/10 text-gold-light">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-2xl font-semibold text-cream">{value}</p>
          <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-sand">
            {label}
          </p>
          {hint && <p className="mt-0.5 truncate text-xs text-sand/70">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
