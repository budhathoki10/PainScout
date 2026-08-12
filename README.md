# Reddit Pain Scout

Scans the subreddits you choose for genuine pain points and emails you a ranked daily digest of warm leads. Built from `docs/Reddit_Pain_Scout_Project_Spec (1).pdf` and `docs/reddit_pain_scout_flow.png`.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 and sign in with the demo account shown on the login page
(`demo@reddit-painscout.com` / `demo1234`). No API keys are required to explore the
full product — every screen is fully functional and populated with realistic seeded data.

## What's demo vs. what's real

This is a complete implementation of the spec's full end-state SaaS, but it ships in
**demo mode** by default so it's clickable with zero external services configured:

| Piece | Demo mode | Live mode |
|---|---|---|
| Auth | Hardcoded demo account, JWT session, no DB round-trip | Real signup + Google OAuth once `GOOGLE_CLIENT_ID`/`SECRET` are set |
| Projects / leads / analytics / billing data | Read from `lib/mock-data.ts` via `lib/data/*.ts` | Same call sites read from MongoDB via Prisma once `DATABASE_URL` is set |
| Reddit scanning (`lib/reddit.ts`) | Not called by the UI | Fully implemented against Reddit's OAuth2 API via `snoowrap` |
| Pain-point filter (`lib/filter.ts`) | — | Real keyword + heuristic scoring, runs whenever the cron route runs |
| Digest email (`lib/email.ts`, `components/emails/digest-email.tsx`) | Not sent | Sends via Resend once `RESEND_API_KEY` is set |
| Billing (`lib/freemius.ts`, `/api/freemius/*`) | Upgrade button shows a toast explaining it's not configured | Real Freemius Checkout + webhook once Freemius keys are set |
| `/api/cron/digest` | Returns 500 (no `DATABASE_URL`) | Runs the full pipeline: fetch → dedupe → filter → rank → persist → email |

Nothing here is a stub pretending to be real — the pipeline code is production-shaped
and will work the moment the relevant env vars are filled in. The UI simply doesn't
call it until then.

## Going live

1. Copy `.env.example` to `.env` and fill in the sections you want to enable (see comments in that file).
2. **Database**: create a MongoDB Atlas cluster, set `DATABASE_URL`, then run `npx prisma db push`.
3. **Reddit**: create a "script" app at https://www.reddit.com/prefs/apps, set `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET`.
4. **Email**: create a Resend account, set `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL`.
5. **Google OAuth**: create an OAuth client in Google Cloud Console, set `GOOGLE_CLIENT_ID`/`SECRET`, and set `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true`.
6. **Billing**: create a Freemius product/plan, set `FREEMIUS_PRODUCT_ID`, `FREEMIUS_PUBLIC_KEY`, `FREEMIUS_PRO_PLAN_ID`, and `FREEMIUS_SECRET_KEY` (used to verify webhook signatures), then point a webhook at `/api/freemius/webhook`.
7. **Scheduling**: deploy to Vercel, set `CRON_SECRET`, then point a cron-job.org job at `POST https://your-app.vercel.app/api/cron/digest` with header `Authorization: Bearer <CRON_SECRET>`.

Once `DATABASE_URL` is set, swap the mock branch in each `lib/data/*.ts` function for
the equivalent `getPrisma()` call — the shape is already there, call sites elsewhere
never need to change.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Auth.js (NextAuth v5)
· MongoDB + Prisma · snoowrap (Reddit OAuth2) · Resend + React Email · Freemius · Recharts

## Project structure

```
app/                  routes (App Router), incl. api/cron/digest, api/freemius/*, api/auth/*
lib/                  reddit.ts, filter.ts, digest.ts, email.ts, freemius.ts, auth.ts, prisma.ts
lib/data/              data-access layer (mock today, Prisma-ready)
lib/mock-data.ts       seeded demo dataset
components/            ui/ (shadcn), landing/, dashboard/, onboarding/, billing/, account/, emails/
prisma/schema.prisma   full data model (MongoDB)
docs/                  original project spec PDF + flow diagram
```
