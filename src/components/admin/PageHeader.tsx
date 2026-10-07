import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  title,
  description,
  action,
  backHref,
  backLabel = "Back",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mb-8">
      {backHref && (
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-sand transition-colors hover:text-gold-light"
        >
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-wide text-cream">
            {title}
          </h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm text-sand">{description}</p>}
        </div>
        {action}
      </div>
      <div className="gold-rule mt-5" />
    </div>
  );
}
