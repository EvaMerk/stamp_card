"use client";

import { useState } from "react";
import { Gift } from "@phosphor-icons/react";
import {
  firstEmptySlot,
  slotsForCard,
  totalCards,
} from "@/lib/goals/punchcard-math";
import type { Goal, Stamp } from "@/lib/goals/types";
import { PunchSlot, type PunchSlotState } from "./PunchSlot";
import { RewardBadge } from "./RewardBadge";

const FALLBACK_COLOR = "#e07316"; // --accent (Light)

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
 * Die Stempelkarte als Mitglieds-Ticket („Ticket & Tinte“):
 * - oben der Ticket-Korpus in Creme: Eyebrow „Mitgliedskarte · No. {n}“
 *   (gesperrte Kapitälchen) + Felder-Grid,
 * - dann die Perforationslinie (gestrichelt, mit zwei seitlich
 *   eingeschnittenen Kerben in der Flächenfarbe des Umfelds),
 * - darunter der Abriss-Streifen, getönt in der Zielfarbe, mit
 *   Geschenk-Icon, Belohnungstext und dekorativem Barcode.
 *
 * Nur das nächste sequenzielle freie Feld ist tappbar. Vollendet ein Stempel
 * die Karte, feiert das {@link RewardBadge} mit Konfetti und Belohnungstext.
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
      <div className="relative overflow-hidden rounded-[20px] border border-hairline bg-ticket shadow-card">
        {/* Orange-Aura in der Ticket-Ecke (dekorativ) */}
        <span className="aura absolute -right-10 -top-10 h-32 w-32" aria-hidden="true" />

        {/* Ticket-Korpus: Eyebrow + Felder-Grid */}
        <div className="relative px-4 pb-4 pt-3.5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
              Mitgliedskarte · No. {cardIndex + 1}
            </span>
            {cards > 1 && (
              <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                von {cards}
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

        {/* Perforationslinie mit seitlichen Kerben (Flächenfarbe des
            Umfelds = --surface; overflow-hidden schneidet die Kreise an). */}
        <div className="relative" aria-hidden="true">
          <span className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-hairline bg-surface" />
          <span className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-hairline bg-surface" />
          <div className="mx-5 border-t-2 border-dashed border-hairline" />
        </div>

        {/* Abriss-Streifen: Pastell-Tönung der Zielfarbe (Light) bzw. dunkle
            Tönung (Dark) — color-mix gegen den Ticket-Korpus. */}
        <div
          className="relative flex min-h-11 items-center gap-2.5 px-5 py-2.5"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 16%, var(--ticket))`,
          }}
        >
          {rewardText ? (
            <>
              <Gift
                size={16}
                weight="fill"
                className="shrink-0"
                style={{ color }}
                aria-hidden="true"
              />
              <span
                className="min-w-0 flex-1 truncate text-xs font-medium text-ink-soft"
                title={rewardText}
              >
                {rewardText}
              </span>
            </>
          ) : (
            <span className="flex-1" aria-hidden="true" />
          )}
          <Barcode className="h-4 w-auto shrink-0 text-ink/50" />
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

/** Strichbreiten des dekorativen Barcodes (deterministisch, kein Zufall). */
const BARCODE_PATTERN = [
  3, 1, 1, 2, 1, 3, 1, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 1, 2,
] as const;
const BARCODE_GAP = 1.6;
const BARCODE_HEIGHT = 18;

/** Dekorativer Barcode: dünne vertikale Striche als Inline-SVG (keine Lib). */
function Barcode({ className }: { className?: string }) {
  let x = 0;
  const bars = BARCODE_PATTERN.map((width, i) => {
    const bar = (
      <rect key={i} x={x} y={0} width={width} height={BARCODE_HEIGHT} />
    );
    x += width + BARCODE_GAP;
    return bar;
  });
  const totalWidth = x - BARCODE_GAP;

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${BARCODE_HEIGHT}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="currentColor">{bars}</g>
    </svg>
  );
}
