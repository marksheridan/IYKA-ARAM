# IYKA-ARAM Wellness — Web Platform

Premium clinical-wellness platform for **IYKA-ARAM Wellness**, Meghalaya — Functional Medicine, Yoga & Naturopathy (drugless, integrative healthcare).

One Next.js app serving three modules:

1. **Landing page** — premium marketing site + lead capture
2. **Booking** — appointments (consults/sessions) & yoga class seats
3. **MIS** — back-office: appointments, yoga sessions, doctors, patients, **billing + finance**, **dashboard**

> Full functional spec & delivery plan: [`docs/IYKA-ARAM-Work-Plan.md`](docs/IYKA-ARAM-Work-Plan.md). This repo is at **Phase 0 (foundations)**.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (theme in `src/app/globals.css`) |
| Fonts | Fraunces (display) + Inter (body) via `next/font` |
| Database | PostgreSQL + Prisma 7 (driver adapter `@prisma/adapter-pg`) |
| Auth | Auth.js — wired in Phase 3 |
| Notifications | WhatsApp Business API — wired in the final phase |

## Getting started

```bash
npm install              # also runs `prisma generate` (postinstall)

cp .env.example .env     # then set DATABASE_URL to a managed Postgres
npm run db:migrate       # creates all tables from prisma/schema.prisma

npm run dev              # http://localhost:3000
```

Without a database you can still run `npm run dev` / `npm run build` — the
placeholder pages don't query the DB. A live `DATABASE_URL` is only needed for
`db:migrate` / `db:studio` and any data-backed feature.

### Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Create/apply a migration (`prisma migrate dev`) |
| `npm run db:push` | Push schema without a migration (prototyping) |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:generate` | Regenerate the Prisma client |

## Project structure

```
src/
  app/
    (site)/            # public website (Modules 1 & 2)
      page.tsx         #   landing page
      about/ services/ products/ contact/ booking/
    mis/               # back-office (Module 3) — sidebar shell + dashboard
    layout.tsx         # root layout: fonts + metadata
    globals.css        # Tailwind v4 + brand design tokens
  components/ui/        # design-system primitives (e.g. button.tsx)
  lib/
    db.ts              # Prisma client singleton (pg adapter)
    utils.ts           # cn() class merge helper
  generated/prisma/     # generated Prisma client (gitignored)
prisma/
  schema.prisma        # full data model (see §5.3 of the work plan)
docs/                   # work plan + original brief
```

## Database

Connection URL is configured in `prisma.config.ts` (CLI) and read at runtime by
the driver adapter in `src/lib/db.ts` — both via `DATABASE_URL`. Edit the data
model in `prisma/schema.prisma`, then run `npm run db:migrate`.
