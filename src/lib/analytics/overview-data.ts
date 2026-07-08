/**
 * Reine Transformationen für die Dashboard-Übersicht: alle Ziele + alle
 * Stempel → Plotly-fertige Prozent-Serien, Karten-Abschlüsse, Gesamtzahlen
 * und Aktivitäts-Feed.
 *
 * Wie chart-data.ts bewusst ohne React-/Plotly-Imports gehalten, damit die
 * Funktionen ohne Browser testbar sind. Das Rendering übernehmen
 * src/components/overview/OverviewChart.tsx und ActivityFeed.tsx.
 */

import { format, isToday, isYesterday, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { slotsForCard, totalCards } from "@/lib/goals/punchcard-math";
import type { Goal, Stamp } from "@/lib/goals/types";

/** Auf so viele Tage wird der Aktivitäts-Feed maximal begrenzt. */
export const ACTIVITY_MAX_DAYS = 30;

/** Kumulative Fortschritts-Prozente eines Ziels über die Zeit. */
export interface GoalPercentSeries {
  goalId: string;
  /** ISO-Zeitstempel, aufsteigend sortiert. */
  x: string[];
  /** Kumulative Stempel / target_count * 100 (gleiche Länge wie `x`). */
  y: number[];
}

/** Ein voll gewordener Karten-Abschluss (Marker auf der Übersichts-Linie). */
export interface CardCompletion {
  goalId: string;
  /** 1-basierte Kartennummer ("Karte 2 voll"). */
  cardNumber: number;
  /** Zeitpunkt des Stempels, der die Karte voll gemacht hat (ISO). */
  completedAt: string;
  /** Fortschritts-Prozent an dieser Stelle (y-Wert auf der Linie). */
  percent: number;
}

/** Zusammenfassung pro Ziel (Fortschrittsliste der Übersicht). */
export interface GoalSummary {
  goalId: string;
  stampCount: number;
  completedCards: number;
  totalCards: number;
  /** Fortschritt in Prozent, auf 100 gedeckelt (Progress-Bar). */
  percent: number;
}

/** Gesamtzahlen über alle Ziele (Stat-Zeile). */
export interface OverviewTotals {
  totalStamps: number;
  totalCompletedCards: number;
  goalCount: number;
}

export type ActivityEntry =
  | { type: "stamps"; goalId: string; count: number }
  | { type: "cardCompleted"; goalId: string; cardNumber: number };

/** Alle Aktivitäten eines Kalendertags, neueste Tage zuerst. */
export interface DayActivity {
  /** Kalendertag als yyyy-MM-dd (lokale Zeit). */
  dateKey: string;
  /** "Heute", "Gestern" oder deutsches Datum. */
  label: string;
  entries: ActivityEntry[];
}

/** Alles, was das OverviewPanel zum Rendern braucht, in einem Aufruf. */
export interface OverviewData {
  series: GoalPercentSeries[];
  completions: CardCompletion[];
  summaries: GoalSummary[];
  totals: OverviewTotals;
  activity: DayActivity[];
}

/** Stempel-Zeitpunkte als valide Dates, aufsteigend sortiert. */
function toSortedDates(stamps: readonly Stamp[]): Date[] {
  return stamps
    .map((s) => parseISO(s.stamped_at))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
}

/** Stempel nach goal_id gruppieren (Reihenfolge bleibt erhalten). */
export function groupStampsByGoal(
  stamps: readonly Stamp[],
): Map<string, Stamp[]> {
  const byGoal = new Map<string, Stamp[]>();
  for (const stamp of stamps) {
    const list = byGoal.get(stamp.goal_id);
    if (list) list.push(stamp);
    else byGoal.set(stamp.goal_id, [stamp]);
  }
  return byGoal;
}

/**
 * Kumulative Prozent-Linie eines Ziels: x = stamped_at, y = laufende Summe /
 * target_count * 100. Prozent statt absoluter Zahlen, damit unterschiedlich
 * große Ziele auf einer gemeinsamen Achse vergleichbar sind.
 */
export function goalPercentSeries(
  goal: Pick<Goal, "id" | "target_count">,
  stamps: readonly Stamp[],
): GoalPercentSeries {
  const dates = toSortedDates(stamps);
  const target = goal.target_count > 0 ? goal.target_count : 1;
  return {
    goalId: goal.id,
    x: dates.map((d) => d.toISOString()),
    y: dates.map((_, i) => ((i + 1) / target) * 100),
  };
}

/**
 * Karten-Abschlüsse eines Ziels: Zeitpunkte, an denen die kumulierte
 * Stempelzahl eine Kartengrenze erreicht (Kartengrößen via punchcard-math —
 * die letzte Karte kann kleiner sein). Stempel werden sequenziell gesetzt,
 * daher ist "kumulierte Zahl erreicht Grenze" äquivalent zu "Karte voll".
 */
export function cardCompletionsForGoal(
  goal: Pick<Goal, "id" | "target_count" | "card_size">,
  stamps: readonly Stamp[],
): CardCompletion[] {
  const dates = toSortedDates(stamps);
  const cards = totalCards(goal.target_count, goal.card_size);
  const target = goal.target_count > 0 ? goal.target_count : 1;

  const completions: CardCompletion[] = [];
  let boundary = 0;
  for (let card = 0; card < cards; card++) {
    boundary += slotsForCard(card, goal.target_count, goal.card_size);
    if (dates.length < boundary) break;
    completions.push({
      goalId: goal.id,
      cardNumber: card + 1,
      completedAt: dates[boundary - 1].toISOString(),
      percent: (boundary / target) * 100,
    });
  }
  return completions;
}

/** Zusammenfassung eines Ziels (Stempel, volle Karten, Prozent). */
export function goalSummary(
  goal: Pick<Goal, "id" | "target_count" | "card_size">,
  stamps: readonly Stamp[],
): GoalSummary {
  const cards = totalCards(goal.target_count, goal.card_size);
  const target = goal.target_count > 0 ? goal.target_count : 1;
  return {
    goalId: goal.id,
    stampCount: stamps.length,
    completedCards: cardCompletionsForGoal(goal, stamps).length,
    totalCards: cards,
    percent: Math.min((stamps.length / target) * 100, 100),
  };
}

/** Kalendertag (lokale Zeit) als stabiler Gruppierungs-Schlüssel. */
function dayKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** "Heute", "Gestern", sonst deutsches Datum ("5. Juli 2026"). */
function dayLabel(date: Date): string {
  if (isToday(date)) return "Heute";
  if (isYesterday(date)) return "Gestern";
  return format(date, "d. MMMM yyyy", { locale: de });
}

/**
 * Aktivitäts-Feed: Stempel aller Ziele nach Kalendertag gruppiert (neueste
 * zuerst, auf `maxDays` Tage mit Aktivität begrenzt). Pro Tag zuerst die
 * Karten-Abschlüsse (Highlights), dann je Ziel die Stempelzahl des Tages
 * (Ziel-Reihenfolge = `goals`).
 */
export function buildDayActivity(
  goals: readonly Goal[],
  stampsByGoal: ReadonlyMap<string, Stamp[]>,
  completions: readonly CardCompletion[],
  maxDays: number = ACTIVITY_MAX_DAYS,
): DayActivity[] {
  // Pro Tag: Stempelzahl je Ziel + Karten-Abschlüsse.
  const days = new Map<
    string,
    { date: Date; counts: Map<string, number>; completed: CardCompletion[] }
  >();

  const dayFor = (date: Date) => {
    const key = dayKey(date);
    let entry = days.get(key);
    if (!entry) {
      entry = { date, counts: new Map(), completed: [] };
      days.set(key, entry);
    }
    return entry;
  };

  for (const goal of goals) {
    for (const date of toSortedDates(stampsByGoal.get(goal.id) ?? [])) {
      const entry = dayFor(date);
      entry.counts.set(goal.id, (entry.counts.get(goal.id) ?? 0) + 1);
    }
  }
  for (const completion of completions) {
    const date = parseISO(completion.completedAt);
    if (Number.isNaN(date.getTime())) continue;
    dayFor(date).completed.push(completion);
  }

  return [...days.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .slice(0, maxDays)
    .map(([key, entry]) => ({
      dateKey: key,
      label: dayLabel(entry.date),
      entries: [
        ...entry.completed.map<ActivityEntry>((c) => ({
          type: "cardCompleted",
          goalId: c.goalId,
          cardNumber: c.cardNumber,
        })),
        ...goals
          .filter((goal) => (entry.counts.get(goal.id) ?? 0) > 0)
          .map<ActivityEntry>((goal) => ({
            type: "stamps",
            goalId: goal.id,
            count: entry.counts.get(goal.id) ?? 0,
          })),
      ],
    }));
}

/** Alles für die Übersicht in einem Aufruf (Ziel-Reihenfolge = `goals`). */
export function buildOverviewData(
  goals: readonly Goal[],
  stamps: readonly Stamp[],
): OverviewData {
  const stampsByGoal = groupStampsByGoal(stamps);
  const empty: Stamp[] = [];

  const series = goals.map((goal) =>
    goalPercentSeries(goal, stampsByGoal.get(goal.id) ?? empty),
  );
  const completions = goals.flatMap((goal) =>
    cardCompletionsForGoal(goal, stampsByGoal.get(goal.id) ?? empty),
  );
  const summaries = goals.map((goal) =>
    goalSummary(goal, stampsByGoal.get(goal.id) ?? empty),
  );

  return {
    series,
    completions,
    summaries,
    totals: {
      totalStamps: summaries.reduce((sum, s) => sum + s.stampCount, 0),
      totalCompletedCards: completions.length,
      goalCount: goals.length,
    },
    activity: buildDayActivity(goals, stampsByGoal, completions),
  };
}
