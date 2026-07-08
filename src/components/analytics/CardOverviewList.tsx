"use client";

/**
 * Übersicht aller Karten eines Ziels: Status (✓ voll / ⏳ aktiv / ○ offen),
 * Stempelstand, Belohnung (Karten-Override vor goals.reward_text) und für
 * volle Karten das Abschlussdatum (spätester Stempel der Karte).
 */

import { format, isValid, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import {
  activeCardIndex,
  slotsForCard,
  totalCards,
} from "@/lib/goals/punchcard-math";
import type { Goal, GoalCardReward, Stamp } from "@/lib/goals/types";

type CardStatus = "full" | "active" | "open";

const STATUS_META: Record<
  CardStatus,
  { icon: string; label: string; iconClass: string }
> = {
  full: { icon: "✓", label: "voll", iconClass: "text-emerald-600" },
  active: { icon: "⏳", label: "aktiv", iconClass: "text-amber-500" },
  open: { icon: "○", label: "offen", iconClass: "text-stone-300" },
};

export interface CardOverviewListProps {
  goal: Goal;
  /** ALLE Stempel des Ziels (nicht auf eine Karte gefiltert). */
  stamps: Stamp[];
  /** Belohnungs-Overrides pro Karte. */
  rewards: GoalCardReward[];
}

export function CardOverviewList({
  goal,
  stamps,
  rewards,
}: CardOverviewListProps) {
  const cards = totalCards(goal.target_count, goal.card_size);
  const active = activeCardIndex(
    stamps.length,
    goal.target_count,
    goal.card_size,
  );

  const rows = Array.from({ length: cards }, (_, card) => {
    const slotCount = slotsForCard(card, goal.target_count, goal.card_size);
    const cardStamps = stamps.filter((s) => s.card_index === card);
    const full = slotCount > 0 && cardStamps.length >= slotCount;
    const status: CardStatus = full ? "full" : card === active ? "active" : "open";
    const reward =
      rewards.find((r) => r.card_index === card)?.reward_text ??
      goal.reward_text;
    const completedAt = full
      ? cardStamps.reduce<Date | null>((max, s) => {
          const d = parseISO(s.stamped_at);
          if (!isValid(d)) return max;
          return !max || d > max ? d : max;
        }, null)
      : null;
    return { card, slotCount, count: cardStamps.length, status, reward, completedAt };
  });

  return (
    <ul
      className="flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-1"
      aria-label="Übersicht aller Karten"
    >
      {rows.map((row) => {
        const meta = STATUS_META[row.status];
        return (
          <li
            key={row.card}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm ${
              row.status === "active" ? "bg-amber-50" : "bg-stone-50/70"
            }`}
          >
            <span
              aria-hidden="true"
              className={`w-4 shrink-0 text-center text-sm ${meta.iconClass}`}
            >
              {meta.icon}
            </span>
            <span className="sr-only">{meta.label}</span>
            <span className="shrink-0 font-medium text-stone-700">
              Karte {row.card + 1}
            </span>
            <span className="shrink-0 text-xs tabular-nums text-stone-500">
              {row.count}/{row.slotCount}
            </span>
            {row.reward ? (
              <span
                className="min-w-0 flex-1 truncate text-xs text-stone-500"
                title={row.reward}
              >
                🎁 {row.reward}
              </span>
            ) : (
              <span className="flex-1" aria-hidden="true" />
            )}
            {row.completedAt && (
              <span className="shrink-0 text-xs text-stone-400">
                {format(row.completedAt, "d. MMM yyyy", { locale: de })}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
