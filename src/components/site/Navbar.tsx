"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/content";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const hrefToSection: Record<string, string> = {
  "#home": "hero",
  "#about": "about",
  "#skills": "skills",
  "#experience": "experience",
  "#services": "services",
  "#projects": "projects",
  "#achievements": "achievements",
  "#contact": "contact",
};

interface NavbarProps {
  brandName: string;
  logoImageUrl: string;
  monogram: string;
  ctaLabel: string;
  /** Section keys the admin has enabled — nav anchors for disabled sections are hidden. */
  enabledSections?: string[];
}

/**
 * Circular logo: the profile photo with a thin gold ring, matching the
 * hero portrait treatment. Falls back to the monogram if the image is
 * missing or fails to load.
 */
function LogoMark({
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
    <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-gold/70 ring-offset-2 ring-offset-ink">
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

export default function Navbar({
  brandName,
  logoImageUrl,
  monogram,
  ctaLabel,
  enabledSections,
}: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const reduceMotion = useReducedMotion();

  // Links whose section is disabled in the admin panel are hidden, so the
  // navbar always matches the visible page. Non-section links (e.g. /resume)
  // always render.
  const links = navLinks.filter((link) => {
    const section = hrefToSection[link.href];
    return !section || !enabledSections || enabledSections.includes(section);
  });
  const anchorIds = links
    .filter((l) => l.href.startsWith("#"))
    .map((l) => l.href.slice(1));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lightweight scroll-spy for the active-section highlight.
  useEffect(() => {
    const sections = anchorIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-line bg-ink/90 shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-md"
          : "border-transparent bg-ink/40 backdrop-blur-sm"
      )}
    >
      <nav
        aria-label="Primary"
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8",
          scrolled ? "h-14" : "h-16"
        )}
      >
        {/* Brand */}
        <Link href="#home" className="flex items-center gap-3" aria-label="Back to top">
          <LogoMark src={logoImageUrl} monogram={monogram} alt={`${brandName} logo`} />
          <span className="font-display text-lg font-semibold uppercase tracking-wider text-cream">
            {brandName}
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const isAnchor = link.href.startsWith("#");
            const isActive = isAnchor && active === link.href.slice(1);
            return (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={cn(
                    "rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "text-gold-light" : "text-sand hover:text-cream"
                  )}
                  aria-current={isActive ? "true" : undefined}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="hidden lg:block">
          <a
            href="#contact"
            className={buttonVariants({ variant: "default", size: "sm", className: "btn-lift" })}
          >
            {ctaLabel}
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-cream transition-colors hover:bg-white/5 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className="fixed inset-0 top-16 z-40 bg-black/60 lg:hidden"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={reduceMotion ? { duration: 0 } : { type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-0 right-0 top-16 z-50 flex w-72 flex-col border-l border-line bg-charcoal p-6 lg:hidden"
              aria-label="Mobile navigation"
            >
              <ul className="flex flex-col gap-1">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2.5 text-base font-medium text-sand transition-colors hover:bg-white/5 hover:text-cream"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <a
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({ variant: "default", className: "w-full" })}
                >
                  {ctaLabel}
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
