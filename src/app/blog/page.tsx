import type { Metadata } from "next";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPublishedPosts, type BlogPost } from "@/lib/blog";
import { getSiteContent } from "@/lib/site-data";
import { footerProps, navbarProps } from "@/components/site/chrome-props";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ChatWidget from "@/components/site/ChatWidget";
import Reveal from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles by Muhammad Ashar Asif on YouTube automation, AI content workflows, and digital marketing.",
};

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ArticleCard({ post }: { post: BlogPost }) {
  const date = formatDate(post.published_at);
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="h-full">
        <Card className="h-full transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-gold-muted/70">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-sand">
              {date ? <time dateTime={post.published_at ?? undefined}>{date}</time> : null}
              {typeof post.reading_time === "number" && post.reading_time > 0 ? (
                <span className="text-gold-muted">&bull; {post.reading_time} min read</span>
              ) : null}
            </div>
            <CardTitle className="pt-1 text-xl leading-snug transition-colors group-hover:text-gold-light">
              {post.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {post.excerpt ? (
              <p className="line-clamp-3 text-sm leading-relaxed text-sand">{post.excerpt}</p>
            ) : null}
          </CardContent>
        </Card>
      </article>
    </Link>
  );
}

export default async function BlogIndexPage() {
  const [posts, content] = await Promise.all([getPublishedPosts(), getSiteContent()]);

  return (
    <>
      <Navbar {...navbarProps(content)} />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 md:pt-36 lg:px-8">
        <Reveal variant="fade-up">
          <header className="mb-12 flex flex-col items-center gap-4 text-center md:mb-16">
          <Badge variant="default">Blog</Badge>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-cream md:text-5xl">
            Insights &amp; Articles
          </h1>
          <div className="gold-rule w-24" aria-hidden="true" />
          <p className="max-w-2xl text-base leading-relaxed text-sand">
            Practical notes on YouTube automation, AI content systems, and digital marketing.
          </p>
        </header>
        </Reveal>

        {posts.length === 0 ? (
          <Reveal variant="zoom">
          <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-charcoal p-10 text-center md:p-14">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-muted/60 bg-gold/10 text-gold-light">
              <PenLine className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-semibold tracking-wide text-cream">
              Insights coming soon
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-sand">
              Articles are on the way. Check back soon for practical guidance on YouTube
              automation, AI workflows, and digital marketing.
            </p>
          </div>
          </Reveal>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.slug} delay={(i % 3) * 0.08} className="h-full">
                <ArticleCard post={post} />
              </Reveal>
            ))}
          </div>
        )}
      </main>
      <Footer {...footerProps(content)} />
      <ChatWidget />
    </>
  );
}
