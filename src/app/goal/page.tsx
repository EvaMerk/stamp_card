"use client";

/**
 * Ziel-Detailseite.
 *
 * BEWUSST eine Query-Param-Route (/goal?id=…) statt dynamischer Route
 * (/goals/[goalId]): `output: 'export'` (Capacitor) unterstützt keine
 * dynamischen Routen ohne generateStaticParams, und die Goal-IDs sind erst
 * zur Laufzeit bekannt. useSearchParams ist in <Suspense> gewickelt
 * (Voraussetzung fürs statische Prerendering).
 */

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format, isValid, parseISO } from "date-fns";
import { GoalAnalyticsView } from "@/components/analytics/GoalAnalytics";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { derivedEndDate } from "@/components/goals/PeriodPicker";
import { PunchCardGrid } from "@/components/punchcard/PunchCardGrid";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { useGoalStamps } from "@/hooks/useGoalStamps";
import {
  activeCardIndex,
  remainingCount,
  totalCards,
} from "@/lib/goals/punchcard-math";
import { deleteGoal, getCardRewards, getGoal } from "@/lib/goals/queries";
import { type Goal, type GoalCardReward } from "@/lib/goals/types";
import { useI18n, type TranslateFn } from "@/lib/i18n/LanguageProvider";
import type { Lang } from "@/lib/i18n/constants";
import { dateLocale } from "@/lib/i18n/date-locale";
import { periodTypeLabel } from "@/lib/goals/period-labels";

const FALLBACK_COLOR = "#f59e0b";

function formatDay(iso: string, lang: Lang): string {
  const date = parseISO(iso);
  return isValid(date)
    ? format(date, "d. MMMM yyyy", { locale: dateLocale(lang) })
    : iso;
}

/** "Jahr · 5. Juli 2026 – 4. Juli 2027" bzw. custom mit gespeichertem Ende. */
function formatGoalPeriod(goal: Goal, t: TranslateFn, lang: Lang): string {
  const type = periodTypeLabel(t, goal.period_type);
  const start = formatDay(goal.start_date, lang);
  const end =
    goal.period_type === "custom"
      ? goal.end_date
        ? formatDay(goal.end_date, lang)
        : null
      : (() => {
          const derived = derivedEndDate(goal.period_type, goal.start_date);
          return derived
            ? format(derived, "d. MMMM yyyy", { locale: dateLocale(lang) })
            : null;
        })();
  return end
    ? t("period.goalRange", { type, start, end })
    : t("period.goalFrom", { type, start });
}

