"use client";

/**
 * Übersicht aller Karten eines Ziels: Status (voll / aktiv / offen als
 * Phosphor-Piktogramme), Stempelstand, Belohnung (Karten-Override vor
 * goals.reward_text) und für volle Karten das Abschlussdatum (spätester
 * Stempel der Karte).
 */

import { format, isValid, parseISO } from "date-fns";
import {
  CheckCircle,
  Circle,
  Gift,
  HourglassMedium,
  type Icon,
} from "@phosphor-icons/react";
import {
  activeCardIndex,
  slotsForCard,
  totalCards,
} from "@/lib/goals/punchcard-math";
import type { Goal, GoalCardReward, Stamp } from "@/lib/goals/types";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { MessageKey } from "@/lib/i18n/messages";
import { dateLocale } from "@/lib/i18n/date-locale";

type CardStatus = "full" | "active" | "open";

const STATUS_META: Record<
  CardStatus,
  { icon: Icon; weight: "fill" | "bold"; labelKey: MessageKey; iconClass: string }
> = {
  full: {
    icon: CheckCircle,
    weight: "fill",
    labelKey: "analytics.status.full",
    iconClass: "text-success",
  },
  active: {
    icon: HourglassMedium,
    weight: "fill",
    labelKey: "analytics.status.active",
    iconClass: "text-accent",
  },
  open: {
    icon: Circle,
    weight: "bold",
    labelKey: "analytics.status.open",
    iconClass: "text-ink-faint",
  },
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
  const { t, lang } = useI18n();
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
      aria-label={t("analytics.cardsOverview")}
    >
      {rows.map((row) => {
        const meta = STATUS_META[row.status];
        const StatusIcon = meta.icon;
        return (
          <li
            key={row.card}
            className={`flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm ${
              row.status === "active" ? "bg-accent-soft" : "bg-sunken/60"
            }`}
          >
            <StatusIcon
              size={15}
              weight={meta.weight}
              aria-hidden="true"
              className={`shrink-0 ${meta.iconClass}`}
            />
            <span className="sr-only">{t(meta.labelKey)}</span>
            <span className="shrink-0 font-medium text-ink">
              {t("form.cardLabel", { n: row.card + 1 })}
            </span>
            <span className="shrink-0 text-xs tabular-nums text-ink-soft">
              {row.count}/{row.slotCount}
            </span>
            {row.reward ? (
              <span
                className="flex min-w-0 flex-1 items-center gap-1 truncate text-xs text-ink-soft"
                title={row.reward}
              >
                <Gift size={12} weight="fill" aria-hidden="true" className="shrink-0" />
                <span className="truncate">{row.reward}</span>
              </span>
            ) : (
              <span className="flex-1" aria-hidden="true" />
            )}
            {row.completedAt && (
              <span className="shrink-0 text-xs text-ink-faint">
                {format(row.completedAt, "d. MMM yyyy", {
                  locale: dateLocale(lang),
                })}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
