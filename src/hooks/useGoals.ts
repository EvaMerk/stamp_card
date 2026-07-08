"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getGoals } from "@/lib/goals/queries";
import type { Goal } from "@/lib/goals/types";

export interface UseGoalsResult {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface GoalsState {
  goals: Goal[];
  error: string | null;
  /** user.id, für den zuletzt geladen wurde (→ abgeleitetes `loading`). */
  loadedFor: string | null;
}

/**
 * Lädt alle (nicht archivierten) Ziele des angemeldeten Users.
 * Bewusst simpel gehalten (useEffect + useState, kein React Query).
 */
export function useGoals(): UseGoalsResult {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<GoalsState>({
    goals: [],
    error: null,
    loadedFor: null,
  });

  const refetch = useCallback(async () => {
    if (!user) return;
    await getGoals(user.id)
      .then((goals) => setState({ goals, error: null, loadedFor: user.id }))
      .catch((err: unknown) =>
        setState({
          goals: [],
          error:
            err instanceof Error
              ? err.message
              : "Ziele konnten nicht geladen werden.",
          loadedFor: user.id,
        }),
      );
  }, [user]);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    getGoals(user.id)
      .then((goals) => {
        if (!cancelled) setState({ goals, error: null, loadedFor: user.id });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            goals: [],
            error:
              err instanceof Error
                ? err.message
                : "Ziele konnten nicht geladen werden.",
            loadedFor: user.id,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const loading = authLoading || (!!user && state.loadedFor !== user.id);

  return {
    goals: user ? state.goals : [],
    loading,
    error: user ? state.error : null,
    refetch,
  };
}
