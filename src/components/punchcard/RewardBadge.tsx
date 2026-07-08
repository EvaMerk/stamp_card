"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Verzögerung des Badge-Einflugs in Sekunden — abgestimmt auf die
 * Stempel-Animation, damit das Badge erst nach dem Aufprall des Stempels
 * auf dem letzten Feld erscheint.
 */
const ENTRANCE_DELAY_S = 0.55;

/** Konfetti-Punkte: deterministisch (kein Math.random beim Rendern). */
const CONFETTI = [
  { angle: 205, distance: 74, color: "#f59e0b", size: 7 },
  { angle: 230, distance: 92, color: "#fb7185", size: 5 },
  { angle: 250, distance: 70, color: "#34d399", size: 6 },
  { angle: 268, distance: 96, color: "#f59e0b", size: 5 },
  { angle: 282, distance: 66, color: "#38bdf8", size: 7 },
  { angle: 296, distance: 90, color: "#fbbf24", size: 5 },
  { angle: 312, distance: 72, color: "#fb7185", size: 6 },
  { angle: 330, distance: 88, color: "#34d399", size: 5 },
  { angle: 190, distance: 60, color: "#38bdf8", size: 5 },
  { angle: 350, distance: 64, color: "#fbbf24", size: 6 },
  { angle: 260, distance: 118, color: "#fb7185", size: 4 },
  { angle: 285, distance: 122, color: "#34d399", size: 4 },
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
 * einem Konfetti-Burst aus kleinen Farbpunkten auf (reines CSS/SVG-frei,
 * motion/react) und bleibt danach als ruhige statische Notiz stehen, bis der
 * User sie wegklickt. Ersetzt die frühere Inline-🎉-Notiz in PunchCardGrid.
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
        className="relative flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 py-2.5 pl-4 pr-2 text-sm text-amber-800 shadow-sm"
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
          <p className="font-semibold">
            Karte voll! 🎉{" "}
            <span className="font-normal">
              Karte {cardNumber} ist komplett — stark!
            </span>
          </p>
          {rewardText && (
            <p className="mt-0.5">
              🎁 Deine Belohnung: <strong>{rewardText}</strong>
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 cursor-pointer rounded-lg px-2 py-0.5 text-base leading-none text-amber-500 transition hover:bg-amber-100 hover:text-amber-700"
          aria-label="Hinweis schließen"
        >
          ×
        </button>
      </motion.div>
    </div>
  );
}
