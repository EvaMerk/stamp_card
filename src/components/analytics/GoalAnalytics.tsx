"use client";

/**
 * Analytics-Ansicht eines Ziels (Panel B des GoalCard-Swipes bzw. Statistik-
 * Sektion der Detailseite).
 *
 * Zweigeteilt:
 * - {@link GoalAnalyticsView}: rein präsentational (Stat-Zeile, Chart,
 *   Kartenübersicht) — bekommt Stempel/Belohnungen als Props. Wird auf der
 *   Detailseite mit den dort bereits geladenen Daten wiederverwendet.
 * - {@link GoalAnalytics}: selbstladender Container (useGoalStamps +
 *   getCardRewards) für die Dashboard-Kachel; lädt beim Einwischen
 *   (`active`-Flanke) neu, damit frisch gesetzte Stempel sichtbar sind.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/Spinner";
import { useGoalStamps } from "@/hooks/useGoalStamps";
import { buildStampChartData } from "@/lib/analytics/chart-data";
import {
  remainingCount,
  slotsForCard,
  totalCards,
} from "@/lib/goals/punchcard-math";
import { getCardRewards } from "@/lib/goals/queries";
import type { Goal, GoalCardReward, Stamp } from "@/lib/goals/types";
import { CardOverviewList } from "./CardOverviewList";

const FALLBACK_COLOR = "#f59e0b";

// Plotly (auch als Basic-Bundle ~1 MB) nur client-seitig und lazy laden —
// nie im Server-Bundle, nie im initialen Routen-Chunk (Export-kompatibel).
const StampHistoryChart = dynamic(() => import("./StampHistoryChart"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-60 items-center justify-center rounded-2xl bg-stone-50 text-xs text-stone-400"
      aria-hidden="true"
    >
      Diagramm wird geladen …
    </div>
  ),
});

export interface GoalAnalyticsViewProps {
  goal: Goal;
  /** ALLE Stempel des Ziels, chronologisch. */
  stamps: Stamp[];
  /** Belohnungs-Overrides pro Karte. */
  rewards: GoalCardReward[];
  /** Chart-Höhe in px (Kachel kompakt, Detailseite großzügiger). */
  chartHeight?: number;
}

/** Präsentationale Analytics: Stat-Zeile + Chart + Kartenübersicht. */
export function GoalAnalyticsView({
  goal,
  stamps,
  rewards,
  chartHeight = 240,
}: GoalAnalyticsViewProps) {
  const color = goal.color ?? FALLBACK_COLOR;
  const stampCount = stamps.length;
  const cards = totalCards(goal.target_count, goal.card_size);
  const remaining = remainingCount(goal.target_count, stampCount);

  let fullCards = 0;
  const countsByCard = new Map<number, number>();
  for (const s of stamps) {
    countsByCard.set(s.card_index, (countsByCard.get(s.card_index) ?? 0) + 1);
  }
  for (let card = 0; card < cards; card++) {
    const slotCount = slotsForCard(card, goal.target_count, goal.card_size);
    if (slotCount > 0 && (countsByCard.get(card) ?? 0) >= slotCount) {
      fullCards++;
    }
  }

  const chartData = useMemo(
    () => buildStampChartData(goal, stamps),
    [goal, stamps],
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-stone-500">
        <span className="font-semibold text-stone-700">
          {stampCount}/{goal.target_count}
        </span>{" "}
        gestempelt · {remaining} offen · {fullCards}/{cards} Karten voll
      </p>

      {stampCount === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/70 px-4 py-8 text-center text-sm leading-6 text-stone-500">
          Noch keine Stempel — sobald du den ersten setzt, wächst hier deine
          Verlaufskurve. 📈
        </p>
      ) : (
        <StampHistoryChart data={chartData} color={color} height={chartHeight} />
      )}

      <CardOverviewList goal={goal} stamps={stamps} rewards={rewards} />
    </div>
  );
}

export interface GoalAnalyticsProps {
  goal: Goal;
  /**
   * Ist das Analytics-Panel gerade sichtbar? Bei der Flanke false→true wird
   * neu geladen (Stempel aus der Punch-Ansicht derselben Kachel sind sonst
   * nicht sichtbar, da die Panels getrennte Hook-Instanzen nutzen).
   */
  active?: boolean;
  chartHeight?: number;
}

/** Selbstladender Analytics-Container für die Dashboard-Kachel. */
export function GoalAnalytics({
  goal,
  active = true,
  chartHeight,
}: GoalAnalyticsProps) {
  const { stamps, loading, error, refetch } = useGoalStamps(goal.id);
  const [rewards, setRewards] = useState<GoalCardReward[]>([]);
  const prevActive = useRef(active);

  useEffect(() => {
    let cancelled = false;
    getCardRewards(goal.id)
      .then((data) => {
        if (!cancelled) setRewards(data);
      })
      .catch(() => {
        // Belohnungs-Overrides sind optional — Fallback ist goals.reward_text.
      });
    return () => {
      cancelled = true;
    };
  }, [goal.id]);

  useEffect(() => {
    if (active && !prevActive.current) void refetch();
    prevActive.current = active;
  }, [active, refetch]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner label="Statistik wird geladen …" />
      </div>
    );
  }

  if (error) {
    return (
      <p
        className="rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-700"
        role="alert"
      >
        {error}
      </p>
    );
  }

  return (
    <GoalAnalyticsView
      goal={goal}
      stamps={stamps}
      rewards={rewards}
      chartHeight={chartHeight}
    />
  );
}
