"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getStampsForGoal, insertStamp } from "@/lib/goals/queries";
import type { Stamp } from "@/lib/goals/types";

export interface UseGoalStampsResult {
  stamps: Stamp[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  /**
   * Stempel setzen — optimistisches Update, bei Fehler (z.B. Race auf den
   * Unique-Constraint) sauberer Revert. Gibt `true` bei Erfolg zurück.
   */
  addStamp: (cardIndex: number, slotIndex: number) => Promise<boolean>;
}

interface StampsState {
  stamps: Stamp[];
  error: string | null;
  /** goal_id, für das zuletzt geladen wurde (→ abgeleitetes `loading`). */
  loadedFor: string | null;
}

let tempIdCounter = 0;

/** Stempel eines Ziels laden + optimistisch stempeln. */
export function useGoalStamps(goalId: string | undefined): UseGoalStampsResult {
  const { user } = useAuth();
  const [state, setState] = useState<StampsState>({
    stamps: [],
    error: null,
    loadedFor: null,
  });
  // Slots, für die gerade ein Insert läuft (verhindert Doppel-Taps).
  const pendingSlots = useRef<Set<string>>(new Set());

  const refetch = useCallback(async () => {
    if (!goalId) return;
    try {
      const stamps = await getStampsForGoal(goalId);
      setState({ stamps, error: null, loadedFor: goalId });
    } catch (err) {
      setState({
        stamps: [],
        error:
          err instanceof Error
            ? err.message
            : "Stempel konnten nicht geladen werden.",
        loadedFor: goalId,
      });
    }
  }, [goalId]);

  useEffect(() => {
    if (!goalId) return;
    void refetch();
  }, [goalId, refetch]);

  const addStamp = useCallback(
    async (cardIndex: number, slotIndex: number): Promise<boolean> => {
      if (!goalId || !user) {
        setState((prev) => ({ ...prev, error: "Nicht angemeldet." }));
        return false;
      }

      const slotKey = `${cardIndex}:${slotIndex}`;
      if (pendingSlots.current.has(slotKey)) return false;
      if (
        state.stamps.some(
          (s) => s.card_index === cardIndex && s.slot_index === slotIndex,
        )
      ) {
        return false;
      }

      pendingSlots.current.add(slotKey);
      const tempId = `temp-stamp-${++tempIdCounter}`;
      const optimistic: Stamp = {
        id: tempId,
        goal_id: goalId,
        user_id: user.id,
        card_index: cardIndex,
        slot_index: slotIndex,
        stamped_at: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, stamps: [...prev.stamps, optimistic] }));

      try {
        const real = await insertStamp({
          goalId,
          userId: user.id,
          cardIndex,
          slotIndex,
        });
        setState((prev) => ({
          ...prev,
          stamps: prev.stamps.map((s) => (s.id === tempId ? real : s)),
          error: null,
        }));
        return true;
      } catch (err) {
        // Revert des optimistischen Updates
        setState((prev) => ({
          ...prev,
          stamps: prev.stamps.filter((s) => s.id !== tempId),
          error:
            err instanceof Error
              ? err.message
              : "Stempel konnte nicht gespeichert werden.",
        }));
        return false;
      } finally {
        pendingSlots.current.delete(slotKey);
      }
    },
    [goalId, user, state.stamps],
  );

  const loading = !!goalId && state.loadedFor !== goalId;

  return {
    stamps: goalId ? state.stamps : [],
    loading,
    error: goalId ? state.error : null,
    refetch,
    addStamp,
  };
}
