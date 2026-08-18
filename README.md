# Feedwatch

Scans Bluesky for the keywords you choose, filters out the noise, and emails you a ranked
daily digest of people already complaining about the problem you solve.

**Live demo: [painscout.netlify.app](https://painscout.netlify.app/)**

Originally scoped from `docs/Reddit_Pain_Scout_Project_Spec (1).pdf` and
`docs/reddit_pain_scout_flow.png` — the data source has since moved from Reddit to Bluesky.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](https://painscout.netlify.app) — the marketing site, `/login`, and `/signup` all render with
zero configuration. To sign in and reach the dashboard, you need a Google OAuth client at
minimum (see [Environment variables](#environment-variables) below): Google is the only
sign-in method, so `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are required even before any
database is connected. Once signed in, every dashboard screen is fully clickable and
populated with a seeded demo dataset — no `DATABASE_URL`, Bluesky, Resend, or Freemius
credentials needed until you want the underlying pipeline to actually run.

If you edit `prisma/schema.prisma`, Next.js's Fast Refresh won't pick it up — run
`npx prisma generate` and restart `npm run dev` to apply the change.

## What's demo vs. what's real

This is a complete implementation of the product's full end-state, but everything past auth
ships in **demo mode** by default so it's clickable without a live database or third-party
service:

| Piece | Demo mode | Live mode |
|---|---|---|
| Auth | Google OAuth (JWT session, no DB round-trip) — the only sign-in method | Same, plus persisted users/accounts once `DATABASE_URL` is set |
| Projects / leads / analytics / billing data | Read from `lib/mock-data.ts` via `lib/data/*.ts` | Same call sites read from MongoDB via Prisma once `DATABASE_URL` is set |
| Bluesky scanning (`lib/bluesky.ts`) | Not called by the UI | Fully implemented against the Bluesky AT Protocol API |
| Pain-point filter (`lib/filter.ts`) | — | Real keyword + heuristic scoring, runs whenever the cron route runs |
| Digest email (`lib/email.ts`, `components/emails/digest-email.tsx`) | Not sent | Sends via Resend once `RESEND_API_KEY` is set |
| Billing (`lib/freemius.ts`, `/api/freemius/*`) | Upgrade button shows a toast explaining it's not configured | Real Freemius Checkout + webhook once Freemius keys are set |
| `/api/cron/digest` | Returns 500 (no `DATABASE_URL`) | Runs the full pipeline: fetch → dedupe → filter → rank → persist → email |

Nothing here is a stub pretending to be real — the pipeline code is production-shaped and
works the moment the relevant env vars are filled in. The UI simply doesn't call it until then.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how the scan → filter → rank → email
pipeline actually works internally, including the delivery-hour gating and dedupe logic.

## Environment variables

Copy `.env.example` to `.env` and fill in whichever sections you want to enable:

| Variable | Required for |
|---|---|
| `AUTH_SECRET`, `NEXTAUTH_URL` | Auth — always required outside of `.env.local`'s dev default |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED` | Signing in at all — this is the only auth provider |
| `DATABASE_URL` | Persisting real users/projects/leads (MongoDB via Prisma) |
| `BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD` | Live Bluesky search (app password from Settings → Privacy and Security → App Passwords) |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Sending digest emails |
| `FREEMIUS_PRODUCT_ID`, `FREEMIUS_PUBLIC_KEY`, `FREEMIUS_PRO_PLAN_ID`, `FREEMIUS_SECRET_KEY` | Pro plan checkout + webhook verification |
| `CRON_SECRET` | Authorizing calls to `/api/cron/digest` |

## Going live

1. **Database**: create a MongoDB Atlas cluster, set `DATABASE_URL`, then run `npx prisma db push`.
2. **Google OAuth**: create an OAuth client in Google Cloud Console, set `GOOGLE_CLIENT_ID`/`SECRET`, and set `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true`.
3. **Bluesky**: generate an app password, set `BLUESKY_HANDLE` / `BLUESKY_APP_PASSWORD`.
4. **Email**: create a Resend account, set `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL`.
5. **Billing**: create a Freemius product/plan, set `FREEMIUS_PRODUCT_ID`, `FREEMIUS_PUBLIC_KEY`, `FREEMIUS_PRO_PLAN_ID`, and `FREEMIUS_SECRET_KEY`, then point a webhook at `/api/freemius/webhook`.
6. **Scheduling**: deploy (this project runs on [Netlify](https://painscout.netlify.app/); any Next.js host works), set `CRON_SECRET`, then point a scheduler (e.g. cron-job.org) at `POST https://<your-deployment>/api/cron/digest` with header `Authorization: Bearer <CRON_SECRET>`, firing at least once an hour.

Once `DATABASE_URL` is set, every `lib/data/*.ts` function switches from its mock branch to
the equivalent `getPrisma()` call automatically — call sites elsewhere never need to change.

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · shadcn/ui + Base UI
· Auth.js (NextAuth v5) · MongoDB + Prisma · Bluesky AT Protocol · Resend + React Email
· Freemius · Recharts · GSAP

## Project structure

```
app/                      routes (App Router)
  (auth)/                 /login, /signup — shared AuthCard, Google sign-in
  (dashboard)/             dashboard, analytics, billing, account, saved, project settings
  onboarding/              first-project setup wizard
  api/                     cron/digest, freemius/*, auth/*, projects/*, leads/*, account
lib/                       bluesky.ts, filter.ts, digest.ts, email.ts, freemius.ts, auth.ts, entitlements.ts, prisma.ts
lib/data/                  data-access layer (mock today, Prisma-ready per function)
lib/mock-data.ts           seeded demo dataset
components/                ui/ (shadcn), landing/, dashboard/, onboarding/, billing/, account/, motion/ (GSAP), emails/
prisma/schema.prisma       full data model (MongoDB)
docs/                      original project spec PDF + flow diagram
```
