-- Komplettes Datenbank-Setup für das Punchcard-Dashboard
-- Kombinierte Kopie von 0001_init.sql + 0002_goal_progress_view.sql
-- Einfach vollständig in den Supabase SQL-Editor einfügen und ausführen.

-- =============================================================================
-- 0001_init.sql — Punch-Card Goal Dashboard: Kern-Schema
--
-- Tabellen: goals, goal_card_rewards, stamps
-- Punchcards werden NICHT gespeichert, sondern aus target_count / card_size /
-- Stempelanzahl berechnet (siehe 0002_goal_progress_view.sql).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- updated_at-Trigger-Funktion (kleine eigene Funktion statt moddatetime-
-- Extension, damit die Migration ohne Extension-Setup überall läuft)
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- goals — ein Ziel (z.B. "100x Sport"), Zeitraum flexibel
-- -----------------------------------------------------------------------------
create table public.goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 200),
  description   text,
  icon          text,
  color         text,
  target_count  integer not null check (target_count > 0),
  card_size     integer not null check (card_size > 0),
  period_type   text not null check (period_type in ('year', 'month', 'week', 'custom')),
  start_date    date not null,
  end_date      date,
  reward_text   text,          -- Default-Belohnung für alle Karten (nur Anzeige)
  is_archived   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Bei eigenem Zeitraum ist ein Enddatum Pflicht
  constraint goals_custom_period_requires_end_date
    check (period_type <> 'custom' or end_date is not null),
  constraint goals_end_after_start
    check (end_date is null or end_date >= start_date)
);

create index goals_user_id_idx on public.goals (user_id);

create trigger goals_set_updated_at
  before update on public.goals
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- goal_card_rewards — optionaler Belohnungs-Override pro Karte
-- (Fallback ist goals.reward_text)
-- -----------------------------------------------------------------------------
create table public.goal_card_rewards (
  id           uuid primary key default gen_random_uuid(),
  goal_id      uuid not null references public.goals (id) on delete cascade,
  card_index   integer not null check (card_index >= 0),
  reward_text  text not null,
  created_at   timestamptz not null default now(),
  constraint goal_card_rewards_goal_card_unique unique (goal_id, card_index)
);

create index goal_card_rewards_goal_id_idx on public.goal_card_rewards (goal_id);

-- -----------------------------------------------------------------------------
-- stamps — einzelne Stempel, append-only
-- user_id ist denormalisiert für schnelle RLS-Checks.
-- unique (goal_id, card_index, slot_index) verhindert Doppelstempel.
-- -----------------------------------------------------------------------------
create table public.stamps (
  id          uuid primary key default gen_random_uuid(),
  goal_id     uuid not null references public.goals (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  card_index  integer not null check (card_index >= 0),
  slot_index  integer not null check (slot_index >= 0),
  stamped_at  timestamptz not null default now(),
  constraint stamps_goal_card_slot_unique unique (goal_id, card_index, slot_index)
);

create index stamps_user_id_idx on public.stamps (user_id);
create index stamps_goal_id_idx on public.stamps (goal_id);

-- =============================================================================
-- Row Level Security — Owner-only, Policies pro Operation.
-- `(select auth.uid())` statt `auth.uid()` für Plan-Caching (Performance).
-- =============================================================================

alter table public.goals enable row level security;
alter table public.goal_card_rewards enable row level security;
alter table public.stamps enable row level security;

-- ---- goals ------------------------------------------------------------------
create policy "goals_select_own"
  on public.goals for select
  using ((select auth.uid()) = user_id);

create policy "goals_insert_own"
  on public.goals for insert
  with check ((select auth.uid()) = user_id);

create policy "goals_update_own"
  on public.goals for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "goals_delete_own"
  on public.goals for delete
  using ((select auth.uid()) = user_id);

-- ---- goal_card_rewards (Ownership via EXISTS auf Parent-Goal) ----------------
create policy "goal_card_rewards_select_own"
  on public.goal_card_rewards for select
  using (
    exists (
      select 1 from public.goals g
      where g.id = goal_id and g.user_id = (select auth.uid())
    )
  );

create policy "goal_card_rewards_insert_own"
  on public.goal_card_rewards for insert
  with check (
    exists (
      select 1 from public.goals g
      where g.id = goal_id and g.user_id = (select auth.uid())
    )
  );

create policy "goal_card_rewards_update_own"
  on public.goal_card_rewards for update
  using (
    exists (
      select 1 from public.goals g
      where g.id = goal_id and g.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.goals g
      where g.id = goal_id and g.user_id = (select auth.uid())
    )
  );

create policy "goal_card_rewards_delete_own"
  on public.goal_card_rewards for delete
  using (
    exists (
      select 1 from public.goals g
      where g.id = goal_id and g.user_id = (select auth.uid())
    )
  );

-- ---- stamps (append-only: nur SELECT + INSERT, keine UPDATE/DELETE-Policies) -
create policy "stamps_select_own"
  on public.stamps for select
  using ((select auth.uid()) = user_id);

create policy "stamps_insert_own"
  on public.stamps for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.goals g
      where g.id = goal_id and g.user_id = (select auth.uid())
    )
  );

-- =============================================================================
-- 0002_goal_progress_view.sql — berechneter Fortschritt pro Ziel
--
-- Punchcards werden nicht gespeichert: Kartenanzahl, aktive Karte und
-- Rest-Stempel sind reine Funktionen aus target_count, card_size und der
-- Anzahl vorhandener Stempel. Diese View spiegelt die TS-Funktionen in
-- src/lib/goals/punchcard-math.ts (Phase 2).
-- =============================================================================

create view public.goal_progress as
select
  g.id                                    as goal_id,
  g.user_id                               as user_id,
  g.target_count                          as target_count,
  g.card_size                             as card_size,
  -- Gesamtzahl der Karten: ceil(target / size); letzte Karte ggf. kleiner
  ceil(g.target_count::numeric / g.card_size)::integer as total_cards,
  count(s.id)::integer                    as total_stamps,
  -- Aktive Karte: nächste unvollständige Karte, gedeckelt auf die letzte Karte
  least(
    floor(count(s.id)::numeric / g.card_size),
    ceil(g.target_count::numeric / g.card_size) - 1
  )::integer                              as active_card_index,
  greatest(g.target_count - count(s.id), 0)::integer as remaining_count
from public.goals g
left join public.stamps s on s.goal_id = g.id
group by g.id;

-- security_invoker: Die View läuft mit den Rechten des aufrufenden Users,
-- damit die RLS-Policies von goals/stamps greifen (kein Datenleck über die View).
alter view public.goal_progress set (security_invoker = on);
