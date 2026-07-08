"use client";

/**
 * Übersichts-Tab des Dashboards: lädt selbst alle Ziele + alle Stempel des
 * Users (getGoals + getAllStampsForUser) und zeigt
 * - Stat-Zeile („X Stempel gesamt · Y Karten voll · Z Ziele aktiv"),
 * - Cross-Goal-Prozent-Chart (OverviewChart, lazy — Plotly bleibt aus dem
 *   initialen Routen-Chunk, gleiche Begründung wie GoalAnalytics),
 * - Aktivitäts-Feed nach Tagen,
 * - kompakte Fortschrittsliste pro Ziel (klickbar → Detailseite).
 *
 * Lädt bei der `active`-Flanke false→true neu (frisch gesetzte Stempel aus
 * dem Ziele-Tab wären sonst nicht sichtbar) — gleiches Muster wie
 * GoalAnalytics auf der Dashboard-Kachel.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { buildOverviewData } from "@/lib/analytics/overview-data";
import { getAllStampsForUser, getGoals } from "@/lib/goals/queries";
import type { Goal, Stamp } from "@/lib/goals/types";
import { ActivityFeed } from "./ActivityFeed";

const FALLBACK_COLOR = "#f59e0b";

// Plotly (auch als Basic-Bundle ~1 MB) nur client-seitig und lazy laden —
// nie im Server-Bundle, nie im initialen Routen-Chunk (Export-kompatibel).
const OverviewChart = dynamic(() => import("./OverviewChart"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-72 items-center justify-center rounded-2xl bg-stone-50 text-xs text-stone-400"
      aria-hidden="true"
    >
      Diagramm wird geladen …
    </div>
  ),
});

interface OverviewState {
  goals: Goal[];
  stamps: Stamp[];
  error: string | null;
  /** user.id, für den zuletzt geladen wurde (→ abgeleitetes `loading`). */
  loadedFor: string | null;
}

export interface OverviewPanelProps {
  /** Ist der Übersichts-Tab gerade sichtbar? (Refetch bei false→true.) */
  active?: boolean;
}

export function OverviewPanel({ active = true }: OverviewPanelProps) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<OverviewState>({
    goals: [],
    stamps: [],
    error: null,
    loadedFor: null,
  });
  const prevActive = useRef(active);

  const refetch = useCallback(async () => {
    if (!user) return;
    try {
      const [goals, stamps] = await Promise.all([
        getGoals(user.id),
        getAllStampsForUser(user.id),
      ]);
      setState({ goals, stamps, error: null, loadedFor: user.id });
    } catch (err) {
      setState({
        goals: [],
        stamps: [],
        error:
          err instanceof Error
            ? err.message
            : "Die Übersicht konnte nicht geladen werden.",
        loadedFor: user.id,
      });
    }
  }, [user]);

  useEffect(() => {
    if (authLoading || !user) return;
    void refetch();
  }, [authLoading, user, refetch]);

  useEffect(() => {
    if (active && !prevActive.current) void refetch();
    prevActive.current = active;
  }, [active, refetch]);

  const { goals, stamps, error } = state;
  const loading = authLoading || (!!user && state.loadedFor !== user.id);

  const data = useMemo(() => buildOverviewData(goals, stamps), [goals, stamps]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner label="Übersicht wird geladen …" />
      </div>
    );
  }

  if (error) {
    return (
      <p
        className="mx-auto max-w-md rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
        <span
          className="flex h-20 w-20 rotate-[-6deg] items-center justify-center rounded-3xl border-2 border-dashed border-amber-300 bg-amber-50 text-4xl"
          aria-hidden="true"
        >
          📊
        </span>
        <h2 className="text-lg font-semibold text-stone-700">
          Hier gibt es noch nichts zu sehen
        </h2>
        <p className="max-w-sm text-sm leading-6 text-stone-500">
          Die Übersicht füllt sich, sobald du dein erstes Ziel anlegst und
          Stempel sammelst.
        </p>
        <Link
          href="/goals/new"
          className="mt-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition hover:bg-amber-600 active:scale-[0.98]"
        >
          Erstes Ziel anlegen
        </Link>
      </div>
    );
  }

  const { totals } = data;

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-3 rounded-3xl border border-amber-100 bg-white p-5 shadow-xl shadow-amber-900/5">
        <p className="text-sm font-medium text-stone-500">
          <span className="font-semibold text-stone-700">
            {totals.totalStamps}
          </span>{" "}
          Stempel gesamt ·{" "}
          <span className="font-semibold text-stone-700">
            {totals.totalCompletedCards}
          </span>{" "}
          Karten voll ·{" "}
          <span className="font-semibold text-stone-700">
            {totals.goalCount}
          </span>{" "}
          Ziele aktiv
        </p>

        {totals.totalStamps === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/70 px-4 py-8 text-center text-sm leading-6 text-stone-500">
            Noch keine Stempel — sobald du stempelst, vergleichen sich hier
            alle Ziele auf einen Blick. 📈
          </p>
        ) : (
          <OverviewChart
            goals={goals}
            series={data.series}
            completions={data.completions}
            height={300}
          />
        )}
      </section>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <section
          className="flex flex-col gap-3 rounded-3xl border border-amber-100 bg-white p-5 shadow-xl shadow-amber-900/5"
          aria-label="Ziele im Überblick"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Ziele im Überblick
          </h2>
          <ul className="flex flex-col gap-1.5">
            {goals.map((goal, index) => {
              const summary = data.summaries[index];
              const color = goal.color ?? FALLBACK_COLOR;
              return (
                <li key={goal.id}>
                  <Link
                    href={`/goal?id=${goal.id}`}
                    className="group flex items-center gap-3 rounded-xl bg-stone-50/70 px-3 py-2.5 transition hover:bg-amber-50"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 rotate-[-6deg] items-center justify-center rounded-lg border-2 border-dashed text-base transition group-hover:rotate-0"
                      style={{
                        borderColor: `${color}88`,
                        backgroundColor: `${color}1a`,
                      }}
                      aria-hidden="true"
                    >
                      {goal.icon ?? "🎯"}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium text-stone-700 group-hover:text-amber-700">
                          {goal.title}
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-stone-500">
                          {summary.stampCount}/{goal.target_count} ·{" "}
                          {summary.completedCards}/{summary.totalCards} Karten
                        </span>
                      </span>
                      <span
                        className="block h-1.5 w-full overflow-hidden rounded-full bg-stone-200/70"
                        role="progressbar"
                        aria-valuenow={Math.round(summary.percent)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Fortschritt ${goal.title}`}
                      >
                        <span
                          className="block h-full rounded-full transition-[width]"
                          style={{
                            width: `${summary.percent}%`,
                            backgroundColor: color,
                          }}
                        />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          className="flex flex-col gap-3 rounded-3xl border border-amber-100 bg-white p-5 shadow-xl shadow-amber-900/5"
          aria-label="Letzte Aktivität"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Letzte Aktivität
          </h2>
          <ActivityFeed activity={data.activity} goals={goals} />
        </section>
      </div>
    </div>
  );
}
