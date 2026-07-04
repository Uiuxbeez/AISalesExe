# AI Sales Executive — Phase 1: Application Foundation

This is the foundation phase of AI Sales Executive, a multi-tenant SaaS that will
eventually let businesses connect Instagram and have an AI reply to customer DMs.

This phase intentionally ships **only the application shell**: dummy login, the
dashboard/inbox/AI Brain/settings screens (mocked data), and the database schema.
No Instagram, no OpenAI, no webhooks.

## Tech stack

- Next.js 15 (App Router) + React 18 + TypeScript
- Tailwind CSS + hand-rolled shadcn/ui-style primitives
- PostgreSQL + Prisma
- Dummy JWT-cookie authentication (via `jose`)

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure your database**

   Copy the example env file and point `DATABASE_URL` at a running PostgreSQL instance:

   ```bash
   cp .env.example .env
   ```

3. **Run the migration**

   ```bash
   npx prisma migrate dev
   ```

   This creates the `users`, `instagram_settings`, `ai_settings`, `conversations`,
   `messages`, and `webhook_logs` tables, and seeds the single dummy account
   (`admin@example.com` / `password123`).

4. **Start the dev server**

   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000`, sign in with the demo credentials shown on the
   login screen, and explore the dashboard.

## Login

There is exactly one account, checked against a fixed pair of credentials
(no registration, no password reset, no social login):

```
Email:    admin@example.com
Password: password123
```

A session is issued as an httpOnly JWT cookie on successful login and cleared on logout.

## Project structure

```
src/
  app/                     Routes (App Router)
    login/                 Public login page
    (app)/                 Protected app shell (sidebar + topbar)
      dashboard/
      inbox/
      ai-brain/
      settings/
    api/                   Route handlers (auth, dashboard, inbox, ai-brain, settings)
  components/
    ui/                    Generic, reusable UI primitives (Button, Card, Input, …)
    layout/                Sidebar, topbar, nav config, logout button
  features/                Feature-based modules
    auth/                  types, services, components
    dashboard/             types, repositories, services, components
    inbox/                 types, services, components
    ai-brain/              types, repositories, services, components
    settings/               types, repositories, services, components
  lib/
    auth/                  JWT signing/verification, session cookie helpers
    db/                    Prisma client singleton
    utils.ts               `cn` class-merging helper
  middleware.ts            Route protection for the app shell
prisma/
  schema.prisma            Foundation schema
  seed.ts                  Seeds the dummy account
```

Each feature follows the same layering so future phases can drop in real logic
without restructuring:

- **types** — shape of the data
- **repositories** — where data comes from (currently mocked / in-memory; will
  become Prisma queries)
- **services** — business logic that sits between repositories and the UI
- **components** — feature-specific UI
- **hooks** — feature-specific React hooks (added as needed in later phases)

## What's mocked in this phase

- **Dashboard** KPIs and activity feed — static mock data from `dashboard-repository.ts`.
- **Inbox** conversations and messages — static mock data from `inbox-service.ts`; sending
  is disabled in the UI.
- **AI Brain** settings — saved to an in-memory store via `/api/ai-brain`, not to
  OpenAI or the database.
- **Settings** (Instagram) — saved to an in-memory store via `/api/settings`;
  "Verify connection" only checks that fields are filled in, it never calls Meta.

## Intentionally left for Phase 2+

- Instagram OAuth and the Meta Graph API
- Real AI replies (OpenAI or other providers)
- Webhook ingestion for incoming DMs
- Wiring `AISettings` / `InstagramSettings` / `Conversation` / `Message` /
  `WebhookLog` repositories to real Prisma queries
- Multi-tenant support, CRM, workflow builder, team inbox, analytics, billing
- WhatsApp / Facebook Messenger channels
