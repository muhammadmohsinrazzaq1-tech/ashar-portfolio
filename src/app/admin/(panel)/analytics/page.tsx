import { createServerSupabaseClient } from "@/lib/supabase";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Analytics | Admin" };

function last14Days(): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default async function AdminAnalyticsPage() {
  const supabase = await createServerSupabaseClient();

  const [{ data: messages }, { data: leads }, { data: posts }] = await Promise.all([
    supabase.from("contact_messages").select("created_at").order("created_at", { ascending: false }).limit(500),
    supabase.from("leads").select("status"),
    supabase.from("blog_posts").select("status"),
  ]);

  const days = last14Days();
  const messagesByDay = new Map<string, number>(days.map((d) => [d, 0]));
  for (const m of messages ?? []) {
    const day = new Date(m.created_at).toISOString().slice(0, 10);
    if (messagesByDay.has(day)) {
      messagesByDay.set(day, (messagesByDay.get(day) ?? 0) + 1);
    }
  }
  const maxMessages = Math.max(1, ...messagesByDay.values());

  const leadsByStatus = new Map<string, number>();
  for (const l of leads ?? []) {
    leadsByStatus.set(l.status, (leadsByStatus.get(l.status) ?? 0) + 1);
  }
  const maxLeads = Math.max(1, ...leadsByStatus.values(), 1);

  const publishedPosts = (posts ?? []).filter((p) => p.status === "published").length;
  const draftPosts = (posts ?? []).filter((p) => p.status === "draft").length;

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Straightforward counts from your own data — no estimates, no fabricated charts."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Messages received</CardTitle>
            <CardDescription>Contact form submissions per day, last 14 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {days.map((day) => {
                const count = messagesByDay.get(day) ?? 0;
                return (
                  <div key={day} className="flex items-center gap-3 text-xs">
                    <span className="w-20 shrink-0 text-sand">
                      {new Date(`${day}T00:00:00`).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <div className="h-5 flex-1 rounded-sm bg-graphite">
                      <div
                        className="h-full rounded-sm bg-gold/70"
                        style={{ width: `${(count / maxMessages) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-cream">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads by status</CardTitle>
            <CardDescription>Current CRM pipeline breakdown.</CardDescription>
          </CardHeader>
          <CardContent>
            {leadsByStatus.size === 0 ? (
              <p className="text-sm text-sand/70">No leads yet.</p>
            ) : (
              <div className="space-y-3">
                {[...leadsByStatus.entries()].map(([status, count]) => (
                  <div key={status} className="flex items-center gap-3 text-sm">
                    <Badge variant="muted" className="w-28 justify-center capitalize">
                      {status}
                    </Badge>
                    <div className="h-5 flex-1 rounded-sm bg-graphite">
                      <div
                        className="h-full rounded-sm bg-gold/70"
                        style={{ width: `${(count / maxLeads) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-cream">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blog posts</CardTitle>
            <CardDescription>Published vs draft.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-6">
            <div>
              <p className="font-display text-3xl font-semibold text-gold-light">{publishedPosts}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-sand">Published</p>
            </div>
            <div>
              <p className="font-display text-3xl font-semibold text-cream">{draftPosts}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-sand">Drafts</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
            <CardDescription>All-time counts.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-6">
            <div>
              <p className="font-display text-3xl font-semibold text-cream">{messages?.length ?? 0}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-sand">Messages</p>
            </div>
            <div>
              <p className="font-display text-3xl font-semibold text-cream">{leads?.length ?? 0}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-sand">Leads</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
