"use client";

import { useState } from "react";
import {
  firstEmptySlot,
  slotsForCard,
  totalCards,
} from "@/lib/goals/punchcard-math";
import type { Goal, Stamp } from "@/lib/goals/types";
import { PunchSlot, type PunchSlotState } from "./PunchSlot";
import { RewardBadge } from "./RewardBadge";

const FALLBACK_COLOR = "#f59e0b"; // amber-500

export interface PunchCardGridProps {
  goal: Goal;
  /** 0-basierter Index der anzuzeigenden Karte. */
  cardIndex: number;
  /** Stempel DIESER Karte (bereits gefiltert). */
  stamps: Stamp[];
  /** Belohnung für diese Karte (Override oder goals.reward_text). */
  rewardText?: string | null;
  /**
   * Stempel-Mutation (optimistisch, gibt Erfolg zurück). Ohne `onStamp` ist
   * die Karte rein lesend.
   */
  onStamp?: (slotIndex: number) => Promise<boolean>;
}

/**
 * Eine Stempelkarte: gestrichelte, abgerundete Karte mit Kartennummer,
 * optionaler Belohnung und dem Felder-Grid. Nur das nächste sequenzielle
 * freie Feld ist tappbar. Vollendet ein Stempel die Karte, feiert das
 * {@link RewardBadge} mit Konfetti und Belohnungstext.
 */
export function PunchCardGrid({
  goal,
  cardIndex,
  stamps,
  rewardText,
  onStamp,
}: PunchCardGridProps) {
  const [stamping, setStamping] = useState(false);
  // Glückwunsch-Notiz, wenn die letzte Stempelung eine Karte vollendet hat.
  const [completedNote, setCompletedNote] = useState<{
    cardNumber: number;
    rewardText: string | null;
  } | null>(null);

  const color = goal.color ?? FALLBACK_COLOR;
  const cards = totalCards(goal.target_count, goal.card_size);
  const slotCount = slotsForCard(cardIndex, goal.target_count, goal.card_size);
  const stampedSlots = new Set(stamps.map((s) => s.slot_index));
  const nextFreeSlot = onStamp ? firstEmptySlot(stampedSlots, slotCount) : null;
  const columns = Math.min(5, Math.max(1, slotCount));

  // Einziger Stempel-Pfad Richtung Datenbank (via Hook des Aufrufers).
  async function handleStamp(slotIndex: number) {
    if (!onStamp || stamping) return;
    const completesCard = stampedSlots.size === slotCount - 1;
    setStamping(true);
    try {
      const ok = await onStamp(slotIndex);
      if (ok && completesCard) {
        setCompletedNote({
          cardNumber: cardIndex + 1,
          rewardText: rewardText ?? null,
        });
      }
    } finally {
      setStamping(false);
    }
  }

  function slotState(slotIndex: number): PunchSlotState {
    if (stampedSlots.has(slotIndex)) return "filled";
    if (slotIndex === nextFreeSlot) return "active";
    return "locked";
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="rounded-2xl border-2 border-dashed p-4"
        style={{ borderColor: `${color}55`, backgroundColor: `${color}0d` }}
      >
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Karte {cardIndex + 1} von {cards}
          </span>
          {rewardText && (
            <span
              className="truncate text-xs font-medium text-stone-600"
              title={rewardText}
            >
              🎁 {rewardText}
            </span>
          )}
        </div>

        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: slotCount }, (_, slotIndex) => (
            <PunchSlot
              key={slotIndex}
              state={slotState(slotIndex)}
              slotNumber={cardIndex * goal.card_size + slotIndex + 1}
              color={color}
              disabled={stamping}
              onStamp={() => void handleStamp(slotIndex)}
            />
          ))}
        </div>
      </div>

      {completedNote && (
        <RewardBadge
          cardNumber={completedNote.cardNumber}
          rewardText={completedNote.rewardText}
          onDismiss={() => setCompletedNote(null)}
        />
      )}
    </div>
  );
}
