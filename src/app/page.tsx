import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getSiteContent } from "@/lib/site-data";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ChatWidget from "@/components/site/ChatWidget";
import AmbientBackground from "@/components/site/AmbientBackground";
import Hero from "@/components/site/Hero";
import About from "@/components/site/About";
import Skills from "@/components/site/Skills";
import Experience from "@/components/site/Experience";
import Services from "@/components/site/Services";
import Projects from "@/components/site/Projects";
import Achievements from "@/components/site/Achievements";
import BlogTeaser from "@/components/site/BlogTeaser";
import Testimonials from "@/components/site/Testimonials";
import Contact from "@/components/site/Contact";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return {
    title: content.seo.title,
    description: content.seo.description,
  };
}

export default async function Home() {
  const content = await getSiteContent();
  const { theme, headings, placeholders } = content;

  const navbarProps = {
    brandName: theme.brandName,
    logoImageUrl: theme.logoImageUrl,
    monogram: content.profile.monogram,
    ctaLabel: theme.navCtaLabel,
    enabledSections: content.sections.filter((s) => s.enabled).map((s) => s.key),
  };

  // Map section keys -> components, driven by the admin-configurable
  // `sections` setting (getSiteContent falls back to defaultSections).
  // Every user-visible string flows from site_settings via getSiteContent.
  const sectionMap: Record<string, ReactNode> = {
    hero: (
      <Hero profile={content.profile} hero={content.hero} achievements={content.achievements} />
    ),
    about: <About profile={content.profile} about={content.about} heading={headings.about} />,
    skills: <Skills skills={content.skills} heading={headings.skills} />,
    experience: <Experience experience={content.experience} heading={headings.experience} />,
    services: <Services services={content.services} heading={headings.services} />,
    projects: (
      <Projects
        projects={content.projects}
        heading={headings.projects}
        placeholders={placeholders}
      />
    ),
    achievements: (
      <Achievements achievements={content.achievements} heading={headings.achievements} milestone={content.milestone} />
    ),
    blog: <BlogTeaser heading={headings.blog} />,
    testimonials: (
      <Testimonials heading={headings.testimonials} placeholders={placeholders} />
    ),
    contact: (
      <Contact contact={content.contact} socials={content.socials} heading={headings.contact} />
    ),
  };

  const visibleSections = content.sections
    .filter((s) => s.enabled && sectionMap[s.key] !== undefined)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <AmbientBackground />
      <div className="relative z-10">
        <Navbar {...navbarProps} />
        <main>
          {visibleSections.map((section) => (
            <section
              key={section.key}
              id={section.key === "hero" ? "home" : section.key}
              className="scroll-mt-16"
              aria-label={section.label}
            >
              {sectionMap[section.key]}
            </section>
          ))}
        </main>
        <Footer
          socials={content.socials}
          brandName={theme.brandName}
          logoImageUrl={theme.logoImageUrl}
          monogram={content.profile.monogram}
          footer={content.footer}
        />
      </div>
      <ChatWidget />
    </>
  );
}
