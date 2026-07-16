/**
 * Reine Transformationen: Stempel + Ziel → Plotly-fertige Datenreihen.
 *
 * Bewusst ohne React-/Plotly-Imports gehalten, damit die Funktionen ohne
 * Browser (z.B. per tsx-Skript) testbar sind. Das Rendering übernimmt
 * src/components/analytics/StampHistoryChart.tsx.
 */

import {
  differenceInCalendarDays,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { slotsForCard, totalCards } from "@/lib/goals/punchcard-math";
import type { Goal, Stamp } from "@/lib/goals/types";
import type { Lang } from "@/lib/i18n/constants";
import { dateLocale } from "@/lib/i18n/date-locale";

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

/** Bis zu dieser Datenspanne (Tage, ~3 Monate) wird wöchentlich gebuckelt. */
const WEEKLY_MAX_SPAN_DAYS = 92;

/** Anteil der Bucket-Breite, den ein Balken einnimmt (Rest = Lücke). */
const BAR_WIDTH_RATIO = 0.7;

export interface CumulativeSeries {
  /** ISO-Zeitstempel, aufsteigend sortiert. */
  x: string[];
  /** Laufende Stempel-Summe 1..n (gleiche Länge wie `x`). */
  y: number[];
}

export interface FrequencySeries {
  unit: "week" | "month";
  /** Bucket-Mitte als ISO-String (für die Plotly-Datumsachse). */
  x: string[];
  /** Stempel pro Bucket (lückenlos, leere Buckets = 0). */
  y: number[];
  /** Balkenbreite in Millisekunden, pro Bucket (Monate sind unterschiedlich lang). */
  widths: number[];
  /**
   * Lokalisierte Hover-Labels: Woche = "KW 27 · ab 29. Juni" / "Week 27 · from
   * Jun 29", Monat = "Juli 2026" / "July 2026" (Sprache über `lang`).
   */
  labels: string[];
}

export interface StampChartData {
  cumulative: CumulativeSeries;
  /** y-Wert der Ziellinie (= target_count). */
  target: number;
  /**
   * y-Werte der Kartengrenzen (kumulierte Stempel, bei denen eine Karte voll
   * wird) — ohne die letzte Grenze, die mit der Ziellinie zusammenfällt.
   */
  cardBoundaries: number[];
  frequency: FrequencySeries;
}

/** Stempel-Zeitpunkte als valide Dates, aufsteigend sortiert. */
function toSortedDates(stamps: readonly Stamp[]): Date[] {
  return stamps
    .map((s) => parseISO(s.stamped_at))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
}

/** Kumulative Fortschrittslinie: x = stamped_at, y = laufende Summe. */
export function cumulativeSeries(stamps: readonly Stamp[]): CumulativeSeries {
  const dates = toSortedDates(stamps);
  return {
    x: dates.map((d) => d.toISOString()),
    y: dates.map((_, i) => i + 1),
  };
}

/**
 * Kumulierte Stempelzahlen, bei denen jeweils eine Karte voll wird
 * (100/10 → [10, 20, …, 90]; 100/7 → [7, 14, …, 98]). Die letzte Grenze
 * (= target) wird weggelassen — dort liegt bereits die Ziellinie.
 */
export function cardBoundaryValues(target: number, size: number): number[] {
  const cards = totalCards(target, size);
  const boundaries: number[] = [];
  let cumulative = 0;
  for (let card = 0; card < cards - 1; card++) {
    cumulative += slotsForCard(card, target, size);
    boundaries.push(cumulative);
  }
  return boundaries;
}

/**
 * Stempel-Frequenz als lückenlose Zeit-Buckets: wöchentlich (Montag-Start),
 * solange die Datenspanne ≤ ~3 Monate ist, sonst monatlich.
 */
export function frequencySeries(
  stamps: readonly Stamp[],
  lang: Lang = "de",
): FrequencySeries {
  const locale = dateLocale(lang);
  const weekPrefix = lang === "de" ? "KW" : "Week";
  const from = lang === "de" ? "ab" : "from";
  const dates = toSortedDates(stamps);
  if (dates.length === 0) {
    return { unit: "week", x: [], y: [], widths: [], labels: [] };
  }

  const first = dates[0];
  const last = dates[dates.length - 1];
  const weekly = differenceInCalendarDays(last, first) <= WEEKLY_MAX_SPAN_DAYS;

  if (weekly) {
    const starts = eachWeekOfInterval(
      { start: first, end: last },
      { weekStartsOn: 1 },
    );
    const counts = new Map<number, number>(starts.map((s) => [s.getTime(), 0]));
    for (const d of dates) {
      const key = startOfWeek(d, { weekStartsOn: 1 }).getTime();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return {
      unit: "week",
      x: starts.map((s) => new Date(s.getTime() + WEEK_MS / 2).toISOString()),
      y: starts.map((s) => counts.get(s.getTime()) ?? 0),
      widths: starts.map(() => WEEK_MS * BAR_WIDTH_RATIO),
      labels: starts.map(
        (s) =>
          `${weekPrefix} ${format(s, "I")} · ${from} ${format(s, "d. MMM", {
            locale,
          })}`,
      ),
    };
  }

  const starts = eachMonthOfInterval({ start: first, end: last });
  const counts = new Map<number, number>(starts.map((s) => [s.getTime(), 0]));
  for (const d of dates) {
    const key = startOfMonth(d).getTime();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return {
    unit: "month",
    x: starts.map((s) => {
      const spanMs = endOfMonth(s).getTime() - s.getTime();
      return new Date(s.getTime() + spanMs / 2).toISOString();
    }),
    y: starts.map((s) => counts.get(s.getTime()) ?? 0),
    widths: starts.map(
      (s) => (endOfMonth(s).getTime() - s.getTime()) * BAR_WIDTH_RATIO,
    ),
    labels: starts.map((s) => format(s, "LLLL yyyy", { locale })),
  };
}

/** Alles, was StampHistoryChart zum Rendern braucht, in einem Aufruf. */
export function buildStampChartData(
  goal: Pick<Goal, "target_count" | "card_size">,
  stamps: readonly Stamp[],
  lang: Lang = "de",
): StampChartData {
  return {
    cumulative: cumulativeSeries(stamps),
    target: goal.target_count,
    cardBoundaries: cardBoundaryValues(goal.target_count, goal.card_size),
    frequency: frequencySeries(stamps, lang),
  };
}
