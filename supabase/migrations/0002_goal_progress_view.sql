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
