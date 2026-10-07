import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublishedPosts, type BlogPost } from "@/lib/blog";
import type { SiteContent } from "@/lib/site-data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PostCard({ post }: { post: BlogPost }) {
  const date = formatDate(post.published_at);
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <Card className="h-full transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-gold-muted/70">
        <CardHeader>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-sand">
            {date ? <span>{date}</span> : null}
            {typeof post.reading_time === "number" && post.reading_time > 0 ? (
              <span className="text-gold-muted">&bull; {post.reading_time} min read</span>
            ) : null}
          </div>
          <CardTitle className="pt-1 text-lg leading-snug transition-colors group-hover:text-gold-light">
            {post.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {post.excerpt ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-sand">{post.excerpt}</p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function BlogTeaser({
  heading,
}: {
  heading: SiteContent["headings"][string];
}) {
  const posts = await getPublishedPosts(3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <SectionHeading
        eyebrow={heading.eyebrow}
        title={heading.title}
        description={heading.description || undefined}
      />

      {posts.length === 0 ? (
        <Reveal>
          <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-charcoal p-10 text-center md:p-14">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-muted/60 bg-gold/10 text-gold-light">
              <PenLine className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-display text-2xl font-semibold tracking-wide text-cream">
              Insights coming soon
            </h3>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-sand">
              Articles on YouTube automation, AI content systems, and digital marketing are on
              the way. Check back soon.
            </p>
          </div>
        </Reveal>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.slug} delay={i * 0.08} className="h-full">
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.15} className="mt-10 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gold-light transition-colors hover:text-gold"
            >
              View all articles
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </>
      )}
    </div>
  );
}
