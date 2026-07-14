# Stempelkarte — Punch-Card Goal Tracker

Track your personal goals the way loyalty cards work: set a target, break it into
punch cards, and stamp a field every time you make progress. Fill a card, unlock
your reward. 🎯

**▶️ Live app: [stamp-card-eight.vercel.app](https://stamp-card-eight.vercel.app)**

> The interface is in German ("Stempelkarte" = stamp card). Sign up with an email
> and password to create your own goals — your data is private to your account.

---

## What it does

- **Goals as punch cards.** Define a goal (e.g. "Exercise 100× this year"), pick a
  card size (e.g. 10 fields per card → 10 cards), an icon, and a color.
- **Stamp to progress.** Tap the next open field to set a stamp, complete with a
  tactile 3D stamp-down animation. Each stamp lands in your goal's color.
- **Rewards per card.** Give every card the same reward, or a different one per
  card (e.g. card 1 → "movie night", card 2 → "new book").
- **Per-goal statistics.** Swipe a goal card sideways to see an interactive chart
  (cumulative progress vs. target, card boundaries, activity frequency) plus a
  breakdown of every card and its reward.
- **Cross-goal overview.** A dashboard tab shows all goals at once as comparable
  progress lines, with markers for completed cards and a day-by-day activity feed.
- **Make it yours.** A settings page lets you choose an accent color and switch
  between light / dark / system themes (stored per device).
- **Installable.** It's a PWA — add it to your home screen on iOS or Android for a
  full-screen, app-like experience.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Backend | [Supabase](https://supabase.com) — Postgres, Auth, Row Level Security |
| Charts | Plotly (`plotly.js-basic-dist-min`, lazy-loaded) |
| Animation | [`motion`](https://motion.dev) (CSS 3D transforms + gestures) |
| Forms | React Hook Form + Zod |
| Icons | Phosphor Icons |
| Hosting | Vercel (web) · designed for [Capacitor](https://capacitorjs.com) app packaging |

The app is fully **client-rendered** (no server actions / route handlers) and can be
exported as a static bundle, so the exact same codebase can later be wrapped as a
native iOS/Android app.

## Getting started

**Prerequisites:** Node.js 20+ and a free [Supabase](https://supabase.com) project.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# then fill in your Supabase project URL and anon key:
#   NEXT_PUBLIC_SUPABASE_URL=...
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 3. Set up the database
#    Open the Supabase SQL editor and run the contents of supabase/setup.sql
#    (creates the goals / stamps / rewards tables, the progress view, and RLS).

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign up.

## Scripts

```bash
npm run dev                            # start the dev server
npm run build                          # production build (web)
NEXT_OUTPUT_MODE=export npm run build  # static export (for Capacitor packaging)
npx tsc --noEmit                       # type-check
```

## Project structure

```
src/
  app/            # routes: auth pages, dashboard, goal detail/edit, settings
  components/     # auth, dashboard, punchcard, analytics, overview, goals, ui
  hooks/          # useAuth, useGoals, useGoalStamps
  lib/
    supabase/     # browser client, auth-error translations
    goals/        # punch-card math, typed queries, types
    analytics/    # Plotly data + theme helpers
    theme/        # accent colors + light/dark theme provider
supabase/
  migrations/     # SQL schema + progress view
  setup.sql       # combined migrations for the SQL editor
```

## How progress is modeled

Only raw facts are stored: `goals` and an **append-only** `stamps` table. Card
boundaries, the active card, and remaining counts are always *computed* from
`target_count`, `card_size`, and the number of stamps — both in SQL (a
`goal_progress` view) and in TypeScript (`src/lib/goals/punchcard-math.ts`), which
are kept in sync. Every table is protected by Supabase Row Level Security, so each
user can only read and write their own data.

## Roadmap

- [x] Auth, goals, punch cards, stamp animation
- [x] Per-goal analytics + cross-goal overview
- [x] Custom rewards per card
- [x] Accent color + light/dark theme settings
- [x] PWA (installable to home screen)
- [ ] Native iOS/Android packaging via Capacitor
- [ ] Archive goals, undo last stamp

---

Built as a personal project with [Claude Code](https://claude.com/claude-code).
