/**
 * Zentrale Typen für den Goals-Bereich — re-exportiert die handgeschriebenen
 * DB-Typen aus src/types/supabase.ts und ergänzt UI-/Payload-Typen.
 */

import type { Database, PeriodType } from "@/types/supabase";

export type {
  Goal,
  GoalInsert,
  GoalUpdate,
  GoalCardReward,
  Stamp,
  StampInsert,
  GoalProgress,
  PeriodType,
} from "@/types/supabase";

export type GoalCardRewardInsert =
  Database["public"]["Tables"]["goal_card_rewards"]["Insert"];

/** Belohnungs-Override pro Karte, wie ihn das GoalForm liefert (ohne goal_id). */
export interface CardRewardInput {
  card_index: number;
  reward_text: string;
}

/** Eingabe für einen neuen Stempel (camelCase-Komfort für die UI). */
export interface NewStampInput {
  goalId: string;
  userId: string;
  cardIndex: number;
  slotIndex: number;
}

/** Deutsche Labels für die Zeitraum-Typen (Segmented Control, Anzeige). */
export const PERIOD_TYPE_LABELS: Record<PeriodType, string> = {
  year: "Jahr",
  month: "Monat",
  week: "Woche",
  custom: "Eigener Zeitraum",
};

export const PERIOD_TYPES: PeriodType[] = ["year", "month", "week", "custom"];
