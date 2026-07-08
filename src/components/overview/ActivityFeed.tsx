"use client";

/**
 * Aktivitäts-Feed der Übersicht: Stempel aller Ziele nach Tag gruppiert
 * („Heute", „Gestern", sonst Datum), Karten-Abschlüsse als hervorgehobene
 * Konfetti-Einträge. Zeigt anfangs nur die jüngsten Tage; „Mehr anzeigen"
 * klappt den Rest auf (die Daten sind bereits in overview-data.ts auf
 * ~30 Tage begrenzt).
 */

import { useState } from "react";
import { Confetti } from "@phosphor-icons/react";
import { GoalIcon } from "@/components/goals/GoalIcon";
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
      <p className="rounded-[20px] border-2 border-dashed border-hairline bg-sunken/60 px-4 py-8 text-center text-sm leading-6 text-ink-soft">
        Noch keine Aktivität — dein erster Stempel taucht hier auf.
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
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
            {day.label}
          </h3>
          <ul className="flex flex-col gap-1.5">
            {day.entries.map((entry) => {
              const goal = goalsById.get(entry.goalId);
              const title = goal?.title ?? "Gelöschtes Ziel";
              return entry.type === "cardCompleted" ? (
                <li
                  key={`${entry.goalId}-card-${entry.cardNumber}`}
                  className="bg-accent-soft flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium text-accent-strong"
                >
                  <Confetti
                    size={16}
                    weight="fill"
                    aria-hidden="true"
                    className="shrink-0"
                  />
                  <span className="min-w-0 truncate">
                    Karte {entry.cardNumber} von „{title}“ voll!
                  </span>
                </li>
              ) : (
                <li
                  key={`${entry.goalId}-stamps`}
                  className="flex items-center gap-2.5 rounded-2xl bg-sunken/60 px-3 py-2 text-sm text-ink-soft"
                >
                  <span
                    aria-hidden="true"
                    className="flex shrink-0 items-center"
                    style={{ color: goal?.color ?? "var(--accent)" }}
                  >
                    <GoalIcon name={goal?.icon} size={16} />
                  </span>
                  <span className="min-w-0 truncate font-medium text-ink">
                    {title}
                  </span>
                  <span className="ml-auto shrink-0 text-xs tabular-nums text-ink-soft">
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
          className="self-center rounded-full px-4 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-sunken hover:text-accent-strong"
        >
          Mehr anzeigen
        </button>
      )}
    </div>
  );
}
