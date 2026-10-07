"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ChartColumn,
  Home,
  User,
  Layers,
  Briefcase,
  Wrench,
  FolderKanban,
  Trophy,
  Newspaper,
  MessageSquareQuote,
  Mail,
  Link2,
  Image,
  FileText,
  Inbox,
  Users,
  Bot,
  Settings2,
  Search,
  ShieldCheck,
  ScrollText,
  Palette,
  Type,
  PanelBottom,
  Hourglass,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: ChartColumn },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/hero", label: "Hero", icon: Home },
      { href: "/admin/about", label: "About", icon: User },
      { href: "/admin/skills", label: "Skills", icon: Layers },
      { href: "/admin/experience", label: "Experience", icon: Briefcase },
      { href: "/admin/services", label: "Services", icon: Wrench },
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/achievements", label: "Achievements", icon: Trophy },
      { href: "/admin/blog", label: "Blog", icon: Newspaper },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
    ],
  },
  {
    label: "Site",
    items: [
      { href: "/admin/appearance", label: "Appearance", icon: Palette },
      { href: "/admin/section-headings", label: "Section Headings", icon: Type },
      { href: "/admin/footer", label: "Footer", icon: PanelBottom },
      { href: "/admin/placeholders", label: "Placeholders", icon: Hourglass },
      { href: "/admin/contact-info", label: "Contact Info", icon: Mail },
      { href: "/admin/social-links", label: "Social Links", icon: Link2 },
      { href: "/admin/media", label: "Media Library", icon: Image },
      { href: "/admin/cv", label: "CV / Resume", icon: FileText },
      { href: "/admin/sections", label: "Sections", icon: Settings2 },
      { href: "/admin/seo", label: "SEO", icon: Search },
    ],
  },
  {
    label: "Engagement",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Inbox },
      { href: "/admin/leads", label: "Leads", icon: Users },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/ai", label: "AI Settings", icon: Bot },
      { href: "/admin/users", label: "Users & Roles", icon: Users },
      { href: "/admin/audit", label: "Audit Logs", icon: ScrollText },
      { href: "/admin/security", label: "Security", icon: ShieldCheck },
    ],
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto px-4 py-6">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="flex items-center gap-3 px-2"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-muted/50 bg-gold/10 font-display text-lg font-bold text-gold">
          AA
        </span>
        <span className="leading-tight">
          <span className="block font-display text-base font-semibold tracking-wide text-cream">
            Admin Panel
          </span>
          <span className="block text-[11px] uppercase tracking-[0.18em] text-sand/70">
            Portfolio CMS
          </span>
        </span>
      </Link>

      {NAV.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-sand/60">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "border border-gold-muted/40 bg-gold/10 font-semibold text-gold-light"
                        : "border border-transparent text-sand hover:bg-white/5 hover:text-cream"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
