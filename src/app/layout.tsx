import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { getPublicSettings } from "@/lib/site-data";
import { siteMeta } from "@/lib/content";
import {
  DEFAULT_FONT_BODY,
  DEFAULT_FONT_HEADING,
  deriveThemeColors,
  fontStack,
  googleFontsHref,
  sanitizeFont,
} from "@/lib/fonts";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function nonEmpty(value: string | undefined, fallback: string): string {
  return value && value.trim() !== "" ? value : fallback;
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getPublicSettings();
  const title = nonEmpty(s.seo_title, siteMeta.title);
  const description = nonEmpty(s.seo_description, siteMeta.description);
  const ogImage = nonEmpty(s.og_image_url, "/images/profile.png");
  const favicon = s.favicon_url?.trim() ?? "";
  const brandName = nonEmpty(s.brand_name, siteMeta.siteName);

  return {
    title: {
      default: title,
      template: `%s | ${brandName}`,
    },
    description,
    metadataBase: new URL(siteUrl),
    ...(favicon ? { icons: { icon: [{ url: favicon }] } } : {}),
    openGraph: {
      type: "website",
      siteName: brandName,
      title,
      description,
      images: [{ url: ogImage, alt: brandName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const s = await getPublicSettings();

  const fontHeading = sanitizeFont(s.font_heading, DEFAULT_FONT_HEADING);
  const fontBody = sanitizeFont(s.font_body, DEFAULT_FONT_BODY);
  const colors = deriveThemeColors(s.accent_color, s.bg_color);
  const animationsOn = (s.animations_enabled ?? "true") !== "false";
  const fontsHref = googleFontsHref(fontHeading, fontBody);

  // Runtime theme: fonts + palette as CSS-variable overrides. Tailwind v4
  // utilities (text-gold, bg-ink, font-display, …) all reference these
  // variables, so admin choices apply without a rebuild.
  const themeStyle = {
    "--font-display": fontStack(fontHeading, "--font-sora"),
    "--font-sans": fontStack(fontBody, "--font-inter"),
    "--color-gold": colors.gold,
    "--color-gold-light": colors.goldLight,
    "--color-gold-muted": colors.goldMuted,
    "--color-ink": colors.ink,
    "--color-charcoal": colors.charcoal,
    "--color-graphite": colors.graphite,
    "--color-line": colors.line,
  } as CSSProperties;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} h-full`}
      data-animations={animationsOn ? "on" : "off"}
    >
      {fontsHref ? (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link rel="stylesheet" href={fontsHref} />
        </>
      ) : null}
      <body
        className="min-h-full bg-ink font-sans text-cream antialiased"
        style={themeStyle}
      >
        {children}
      </body>
    </html>
  );
}
