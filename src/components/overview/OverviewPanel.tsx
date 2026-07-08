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
import { ChartLineUp } from "@phosphor-icons/react";
import { GoalIcon } from "@/components/goals/GoalIcon";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { buildOverviewData } from "@/lib/analytics/overview-data";
import { getAllStampsForUser, getGoals } from "@/lib/goals/queries";
import type { Goal, Stamp } from "@/lib/goals/types";
import { ActivityFeed } from "./ActivityFeed";

const FALLBACK_COLOR = "#e07316"; // --accent (Light)

// Plotly (auch als Basic-Bundle ~1 MB) nur client-seitig und lazy laden —
// nie im Server-Bundle, nie im initialen Routen-Chunk (Export-kompatibel).
const OverviewChart = dynamic(() => import("./OverviewChart"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-72 items-center justify-center rounded-[20px] bg-sunken text-xs text-ink-faint"
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
        className="bg-danger-soft mx-auto max-w-md rounded-2xl px-4 py-3 text-sm text-danger"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="relative flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
        <span
          className="aura absolute left-1/2 top-8 h-56 w-56 -translate-x-1/2"
          aria-hidden="true"
        />
        <span
          className="relative flex h-20 w-20 rotate-[-8deg] items-center justify-center rounded-full bg-stamp text-stamp-check shadow-card"
          aria-hidden="true"
        >
          <ChartLineUp size={40} weight="bold" />
        </span>
        <h2 className="relative font-display text-xl font-semibold tracking-tight text-ink">
          Hier gibt es noch nichts zu sehen
        </h2>
        <p className="relative max-w-sm text-sm leading-6 text-ink-soft">
          Die Übersicht füllt sich, sobald du dein erstes Ziel anlegst und
          Stempel sammelst.
        </p>
        <Link
          href="/goals/new"
          className="relative mt-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast shadow-md shadow-accent/25 transition hover:bg-accent-strong active:scale-[0.98]"
        >
          Erstes Ziel anlegen
        </Link>
      </div>
    );
  }

  const { totals } = data;

  return (
    <div className="flex flex-col gap-5">
      <section className="relative flex flex-col gap-3 overflow-hidden rounded-[20px] border border-hairline bg-surface p-5 shadow-card">
        <span className="aura absolute -right-12 -top-12 h-36 w-36" aria-hidden="true" />
        <p className="relative text-sm font-medium text-ink-soft">
          <span className="font-display text-base font-bold text-ink">
            {totals.totalStamps}
          </span>{" "}
          Stempel gesamt ·{" "}
          <span className="font-display text-base font-bold text-ink">
            {totals.totalCompletedCards}
          </span>{" "}
          Karten voll ·{" "}
          <span className="font-display text-base font-bold text-ink">
            {totals.goalCount}
          </span>{" "}
          Ziele aktiv
        </p>

        {totals.totalStamps === 0 ? (
          <p className="relative rounded-[20px] border-2 border-dashed border-hairline bg-sunken/60 px-4 py-8 text-center text-sm leading-6 text-ink-soft">
            Noch keine Stempel — sobald du stempelst, vergleichen sich hier
            alle Ziele auf einen Blick.
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
          className="flex flex-col gap-3 rounded-[20px] border border-hairline bg-surface p-5 shadow-card"
          aria-label="Ziele im Überblick"
        >
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
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
                    className="hover:bg-accent-soft group flex items-center gap-3 rounded-2xl bg-sunken/60 px-3 py-2.5 transition"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 rotate-[-6deg] items-center justify-center rounded-full transition group-hover:rotate-0"
                      style={{
                        border: `2px solid color-mix(in srgb, ${color} 55%, transparent)`,
                        backgroundColor: `color-mix(in srgb, ${color} 12%, var(--surface))`,
                        color,
                      }}
                      aria-hidden="true"
                    >
                      <GoalIcon name={goal.icon} size={18} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium text-ink group-hover:text-accent-strong">
                          {goal.title}
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-ink-soft">
                          {summary.stampCount}/{goal.target_count} ·{" "}
                          {summary.completedCards}/{summary.totalCards} Karten
                        </span>
                      </span>
                      <span
                        className="block h-1.5 w-full overflow-hidden rounded-full bg-hairline"
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
          className="flex flex-col gap-3 rounded-[20px] border border-hairline bg-surface p-5 shadow-card"
          aria-label="Letzte Aktivität"
        >
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Letzte Aktivität
          </h2>
          <ActivityFeed activity={data.activity} goals={goals} />
        </section>
      </div>
    </div>
  );
}
