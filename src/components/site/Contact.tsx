"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { SiteContent } from "@/lib/site-data";
import { socialIconMap } from "./icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

interface ContactProps {
  contact: SiteContent["contact"];
  socials: SiteContent["socials"];
  heading: SiteContent["headings"][string];
}

interface ApiResponse {
  ok: boolean;
  delivered?: boolean;
  message?: string;
}

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "success"; delivered: boolean; message: string }
  | { state: "error"; message: string };

const inputClass = "w-full";

interface FormText {
  labelName: string;
  labelEmail: string;
  labelSubject: string;
  labelMessage: string;
  placeholderName: string;
  placeholderEmail: string;
  placeholderSubject: string;
  placeholderMessage: string;
  errorName: string;
  errorEmail: string;
  errorSubject: string;
  errorMessage: string;
  sendError: string;
  networkError: string;
}

function ContactForm({ submitLabel, text }: { submitLabel: string; text: FormText }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (name.trim().length < 2) errors.name = text.errorName;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errors.email = text.errorEmail;
    if (subject.trim().length < 3) errors.subject = text.errorSubject;
    if (message.trim().length < 10) errors.message = text.errorMessage;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as ApiResponse;
      if (res.ok && data.ok) {
        const delivered = data.delivered !== false;
        setStatus({
          state: "success",
          delivered,
          message:
            data.message ??
            (delivered
              ? "Your message has been sent successfully. I'll get back to you soon."
              : "Your message was received. Email delivery is still pending, so I'll confirm once it's sent."),
        });
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        // Never claim success on a failure response.
        setStatus({
          state: "error",
          message:
            data.message ?? text.sendError,
        });
      }
    } catch {
      setStatus({
        state: "error",
        message: text.networkError,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5" aria-label="Contact form">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">{text.labelName}</Label>
          <Input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder={text.placeholderName}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
            className={inputClass}
          />
          {fieldErrors.name ? (
            <p id="contact-name-error" role="alert" className="mt-1.5 text-xs text-gold-light">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="contact-email">{text.labelEmail}</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={text.placeholderEmail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
            className={inputClass}
          />
          {fieldErrors.email ? (
            <p id="contact-email-error" role="alert" className="mt-1.5 text-xs text-gold-light">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <Label htmlFor="contact-subject">{text.labelSubject}</Label>
        <Input
          id="contact-subject"
          name="subject"
          type="text"
          placeholder={text.placeholderSubject}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          aria-invalid={Boolean(fieldErrors.subject)}
          aria-describedby={fieldErrors.subject ? "contact-subject-error" : undefined}
          className={inputClass}
        />
        {fieldErrors.subject ? (
          <p id="contact-subject-error" role="alert" className="mt-1.5 text-xs text-gold-light">
            {fieldErrors.subject}
          </p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="contact-message">{text.labelMessage}</Label>
        <Textarea
          id="contact-message"
          name="message"
          placeholder={text.placeholderMessage}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
          className="w-full"
        />
        {fieldErrors.message ? (
          <p id="contact-message-error" role="alert" className="mt-1.5 text-xs text-gold-light">
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      <div aria-live="polite">
        {status.state === "success" ? (
          <p role="status" className="rounded-md border border-gold-muted/60 bg-gold/10 px-4 py-3 text-sm text-gold-light">
            {status.message}
          </p>
        ) : null}
        {status.state === "error" ? (
          <p role="alert" className="rounded-md border border-line bg-graphite px-4 py-3 text-sm text-cream">
            {status.message}
          </p>
        ) : null}
      </div>

      <div>
        <Button type="submit" disabled={status.state === "sending"} className="btn-lift w-full sm:w-auto">
          {status.state === "sending" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function Contact({ contact, socials, heading }: ContactProps) {
  const { email, phone, location } = contact;

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <SectionHeading
        eyebrow={heading.eyebrow}
        title={heading.title}
        description={heading.description || undefined}
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
        {/* Contact details */}
        <Reveal variant="slide-right">
          <div className="flex h-full flex-col gap-6 rounded-2xl border border-line bg-charcoal p-8">
            <div>
              <h3 className="font-display text-xl font-semibold tracking-wide text-cream">
                {contact.detailsHeading}
              </h3>
              <div className="gold-rule mt-4 w-16" aria-hidden="true" />
            </div>

            <a
              href={`mailto:${email}`}
              className="group flex items-center gap-4 rounded-lg border border-line bg-graphite p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-muted/60"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gold-muted/50 bg-gold/10 text-gold-light">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-sand">
                  Email
                </span>
                <span className="block truncate text-sm font-medium text-cream group-hover:text-gold-light">
                  {email}
                </span>
              </span>
            </a>

            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="group flex items-center gap-4 rounded-lg border border-line bg-graphite p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-muted/60"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gold-muted/50 bg-gold/10 text-gold-light">
                <Phone className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-sand">
                  Phone
                </span>
                <span className="block text-sm font-medium text-cream group-hover:text-gold-light">
                  {phone}
                </span>
              </span>
            </a>

            {location ? (
              <div className="flex items-center gap-4 rounded-lg border border-line bg-graphite p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gold-muted/50 bg-gold/10 text-gold-light">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-sand">
                    Location
                  </span>
                  <span className="block text-sm font-medium text-cream">{location}</span>
                </span>
              </div>
            ) : null}

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-sand">
                {contact.followHeading}
              </p>
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
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-graphite text-sand transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-muted/60 hover:text-gold-light"
                    >
                      {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Form */}
        <Reveal variant="slide-left" delay={0.12}>
          <div className="rounded-2xl border border-line bg-charcoal p-8">
            <ContactForm
              submitLabel={contact.formButtonLabel}
              text={{
                labelName: contact.labelName,
                labelEmail: contact.labelEmail,
                labelSubject: contact.labelSubject,
                labelMessage: contact.labelMessage,
                placeholderName: contact.placeholderName,
                placeholderEmail: contact.placeholderEmail,
                placeholderSubject: contact.placeholderSubject,
                placeholderMessage: contact.placeholderMessage,
                errorName: contact.errorName,
                errorEmail: contact.errorEmail,
                errorSubject: contact.errorSubject,
                errorMessage: contact.errorMessage,
                sendError: contact.sendError,
                networkError: contact.networkError,
              }}
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
