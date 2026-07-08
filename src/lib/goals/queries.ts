/**
 * Typisierter Datenzugriff für Ziele, Stempel und Karten-Belohnungen.
 *
 * Läuft komplett über den Supabase-Browser-Client (Capacitor-kompatibel:
 * keine Server Actions, keine Route Handlers). Supabase-Fehler werden als
 * Exceptions weitergereicht (PostgrestError erbt von Error).
 */

import { getSupabaseClient } from "@/lib/supabase/client";
import type {
  CardRewardInput,
  Goal,
  GoalCardReward,
  GoalInsert,
  GoalProgress,
  GoalUpdate,
  NewStampInput,
  Stamp,
} from "./types";

/** Alle (nicht archivierten) Ziele eines Users, älteste zuerst. */
export async function getGoals(userId: string): Promise<Goal[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Einzelnes Ziel; `null`, wenn nicht vorhanden (oder RLS es verbirgt). */
export async function getGoal(id: string): Promise<Goal | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Ziel anlegen, optional mit Belohnungs-Overrides pro Karte
 * (goal_card_rewards). Gibt das angelegte Ziel zurück.
 */
export async function createGoal(
  payload: GoalInsert,
  cardRewards: CardRewardInput[] = [],
): Promise<Goal> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("goals")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;

  if (cardRewards.length > 0) {
    const { error: rewardsError } = await supabase
      .from("goal_card_rewards")
      .insert(cardRewards.map((r) => ({ ...r, goal_id: data.id })));
    if (rewardsError) throw rewardsError;
  }

  return data;
}

/**
 * Ziel aktualisieren. Wenn `cardRewards` übergeben wird (auch leeres Array),
 * werden die Karten-Belohnungen komplett ersetzt (delete + insert).
 */
export async function updateGoal(
  id: string,
  patch: GoalUpdate,
  cardRewards?: CardRewardInput[],
): Promise<Goal> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("goals")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  if (cardRewards) {
    const { error: deleteError } = await supabase
      .from("goal_card_rewards")
      .delete()
      .eq("goal_id", id);
    if (deleteError) throw deleteError;

    if (cardRewards.length > 0) {
      const { error: insertError } = await supabase
        .from("goal_card_rewards")
        .insert(cardRewards.map((r) => ({ ...r, goal_id: id })));
      if (insertError) throw insertError;
    }
  }

  return data;
}

/** Ziel löschen (Stempel + Belohnungen fallen per ON DELETE CASCADE mit). */
export async function deleteGoal(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;
}

/** Alle Stempel eines Ziels, chronologisch. */
export async function getStampsForGoal(goalId: string): Promise<Stamp[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("stamps")
    .select("*")
    .eq("goal_id", goalId)
    .order("stamped_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/**
 * Alle Stempel des Users über ALLE Ziele hinweg, chronologisch — Grundlage
 * der Dashboard-Übersicht (RLS begrenzt ohnehin auf den eigenen User).
 */
export async function getAllStampsForUser(userId: string): Promise<Stamp[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("stamps")
    .select("*")
    .eq("user_id", userId)
    .order("stamped_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/**
 * Einen Stempel setzen. Der Unique-Constraint (goal_id, card_index,
 * slot_index) verhindert Doppelstempel — bei einem Race wirft Supabase einen
 * Fehler, den der Aufrufer (optimistisches Update) zum Revert nutzt.
 */
export async function insertStamp(input: NewStampInput): Promise<Stamp> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("stamps")
    .insert({
      goal_id: input.goalId,
      user_id: input.userId,
      card_index: input.cardIndex,
      slot_index: input.slotIndex,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Belohnungs-Overrides pro Karte, nach Karten-Index sortiert. */
export async function getCardRewards(goalId: string): Promise<GoalCardReward[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("goal_card_rewards")
    .select("*")
    .eq("goal_id", goalId)
    .order("card_index", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/**
 * Berechneter Fortschritt aus der SQL-View `goal_progress`
 * (gespiegelt in src/lib/goals/punchcard-math.ts).
 */
export async function getGoalProgress(
  goalId: string,
): Promise<GoalProgress | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("goal_progress")
    .select("*")
    .eq("goal_id", goalId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
