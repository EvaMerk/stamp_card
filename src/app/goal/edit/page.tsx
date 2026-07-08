"use client";

/**
 * Ziel bearbeiten — Query-Param-Route (/goal/edit?id=…) aus demselben Grund
 * wie /goal: `output: 'export'` unterstützt keine dynamischen Routen ohne
 * generateStaticParams (siehe Kommentar in src/app/goal/page.tsx).
 */

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { GoalForm } from "@/components/goals/GoalForm";
import { Spinner } from "@/components/ui/Spinner";
import { getCardRewards, getGoal } from "@/lib/goals/queries";
import type { Goal, GoalCardReward } from "@/lib/goals/types";

function EditGoalContent() {
  const searchParams = useSearchParams();
  const goalId = searchParams.get("id");

  // Kombinierter Lade-Zustand; `loading` wird aus `loadedFor` abgeleitet
  // (kein synchrones setState im Effect).
  const [state, setState] = useState<{
    goal: Goal | null;
    rewards: GoalCardReward[];
    error: string | null;
    loadedFor: string | null;
  }>({ goal: null, rewards: [], error: null, loadedFor: null });

  useEffect(() => {
    if (!goalId) return;
    let cancelled = false;
    Promise.all([getGoal(goalId), getCardRewards(goalId)])
      .then(([goalData, rewardData]) => {
        if (cancelled) return;
        setState({
          goal: goalData,
          rewards: rewardData,
          error: null,
          loadedFor: goalId,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          goal: null,
          rewards: [],
          error:
            err instanceof Error
              ? err.message
              : "Das Ziel konnte nicht geladen werden.",
          loadedFor: goalId,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [goalId]);

  const { goal, rewards, error } = state;
  const loading = !!goalId && state.loadedFor !== goalId;

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner label="Ziel wird geladen …" />
      </div>
    );
  }

  if (!goalId || error || !goal) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold text-stone-700">
          {error ?? "Dieses Ziel wurde nicht gefunden."}
        </p>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          ← Zurück zum Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-8">
      <header className="mb-8">
        <Link
          href={`/goal?id=${goal.id}`}
          className="text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          ← Zurück zum Ziel
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-stone-800">
          Ziel bearbeiten
        </h1>
        <p className="mt-1 text-sm text-stone-500">{goal.title}</p>
      </header>

      <main className="rounded-3xl border border-amber-100 bg-white p-6 shadow-xl shadow-amber-900/5 sm:p-8">
        <GoalForm goal={goal} cardRewards={rewards} />
      </main>
    </div>
  );
}

export default function EditGoalPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="flex min-h-dvh items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <EditGoalContent />
      </Suspense>
    </AuthGuard>
  );
}
