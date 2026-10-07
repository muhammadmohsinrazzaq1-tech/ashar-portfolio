import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPostBySlug, getPublishedPosts, type BlogPost } from "@/lib/blog";
import { getSiteContent } from "@/lib/site-data";
import { footerProps, navbarProps } from "@/components/site/chrome-props";
import { siteMeta } from "@/lib/content";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ChatWidget from "@/components/site/ChatWidget";
import Reveal from "@/components/site/Reveal";

type SlugParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: SlugParams }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  const description =
    post.excerpt ?? `An article by ${siteMeta.siteName} on YouTube automation, AI, and digital marketing.`;
  return {
    title: post.title,
    description,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      ...(post.published_at ? { publishedTime: post.published_at } : {}),
      ...(post.cover_image ? { images: [{ url: post.cover_image, alt: post.title }] } : {}),
    },
  };
}

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Render stored text content as plain paragraphs — no rich-text pipeline needed. */
function PostBody({ content }: { content: string }) {
  const paragraphs = content
    .split(/\n{2,}|\r\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .flatMap((p) => p.split(/\n/).map((line) => line.trim()).filter((l) => l.length > 0));
  return (
    <div className="flex flex-col gap-5">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-base leading-relaxed text-cream/90 md:text-lg">
          {p}
        </p>
      ))}
    </div>
  );
}

export default async function BlogPostPage({ params }: { params: SlugParams }) {
  const { slug } = await params;
  const [post, allPosts, content] = await Promise.all([
    getPostBySlug(slug),
    getPublishedPosts(),
    getSiteContent(),
  ]);

  if (!post) notFound();

  const date = formatDate(post.published_at);
  const index = allPosts.findIndex((p) => p.slug === post.slug);
  const newer: BlogPost | undefined = index > 0 ? allPosts[index - 1] : undefined; // listed newest-first
  const older: BlogPost | undefined = index >= 0 ? allPosts[index + 1] : undefined;

  return (
    <>
      <Navbar {...navbarProps(content)} />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 md:pt-36">
        <Reveal variant="fade-up">
        <article>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-sand transition-colors hover:text-gold-light"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All articles
          </Link>

          <header className="mt-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-sand">
              <Badge variant="muted">Article</Badge>
              {date ? <time dateTime={post.published_at ?? undefined}>{date}</time> : null}
              {typeof post.reading_time === "number" && post.reading_time > 0 ? (
                <span className="text-gold-muted">&bull; {post.reading_time} min read</span>
              ) : null}
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-wide text-cream md:text-5xl">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="text-lg leading-relaxed text-sand">{post.excerpt}</p>
            ) : null}
            <div className="gold-rule" aria-hidden="true" />
          </header>

          {post.cover_image ? (
            <div className="mt-8 overflow-hidden rounded-xl border border-line">
              <Image
                src={post.cover_image}
                alt={post.title}
                width={1024}
                height={576}
                className="aspect-video w-full object-cover"
              />
            </div>
          ) : null}

          <div className="mt-8">
            {post.content ? (
              <PostBody content={post.content} />
            ) : (
              <p className="text-sand">This article has no body content yet.</p>
            )}
          </div>

          {(newer || older) && (
            <nav
              aria-label="More articles"
              className="mt-14 grid gap-4 border-t border-line pt-8 sm:grid-cols-2"
            >
              {older ? (
                <Link
                  href={`/blog/${older.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-line bg-charcoal p-5 transition-colors hover:border-gold-muted/60"
                >
                  <ChevronLeft className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  <span>
                    <span className="block text-xs uppercase tracking-[0.16em] text-sand">
                      Older
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-cream group-hover:text-gold-light">
                      {older.title}
                    </span>
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {newer ? (
                <Link
                  href={`/blog/${newer.slug}`}
                  className="group flex items-center justify-end gap-3 rounded-xl border border-line bg-charcoal p-5 text-right transition-colors hover:border-gold-muted/60"
                >
                  <span>
                    <span className="block text-xs uppercase tracking-[0.16em] text-sand">
                      Newer
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-cream group-hover:text-gold-light">
                      {newer.title}
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                </Link>
              ) : null}
            </nav>
          )}
        </article>
        </Reveal>
      </main>
      <Footer {...footerProps(content)} />
      <ChatWidget />
    </>
  );
}
