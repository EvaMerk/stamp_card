"use client";

/**
 * Aktivitäts-Feed der Übersicht: Stempel aller Ziele nach Tag gruppiert
 * („Heute", „Gestern", sonst Datum), Karten-Abschlüsse als hervorgehobene
 * 🎉-Einträge. Zeigt anfangs nur die jüngsten Tage; „Mehr anzeigen" klappt
 * den Rest auf (die Daten sind bereits in overview-data.ts auf ~30 Tage
 * begrenzt).
 */

import { useState } from "react";
import type { DayActivity } from "@/lib/analytics/overview-data";
import type { Goal } from "@/lib/goals/types";

/** So viele Tages-Gruppen sind ohne „Mehr anzeigen" sichtbar. */
const COLLAPSED_DAY_COUNT = 7;

export interface ActivityFeedProps {
  /** Tages-Gruppen, neueste zuerst (aus buildDayActivity). */
  activity: DayActivity[];
  goals: Goal[];
}

export function ActivityFeed({ activity, goals }: ActivityFeedProps) {
  const [expanded, setExpanded] = useState(false);
  const goalsById = new Map(goals.map((goal) => [goal.id, goal]));

  if (activity.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/70 px-4 py-8 text-center text-sm leading-6 text-stone-500">
        Noch keine Aktivität — dein erster Stempel taucht hier auf. 🕐
      </p>
    );
  }

  const visibleDays = expanded
    ? activity
    : activity.slice(0, COLLAPSED_DAY_COUNT);

  return (
    <div className="flex flex-col gap-4">
      {visibleDays.map((day) => (
        <section key={day.dateKey} aria-label={day.label}>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
            {day.label}
          </h3>
          <ul className="flex flex-col gap-1.5">
            {day.entries.map((entry) => {
              const goal = goalsById.get(entry.goalId);
              const icon = goal?.icon ?? "🎯";
              const title = goal?.title ?? "Gelöschtes Ziel";
              return entry.type === "cardCompleted" ? (
                <li
                  key={`${entry.goalId}-card-${entry.cardNumber}`}
                  className="flex items-center gap-2.5 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800"
                >
                  <span aria-hidden="true" className="shrink-0">
                    🎉
                  </span>
                  <span className="min-w-0 truncate">
                    Karte {entry.cardNumber} von „{title}“ voll!
                  </span>
                </li>
              ) : (
                <li
                  key={`${entry.goalId}-stamps`}
                  className="flex items-center gap-2.5 rounded-xl bg-stone-50/70 px-3 py-2 text-sm text-stone-600"
                >
                  <span aria-hidden="true" className="shrink-0">
                    {icon}
                  </span>
                  <span className="min-w-0 truncate font-medium text-stone-700">
                    {title}
                  </span>
                  <span className="ml-auto shrink-0 text-xs tabular-nums text-stone-500">
                    {entry.count} Stempel
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {!expanded && activity.length > COLLAPSED_DAY_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="self-center rounded-full px-4 py-1.5 text-xs font-medium text-stone-500 transition hover:bg-stone-100 hover:text-amber-700"
        >
          Mehr anzeigen
        </button>
      )}
    </div>
  );
}
