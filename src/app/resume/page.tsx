import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, Mail, Phone } from "lucide-react";
import { getSiteContent } from "@/lib/site-data";
import { footerProps, navbarProps } from "@/components/site/chrome-props";
import { socialIconMap } from "@/components/site/icons";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import PrintButton from "@/components/site/PrintButton";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return {
    title: content.resume.pageTitle,
    description: `Resume of ${content.profile.name} — ${content.profile.headline}.`,
  };
}

/**
 * Printable CV page. Renders the same admin-editable content as the public
 * site (name, headline, bio, skills, experience, education, socials) —
 * still strictly verified facts only, never invented. Print styles switch
 * to a light background via `print:` variants; the nav, footer, and print
 * button are hidden in print output.
 */
export default async function ResumePage() {
  const content = await getSiteContent();
  const { profile, about, resume } = content;

  return (
    <>
      <div className="print:hidden">
        <Navbar {...navbarProps(content)} />
      </div>

      <main className="bg-ink print:bg-white print:text-neutral-900">
        <div className="mx-auto max-w-4xl px-4 pb-20 pt-24 sm:px-6 md:pt-32">
          {/* Actions */}
          <div className="mb-8 flex items-center justify-between print:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-sand transition-colors hover:text-gold-light"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {resume.backLabel}
            </Link>
            <PrintButton />
          </div>

          <article className="overflow-hidden rounded-2xl border border-line bg-charcoal print:rounded-none print:border-none print:bg-white">
            {/* Header */}
            <header className="border-b border-line bg-graphite p-8 md:p-10 print:border-neutral-200 print:bg-white">
              <p className="font-display text-4xl font-bold uppercase tracking-wide text-cream print:text-neutral-900 md:text-5xl">
                {profile.name}
              </p>
              <p className="mt-3 text-base font-medium leading-relaxed text-gold-light print:text-neutral-700">
                {profile.headline}
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-sand print:text-neutral-600">
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2 hover:text-gold-light print:text-neutral-700"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {profile.email}
                </a>
                <a
                  href={`tel:${profile.phone}`}
                  className="inline-flex items-center gap-2 hover:text-gold-light print:text-neutral-700"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {profile.phone}
                </a>
              </div>
            </header>

            <div className="flex flex-col gap-10 p-8 md:p-10">
              {/* Summary */}
              <section aria-labelledby="resume-summary">
                <h2
                  id="resume-summary"
                  className="font-display text-xl font-semibold uppercase tracking-[0.14em] text-gold print:text-neutral-900"
                >
                  {resume.summaryHeading}
                </h2>
                <div className="gold-rule my-4" aria-hidden="true" />
                <p className="text-base leading-relaxed text-cream/90 print:text-neutral-700">
                  {about.bio}
                </p>
              </section>

              {/* Skills */}
              <section aria-labelledby="resume-skills">
                <h2
                  id="resume-skills"
                  className="font-display text-xl font-semibold uppercase tracking-[0.14em] text-gold print:text-neutral-900"
                >
                  {resume.skillsHeading}
                </h2>
                <div className="gold-rule my-4" aria-hidden="true" />
                <ul className="grid gap-3 sm:grid-cols-2">
                  {content.skills.map((s) => (
                    <li key={s.title} className="flex items-start gap-3 text-sm">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-gold print:text-neutral-700"
                        aria-hidden="true"
                      />
                      <span>
                        <span className="font-semibold text-cream print:text-neutral-900">
                          {s.title}
                        </span>
                        <span className="text-sand print:text-neutral-600"> — {s.description}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Experience */}
              <section aria-labelledby="resume-experience">
                <h2
                  id="resume-experience"
                  className="font-display text-xl font-semibold uppercase tracking-[0.14em] text-gold print:text-neutral-900"
                >
                  {resume.experienceHeading}
                </h2>
                <div className="gold-rule my-4" aria-hidden="true" />
                <div className="flex flex-col gap-8">
                  {content.experience.map((job) => (
                    <div key={`${job.company}-${job.role}`}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-lg font-semibold text-cream print:text-neutral-900">
                          {job.role} <span className="text-sand print:text-neutral-600">— {job.company}</span>
                        </h3>
                        <p className="text-sm text-sand print:text-neutral-600">
                          {job.duration} &bull; {job.status}
                        </p>
                      </div>
                      <ul className="mt-3 flex flex-col gap-1.5">
                        {job.responsibilities.map((r) => (
                          <li key={r} className="text-sm text-cream/90 print:text-neutral-700">
                            &bull; {r}
                          </li>
                        ))}
                      </ul>
                      {job.achievements.length > 0 ? (
                        <ul className="mt-3 flex flex-col gap-1.5">
                          {job.achievements.map((a) => (
                            <li
                              key={a}
                              className="flex items-start gap-2 text-sm text-cream/90 print:text-neutral-700"
                            >
                              <Check
                                className="mt-0.5 h-4 w-4 shrink-0 text-gold print:text-neutral-700"
                                aria-hidden="true"
                              />
                              {a}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>

              {/* Education */}
              <section aria-labelledby="resume-education">
                <h2
                  id="resume-education"
                  className="font-display text-xl font-semibold uppercase tracking-[0.14em] text-gold print:text-neutral-900"
                >
                  {resume.educationHeading}
                </h2>
                <div className="gold-rule my-4" aria-hidden="true" />
                <p className="text-base font-semibold text-cream print:text-neutral-900">
                  {about.qualification} — {about.program}
                </p>
                <p className="mt-1 text-sm text-sand print:text-neutral-600">
                  {about.institute}, {about.year}
                </p>
              </section>

              {/* Socials */}
              <section aria-labelledby="resume-socials">
                <h2
                  id="resume-socials"
                  className="font-display text-xl font-semibold uppercase tracking-[0.14em] text-gold print:text-neutral-900"
                >
                  Online Profiles
                </h2>
                <div className="gold-rule my-4" aria-hidden="true" />
                <ul className="flex flex-wrap gap-4">
                  {content.socials.map((s) => {
                    const Icon = socialIconMap[s.key];
                    return (
                      <li key={s.key}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-sand hover:text-gold-light print:text-neutral-700"
                        >
                          {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
                          {s.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          </article>
        </div>
      </main>

      <div className="print:hidden">
        <Footer {...footerProps(content)} />
      </div>
    </>
  );
}
