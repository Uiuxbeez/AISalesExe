# AI Sales Executive

## Phase 2: Instagram OAuth + Webhook Receiving

Phase 2 adds a **real** Instagram connection and a **real** webhook receiver. No AI
reply yet — the goal of this phase is only to prove that a DM sent to your
connected Instagram account lands in the Inbox UI, backed by actual database rows
instead of mock data.

### What's real now

- **Instagram OAuth** (`/api/auth/instagram/connect` → `/api/auth/instagram/callback`),
  using the "Instagram API with Instagram Login" flow (no Facebook Page required).
  Exchanges the auth code for a short-lived token, upgrades it to a 60-day
  long-lived token, fetches the connected username, and stores it all against
  your user in `instagram_settings`.
- **Webhook receiver** (`/api/webhooks/instagram`):
  - `GET` handles Meta's one-time verification handshake.
  - `POST` verifies the `X-Hub-Signature-256` header against your app secret,
    logs the raw payload to `webhook_logs`, and — for each real inbound
    message — finds-or-creates a `Conversation` keyed by the sender's
    Instagram-scoped ID and appends a `Message`.
- **Inbox** now reads real `Conversation`/`Message` rows for the logged-in user
  instead of mock data. It's empty until your first real DM arrives.
- **Settings** page has a "Connect with Instagram" button that runs the OAuth
  flow above, plus a manual fallback form for local testing.

### What's still not built (by design)

- No AI-generated replies — messages just land, nothing responds.
- No outbound sending at all yet (Meta only allows sending after a customer
  has messaged you first — that's a Phase 3 concern).
- No customer profile enrichment (name/avatar) — inbound DMs show a
  placeholder label built from the sender's Instagram-scoped ID.
- Still single-tenant under the hood (one dummy login), though the schema
  (`businessAccountId` as the routing key) is already multi-tenant-shaped.

### One-time Meta App setup

1. Go to [developers.facebook.com](https://developers.facebook.com/apps) and
   create an app (or use your existing one), type "Business".
2. Add the **Instagram** product → **API setup with Instagram login**.
3. Under that product's settings, add a **Valid OAuth Redirect URI** matching
   `INSTAGRAM_REDIRECT_URI` below exactly (e.g.
   `https://ai-sales-exe.vercel.app/api/auth/instagram/callback` in production,
   or your ngrok/localhost URL while developing).
4. Grab the **Instagram App ID** and **App Secret** from the product's Basic
   Settings.
5. Under **Webhooks**, subscribe a callback URL of
   `https://<your-domain>/api/webhooks/instagram` with a verify token you
   choose (put the same value in `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`), then
   subscribe the **instagram** object's **messages** field.
   - Webhooks require a public HTTPS URL — use your Vercel deployment URL, or
     `ngrok http 3000` while developing locally.
6. Add an Instagram tester: under **Roles → Instagram testers**, add the
   Instagram professional account you'll connect, and accept the invite from
   the Instagram app's own settings.
7. The app starts in **development mode**, which is fine for testing with
   accounts you've explicitly added as testers/roles — you don't need App
   Review to complete this phase.

### Env vars (see `.env.example`)

```
NEXT_PUBLIC_APP_URL="https://ai-sales-exe.vercel.app"
INSTAGRAM_APP_ID="..."
INSTAGRAM_APP_SECRET="..."
INSTAGRAM_REDIRECT_URI="https://ai-sales-exe.vercel.app/api/auth/instagram/callback"
INSTAGRAM_WEBHOOK_VERIFY_TOKEN="pick-any-random-string"
```

### Applying the schema change

This phase adds `tokenExpiresAt` to `instagram_settings`, makes
`businessAccountId` unique (it's how an inbound webhook is routed to the right
user), and adds `instagramSenderId` to `conversations`. Apply it with:

```bash
npx prisma migrate deploy   # or `migrate dev` locally
npx prisma generate
```

### Testing it end-to-end

1. Deploy (or tunnel) so `/api/webhooks/instagram` is reachable over HTTPS.
2. Log in, go to **Settings**, click **Connect with Instagram**, and approve
   the permissions as your Instagram tester account.
3. From a *different* Instagram account, send a DM to the connected account.
4. Check the **Inbox** — a new conversation should appear with the message,
   with no AI reply sent back.
5. If nothing shows up, check `webhook_logs` in the database — every delivery
   Meta sends is logged there, which is the fastest way to tell whether Meta
   never called your endpoint (check the Webhooks product's delivery log in
   the App Dashboard) versus it arrived but wasn't parsed as expected.

---

# Phase 1: Application Foundation

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
      auth/instagram/      OAuth connect/callback/disconnect (Phase 2)
      webhooks/instagram/  Webhook verification + inbound DM ingestion (Phase 2)
  components/
    ui/                    Generic, reusable UI primitives (Button, Card, Input, …)
    layout/                Sidebar, topbar, nav config, logout button
  features/                Feature-based modules
    auth/                  types, services, components
    dashboard/             types, repositories, services, components
    inbox/                 types, repositories, services, components
    ai-brain/              types, repositories, services, components
    settings/               types, repositories, services, components
  lib/
    auth/                  JWT signing/verification, session cookie helpers
    db/                    Prisma client singleton
    instagram/             OAuth helpers, webhook signature verification, payload types (Phase 2)
    format-time.ts         Relative/clock time formatting for the Inbox
    utils.ts               `cn` class-merging helper
  middleware.ts            Route protection for the app shell
prisma/
  schema.prisma            Schema (Phase 1 foundation + Phase 2 OAuth/webhook fields)
  seed.ts                  Seeds the dummy account
```

Each feature follows the same layering so future phases can drop in real logic
without restructuring:

- **types** — shape of the data
- **repositories** — where data comes from (Prisma queries; Instagram settings
  and Inbox are wired to the real database as of Phase 2)
- **services** — business logic that sits between repositories and the UI
- **components** — feature-specific UI
- **hooks** — feature-specific React hooks (added as needed in later phases)

## What's still mocked

- **Dashboard** KPIs and activity feed — static mock data from `dashboard-repository.ts`.
- **AI Brain** settings — saved to an in-memory store via `/api/ai-brain`, not to
  OpenAI or the database.

## Intentionally left for Phase 3+

- Real AI replies (OpenAI or other providers)
- Outbound sending (replying to a customer from the Inbox UI)
- Multi-tenant support, CRM, workflow builder, team inbox, analytics, billing
- WhatsApp / Facebook Messenger channels

