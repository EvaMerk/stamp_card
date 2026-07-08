"use client";

import { motion, useReducedMotion } from "motion/react";
import { Confetti, Gift } from "@phosphor-icons/react";

/**
 * Verzögerung des Badge-Einflugs in Sekunden — abgestimmt auf die
 * Stempel-Animation, damit das Badge erst nach dem Aufprall des Stempels
 * auf dem letzten Feld erscheint.
 */
const ENTRANCE_DELAY_S = 0.55;

/**
 * Konfetti-Punkte: deterministisch (kein Math.random beim Rendern).
 * Farben = die neue Preset-Palette aus GoalForm („Ticket & Tinte“).
 */
const CONFETTI = [
  { angle: 205, distance: 74, color: "#e8871e", size: 7 },
  { angle: 230, distance: 92, color: "#e25d4f", size: 5 },
  { angle: 250, distance: 70, color: "#2fb7b0", size: 6 },
  { angle: 268, distance: 96, color: "#e8871e", size: 5 },
  { angle: 282, distance: 66, color: "#5a8dee", size: 7 },
  { angle: 296, distance: 90, color: "#d96a9b", size: 5 },
  { angle: 312, distance: 72, color: "#e25d4f", size: 6 },
  { angle: 330, distance: 88, color: "#2fb7b0", size: 5 },
  { angle: 190, distance: 60, color: "#5a8dee", size: 5 },
  { angle: 350, distance: 64, color: "#9f7aea", size: 6 },
  { angle: 260, distance: 118, color: "#d96a9b", size: 4 },
  { angle: 285, distance: 122, color: "#9f7aea", size: 4 },
];

export interface RewardBadgeProps {
  /** 1-basierte Nummer der vollendeten Karte. */
  cardNumber: number;
  /** Belohnungstext dieser Karte (Override oder goals.reward_text). */
  rewardText?: string | null;
  /** Schließt das Badge (Aufrufer setzt seinen State zurück). */
  onDismiss: () => void;
}

/**
 * Feier-Badge, wenn das letzte Feld einer Karte gestempelt wurde: poppt mit
 * einem Konfetti-Burst aus kleinen Farbpunkten auf (reines CSS, motion/react)
 * und bleibt danach als ruhige statische Notiz stehen, bis der User sie
 * wegklickt.
 *
 * Bei `prefers-reduced-motion` entfallen Konfetti und Pop — das Badge blendet
 * nur dezent ein.
 */
export function RewardBadge({
  cardNumber,
  rewardText,
  onDismiss,
}: RewardBadgeProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative">
      {/* Konfetti-Burst: fliegt einmalig aus der Badge-Mitte nach oben/außen. */}
      {!reduceMotion && (
        <span
          className="pointer-events-none absolute inset-0 z-10 block overflow-visible"
          aria-hidden="true"
        >
          {CONFETTI.map((dot, i) => {
            const rad = (dot.angle * Math.PI) / 180;
            return (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 block rounded-full"
                style={{
                  width: dot.size,
                  height: dot.size,
                  backgroundColor: dot.color,
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(rad) * dot.distance,
                  y: Math.sin(rad) * dot.distance,
                  scale: [0, 1.2, 0.5],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 0.9,
                  delay: ENTRANCE_DELAY_S + 0.08,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </span>
      )}

      <motion.div
        className="bg-accent-soft relative flex items-start gap-3 rounded-2xl border border-accent/30 py-2.5 pl-4 pr-2 text-sm text-ink"
        role="status"
        initial={
          reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.6, y: 14 }
        }
        animate={
          reduceMotion
            ? { opacity: 1 }
            : { opacity: 1, scale: [0.6, 1.08, 1], y: [14, -3, 0] }
        }
        transition={
          reduceMotion
            ? { duration: 0.25, delay: ENTRANCE_DELAY_S }
            : {
                duration: 0.45,
                delay: ENTRANCE_DELAY_S,
                times: [0, 0.7, 1],
                ease: "easeOut",
              }
        }
      >
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-semibold text-accent-strong">
            <Confetti size={16} weight="fill" aria-hidden="true" />
            <span>
              Karte voll!{" "}
              <span className="font-normal text-ink">
                Karte {cardNumber} ist komplett — stark!
              </span>
            </span>
          </p>
          {rewardText && (
            <p className="mt-0.5 flex items-center gap-1.5 text-ink-soft">
              <Gift size={14} weight="fill" aria-hidden="true" />
              <span>
                Deine Belohnung: <strong className="text-ink">{rewardText}</strong>
              </span>
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 cursor-pointer rounded-lg px-2 py-0.5 text-base leading-none text-accent-strong transition hover:bg-accent/15"
          aria-label="Hinweis schließen"
        >
          ×
        </button>
      </motion.div>
    </div>
  );
}
