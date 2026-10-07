"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { SiteContent } from "@/lib/site-data";
import { socialIconMap } from "./icons";

interface FooterProps {
  socials: SiteContent["socials"];
  brandName: string;
  logoImageUrl: string;
  monogram: string;
  footer: SiteContent["footer"];
}

function FooterLogoMark({
  src,
  monogram,
  alt,
}: {
  src: string;
  monogram: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-muted/70 bg-gold/10 font-display text-sm font-bold tracking-widest text-gold-light">
        {monogram}
      </span>
    );
  }

  return (
    <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-gold/70 ring-offset-2 ring-offset-charcoal">
      <Image
        src={src}
        alt={alt}
        width={80}
        height={80}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

export default function Footer({
  socials,
  brandName,
  logoImageUrl,
  monogram,
  footer,
}: FooterProps) {
  return (
    <footer className="border-t border-line bg-charcoal">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="#home" className="flex items-center gap-3" aria-label="Back to top">
              <FooterLogoMark
                src={logoImageUrl}
                monogram={monogram}
                alt={`${brandName} logo`}
              />
              <span className="font-display text-lg font-semibold uppercase tracking-wider text-cream">
                {brandName}
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-sand">{footer.about}</p>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-sand">
              {footer.navHeading}
            </h3>
            <ul className="grid grid-cols-2 gap-2">
              {footer.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-sand transition-colors hover:text-gold-light"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-sand">
              {footer.connectHeading}
            </h3>
            <div className="flex flex-wrap gap-3">
              {socials.map((s) => {
                const Icon = socialIconMap[s.key];
                return (
                  <a
                    key={s.key}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-graphite text-sand transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-muted/60 hover:text-gold-light"
                  >
                    {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-8 text-sm text-sand sm:flex-row">
          <p>{footer.copyright}</p>
          {footer.tagline ? (
            <p className="text-xs uppercase tracking-[0.18em]">{footer.tagline}</p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
