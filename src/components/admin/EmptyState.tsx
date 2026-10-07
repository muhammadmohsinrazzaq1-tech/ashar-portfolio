import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-charcoal/60 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-graphite text-gold">
        <Icon className="h-5 w-5" />
      </span>
      <p className="font-display text-lg font-semibold tracking-wide text-cream">
        {title}
      </p>
      <p className="max-w-md text-sm text-sand">{message}</p>
      {action}
    </div>
  );
}
