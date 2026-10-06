import Link from "next/link";
import {
  Newspaper,
  Inbox,
  Users,
  MessageSquareQuote,
  Image,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { isSupabaseConfigured, createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Dashboard | Admin" };

const QUICK_LINKS = [
  { href: "/admin/blog/new", label: "New blog post" },
  { href: "/admin/media", label: "Upload media" },
  { href: "/admin/cv", label: "Upload CV" },
  { href: "/admin/leads", label: "Add lead" },
  { href: "/admin/messages", label: "View messages" },
  { href: "/admin/sections", label: "Manage sections" },
];

export default async function AdminDashboardPage() {
  const connected = isSupabaseConfigured();
  let stats = { posts: 0, unread: 0, leads: 0, testimonials: 0, media: 0 };

  if (connected) {
    const supabase = await createServerSupabaseClient();
    const [posts, unread, leads, testimonials, media] = await Promise.all([
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase.from("testimonials").select("id", { count: "exact", head: true }),
      supabase.from("media_assets").select("id", { count: "exact", head: true }).eq("status", "active"),
    ]);
    stats = {
      posts: posts.count ?? 0,
      unread: unread.count ?? 0,
      leads: leads.count ?? 0,
      testimonials: testimonials.count ?? 0,
      media: media.count ?? 0,
    };
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A quick overview of your portfolio content and activity."
      />

      <div className="mb-6 flex items-center gap-2">
        <Badge variant={connected ? "default" : "muted"}>
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          {connected ? "Supabase connected" : "Supabase not configured"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={Newspaper} label="Blog posts" value={stats.posts} href="/admin/blog" />
        <StatCard
          icon={Inbox}
          label="Unread messages"
          value={stats.unread}
          href="/admin/messages"
          hint={stats.unread > 0 ? "Needs your attention" : "All caught up"}
        />
        <StatCard icon={Users} label="Leads" value={stats.leads} href="/admin/leads" />
        <StatCard
          icon={MessageSquareQuote}
          label="Testimonials"
          value={stats.testimonials}
          href="/admin/testimonials"
        />
        <StatCard icon={Image} label="Media assets" value={stats.media} href="/admin/media" />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between rounded-md border border-line bg-graphite px-4 py-3 text-sm text-cream transition-colors hover:border-gold-muted/60"
              >
                {link.label}
                <ArrowRight className="h-4 w-4 text-sand transition-transform group-hover:translate-x-0.5 group-hover:text-gold-light" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
