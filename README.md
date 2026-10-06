# Ashar's Portfolio

A personal portfolio website for **Muhammad Ashar Asif** — YouTube Automation
Specialist, AI Automation & Content Creator, and Digital Marketing professional.
It pairs a public portfolio/blog with a private admin panel (content CMS, media
library, contact messages, AI-chatbot settings) backed by Supabase.

## Stack

| Layer          | Choice                                  |
| -------------- | --------------------------------------- |
| Framework      | Next.js 16 (App Router)                 |
| UI             | React 19, TypeScript, Tailwind CSS v4    |
| Animation      | framer-motion                           |
| Icons          | lucide-react                            |
| Backend/BaaS   | Supabase (Postgres, Auth, Storage)      |
| Email          | **UNDECIDED** — Resend or SendGrid (via abstraction) |
| AI chatbot     | **UNDECIDED** — UI + settings exist, no provider wired |
| Hosting        | Vercel (planned)                        |

Runtime notes: Next.js 16 is in use. Route handlers export `async GET/POST`,
`next/headers` `cookies()` is async and must be awaited, and `middleware.ts`
is deprecated (not used here).

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in the values (never commit it)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The public site works
without Supabase — it falls back to seeded content from `src/lib/content.ts`.
The admin panel (`/admin`) requires Supabase to be configured.

## Environment Variables

| Variable                   | Used for                                          | Required for |
| -------------------------- | ------------------------------------------------- | ------------ |
| `NEXT_PUBLIC_SITE_URL`     | Canonical base URL (OG tags, sitemap, robots)     | SEO (deploy) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL                              | Admin, blog CMS, contact storage, media |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key                     | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY`| Server-only privileged writes (contact messages, audit logs) | Contact-form persistence; **never** use a `NEXT_PUBLIC_` prefix |
| `EMAIL_PROVIDER`           | `resend` or `sendgrid`                            | Contact-form email notifications |
| `RESEND_API_KEY`           | Resend API key                                    | If `EMAIL_PROVIDER=resend` |
| `SENDGRID_API_KEY`         | SendGrid API key                                  | If `EMAIL_PROVIDER=sendgrid` |
| `CONTACT_TO_EMAIL`         | Where contact-form notifications are sent (defaults to `contact.asharasif@gmail.com`) | Contact-form notifications |
| `CONTACT_FROM_EMAIL`       | Verified sender address for outgoing mail (e.g. `noreply@yourdomain.com`) | Contact-form email delivery — **must** be a verified domain/sender with the provider |
| `AI_PROVIDER`              | AI provider name (undecided)                      | Chatbot (not wired yet) |
| `AI_API_KEY`               | AI provider key (undecided)                       | Chatbot (not wired yet) |

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the files in `supabase/migrations/*.sql` **in
   alphabetical order**. These create all tables (blog posts, media, contact
   messages, admin users, audit logs, site settings, AI settings).
3. Create a **Storage bucket named `media`** and make it **public** (used by
   the media library).
4. Copy from the project dashboard: **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`,
   **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   **service-role key** → `SUPABASE_SERVICE_ROLE_KEY` (server-only).

## Admin Bootstrap

1. In the Supabase dashboard, go to **Authentication → Users** and create a
   user (email + password) for yourself.
2. In the SQL editor, grant that user admin access — set `<AUTH_USER_ID>` to
   the user's UUID from the Auth dashboard:

   ```sql
   insert into admin_users (id, role)
   values ('<AUTH_USER_ID>', 'super_admin')
   on conflict (id) do update set role = 'super_admin';
   ```

3. Visit `/admin/login` and sign in.

## Contact Form Email

The provider is **UNDECIDED** — the site owner must choose one:

- **Resend** (`EMAIL_PROVIDER=resend`): set `RESEND_API_KEY` and
  `CONTACT_FROM_EMAIL` (a verified domain in Resend).
- **SendGrid** (`EMAIL_PROVIDER=sendgrid`): set `SENDGRID_API_KEY` and
  `CONTACT_FROM_EMAIL` (a verified sender identity in SendGrid).

The email layer lives in `src/lib/email.ts` and never hardcodes credentials.
Until a provider is configured, `POST /api/contact` still validates the form
and stores the message (if the database is available), but the response
reports `delivered: false` — it never reports false success.

## AI Chatbot

The provider is **UNDECIDED** — UI and settings exist (`ai_settings` table,
`/api/ai/status`, `/api/ai/chat`), but no AI provider is wired. Until one is
approved and implemented:

- `GET /api/ai/status` → `{ enabled, configured: false, welcomeMessage }`
  (`configured` is always `false`; `enabled` comes from the `ai_settings`
  chatbot row, defaulting to disabled).
- `POST /api/ai/chat` → `{ reply, configured: false }`; returns 403
  `{"reply": "AI assistant is disabled.", "configured": false}` when disabled,
  otherwise only the configured `fallback_message` — never generated content.
- The bot must **never** fabricate achievements, clients, projects, or other
  claims; it only serves the configured fallback until a real provider is
  approved.

## API Routes

| Method | Path             | Purpose                                              |
| ------ | ---------------- | ---------------------------------------------------- |
| POST   | `/api/contact`   | Validate, rate-limit (10 req / 10 min per IP), store, and email contact-form submissions. Always returns `{ ok, delivered, message }`. |
| GET    | `/api/ai/status` | Chatbot availability/status.                        |
| POST   | `/api/ai/chat`   | Placeholder chat endpoint (fallback replies only).   |

## SEO

- `src/app/sitemap.ts` — generates `/sitemap.xml`: static routes `/` and
  `/blog`, plus `/blog/[slug]` for published posts pulled from Supabase
  (best-effort; static-only fallback). Base URL from `NEXT_PUBLIC_SITE_URL`.
- `src/app/robots.ts` — generates `/robots.txt`: allows `/`, disallows
  `/admin/`, points at the sitemap.

## Deployment (Vercel)

1. Push the repo to GitHub.
2. In Vercel: **Add New → Project** and import the repo.
3. In the project's **Settings → Environment Variables**, add every variable
   from `.env.local` (at minimum `NEXT_PUBLIC_SITE_URL` with the production
   domain, Supabase keys, and email keys when configured).
4. Deploy. Custom domain: add it under **Settings → Domains** and follow the
   DNS instructions there.

## Content Integrity Rules

From the approved PRD (see `src/lib/content.ts`): **never invent content.**

- No invented personal information, clients, experience, projects, results,
  awards, certifications, or testimonials.
- Use verified metrics only — the approved facts live in `src/lib/content.ts`
  and the database's published rows.
- `projects` and `testimonials` are intentionally empty until real,
  verified items exist; the UI shows honest "coming soon" copy instead of
  placeholders.
- The chatbot may only return configured fallback text — never generate
  achievements or claims.

## Pending Decisions

- [ ] **Email provider**: choose Resend or SendGrid; set `EMAIL_PROVIDER`,
      the API key, and a verified `CONTACT_FROM_EMAIL`.
- [ ] **AI chatbot provider**: choose and approve a provider, then wire it
      into `/api/ai/chat` (currently `configured: false`).
- [ ] **Supabase project**: create the project, run migrations, create the
      public `media` bucket, and supply URL/keys.
- [ ] **GitHub/Vercel access**: connect repo and deploy; confirm the
      production domain for `NEXT_PUBLIC_SITE_URL`.