function GoalDetailContent() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const searchParams = useSearchParams();
  const goalId = searchParams.get("id") ?? undefined;

  // Kombinierter Lade-Zustand; `loading` wird aus `loadedFor` abgeleitet
  // (kein synchrones setState im Effect).
  const [goalState, setGoalState] = useState<{
    goal: Goal | null;
    rewards: GoalCardReward[];
    error: string | null;
    loadedFor: string | null;
  }>({ goal: null, rewards: [], error: null, loadedFor: null });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { stamps, loading: stampsLoading, error: stampsError, addStamp } =
    useGoalStamps(goalId);

  useEffect(() => {
    if (!goalId) return;
    let cancelled = false;
    Promise.all([getGoal(goalId), getCardRewards(goalId)])
      .then(([goalData, rewardData]) => {
        if (cancelled) return;
        setGoalState({
          goal: goalData,
          rewards: rewardData,
          error: null,
          loadedFor: goalId,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setGoalState({
          goal: null,
          rewards: [],
          error:
            err instanceof Error ? err.message : t("goal.loadFailed"),
          loadedFor: goalId,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [goalId]);

  const { goal, rewards, error: loadError } = goalState;
  const goalLoading = !!goalId && goalState.loadedFor !== goalId;

  const handleDelete = useCallback(async () => {
    if (!goalId) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteGoal(goalId);
      router.replace("/dashboard");
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : t("goal.deleteFailed"),
      );
      setDeleting(false);
    }
  }, [goalId, router, t]);

  if (goalLoading || stampsLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner label={t("goal.loading")} />
      </div>
    );
  }

  if (!goalId || loadError || !goal) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold text-stone-700">
          {loadError ?? t("goal.notFound")}
        </p>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          {t("goal.backToDashboard")}
        </Link>
      </div>
    );
  }

  const color = goal.color ?? FALLBACK_COLOR;
  const stampCount = stamps.length;
  const cards = totalCards(goal.target_count, goal.card_size);
  const activeCard = activeCardIndex(
    stampCount,
    goal.target_count,
    goal.card_size,
  );
  const remaining = remainingCount(goal.target_count, stampCount);
  const cardStamps = stamps.filter((s) => s.card_index === activeCard);
  const rewardText =
    rewards.find((r) => r.card_index === activeCard)?.reward_text ??
    goal.reward_text;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-8">
      <header className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          {t("goal.backToDashboard")}
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex h-14 w-14 shrink-0 rotate-[-6deg] items-center justify-center rounded-2xl border-2 border-dashed text-3xl"
              style={{
                borderColor: `${color}88`,
                backgroundColor: `${color}1a`,
              }}
              aria-hidden="true"
            >
              {goal.icon ?? "🎯"}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight text-stone-800">
                {goal.title}
              </h1>
              <p className="text-xs text-stone-500">
                {formatGoalPeriod(goal, t, lang)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Link
              href={`/goal/edit?id=${goal.id}`}
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 shadow-sm transition hover:border-amber-300 hover:text-amber-700 active:scale-[0.98]"
            >
              {t("goal.edit")}
            </Link>
            <Button
              variant="secondary"
              className="text-red-600 hover:border-red-300 hover:text-red-700"
              onClick={() => setDeleteOpen(true)}
            >
              {t("goal.delete")}
            </Button>
          </div>
        </div>

        {goal.description && (
          <p className="mt-3 text-sm leading-6 text-stone-500">
            {goal.description}
          </p>
        )}
      </header>

      <main className="flex flex-col gap-4 rounded-3xl border border-amber-100 bg-white p-6 shadow-xl shadow-amber-900/5">
        <p className="text-sm font-medium text-stone-500">
          {t("goal.detailProgress", {
            done: stampCount,
            total: goal.target_count,
            card: activeCard + 1,
            cards,
            remaining,
          })}
          {remaining === 0 && (
            <span className="ml-2 font-semibold text-amber-600">
              {t("goal.reached")}
            </span>
          )}
        </p>

        <PunchCardGrid
          goal={goal}
          cardIndex={activeCard}
          stamps={cardStamps}
          rewardText={rewardText}
          onStamp={(slotIndex) => addStamp(activeCard, slotIndex)}
        />

        {stampsError && (
          <p
            className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700"
            role="alert"
          >
            {stampsError}
          </p>
        )}
      </main>

      {/* Analytics teilt sich die bereits geladenen stamps/rewards — Stempel
          oben erscheinen sofort auch in Chart und Kartenübersicht. */}
      <section
        className="mt-6 flex flex-col gap-4 rounded-3xl border border-amber-100 bg-white p-6 shadow-xl shadow-amber-900/5"
        aria-label={t("goal.stats")}
      >
        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          {t("goal.stats")}
        </h2>
        <GoalAnalyticsView
          goal={goal}
          stamps={stamps}
          rewards={rewards}
          chartHeight={300}
        />
      </section>

      <Modal
        open={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
        title={t("goal.deleteConfirmTitle")}
      >
        <p className="text-sm leading-6 text-stone-600">
          {t("goal.deleteConfirmBody", { title: goal.title })}
        </p>
        {deleteError && (
          <p
            className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700"
            role="alert"
          >
            {deleteError}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setDeleteOpen(false)}
            disabled={deleting}
          >
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? t("goal.deleting") : t("goal.deleteConfirmCta")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function GoalDetailPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="flex min-h-dvh items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <GoalDetailContent />
      </Suspense>
    </AuthGuard>
  );
}
