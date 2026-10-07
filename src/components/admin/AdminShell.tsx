"use client";

import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Admin shell: fixed sidebar on desktop, slide-over drawer on mobile,
 * sticky header row, and a constrained content column.
 */
export function AdminShell({
  header,
  sidebar,
  children,
}: {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink text-cream">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-charcoal lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-line bg-charcoal">
            <div className="flex justify-end p-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                title="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="h-[calc(100%-3rem)]" onClick={() => setOpen(false)}>
              {sidebar}
            </div>
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 border-b border-line bg-ink/90 backdrop-blur">
          <div className="flex items-center gap-2 px-4 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
              onClick={() => setOpen(true)}
              title="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">{header}</div>
          </div>
        </div>
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
