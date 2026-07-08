"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { StampAnimation } from "./StampAnimation";

export type PunchSlotState = "filled" | "active" | "locked";

export interface PunchSlotProps {
  state: PunchSlotState;
  /** 1-basierte Anzeige-Nummer des Felds. */
  slotNumber: number;
  /** Akzentfarbe des Ziels (Hex). */
  color: string;
  /** Wird nur für das aktive freie Feld aufgerufen. */
  onStamp?: () => void;
  /** Deaktiviert das aktive Feld (z.B. während ein Stempel gespeichert wird). */
  disabled?: boolean;
}

/**
 * Ein einzelnes Feld der Stempelkarte.
 *
 * Zustände:
 * - `filled`      — permanenter Stempelabdruck
 * - `active`      — nächstes sequenzielles freies Feld, tappbar, dezenter Puls
 * - `locked`      — zukünftiges Feld, gedimmt
 *
 * Stempel-Ablauf (Phase 3): Klick auf das aktive Feld startet die
 * {@link StampAnimation} (Overlay) und feuert parallel `onStamp()` (der
 * optimistische Insert des Aufrufers). Der Stempelabdruck (Tinte) erscheint
 * erst im Moment des Aufpralls — auch wenn der optimistische Update das
 * `state`-Prop schon vorher auf `filled` gedreht hat. Nach dem Abheben des
 * Stempels entscheidet allein das `state`-Prop: bleibt es `filled`, ist der
 * Abdruck permanent; wurde der Insert revertiert (`active`), blendet die
 * Tinte sanft aus und das Feld ist wieder tappbar. Bei
 * `prefers-reduced-motion` wird ohne Overlay direkt gestempelt.
 */
export function PunchSlot({
  state,
  slotNumber,
  color,
  onStamp,
  disabled = false,
}: PunchSlotProps) {
  const reduceMotion = useReducedMotion();
  // Läuft gerade eine Stempel-Animation auf diesem Feld?
  const [animating, setAnimating] = useState(false);
  // Hat der Stempel schon aufgesetzt? (→ Tinte unter dem Stempel zeigen)
  const [impacted, setImpacted] = useState(false);

  // Einziger Stempel-Auslösepfad.
  function handleClick() {
    // `animating` schützt zusätzlich vor Doppel-Taps, solange ein Stempel
    // dieses Felds noch in der Luft ist (den DB-Doppel-Insert verhindert
    // bereits der Guard im Hook).
    if (state !== "active" || disabled || animating) return;
    if (!reduceMotion) {
      setAnimating(true);
      setImpacted(false);
    }
    onStamp?.();
  }

  // Tinte zeigen: während der Animation ab dem Aufprall (unabhängig vom noch
  // schwebenden optimistischen State), sonst rein Prop-getrieben. Vor dem
  // Aufprall wird ein optimistisch schon geflipptes `filled` unterdrückt.
  const inkVisible = animating ? impacted : state === "filled";
  // Basis-Darstellung unter der Tinte: während des Anflugs bleibt das Feld
  // optisch das aktive (ruhige) Feld, damit nichts vor dem Aufprall springt;
  // ab dem Aufprall verschwindet der (dann veraltete) Button unter der Tinte.
  const baseState: PunchSlotState = animating
    ? impacted
      ? "filled"
      : "active"
    : state;

  return (
    <span className="relative block aspect-square w-full">
      {baseState === "filled" ? (
        // Platzhalter unter der (permanenten) Tinte — trägt keine Semantik.
        <span
          className="block h-full w-full rounded-full bg-white"
          aria-hidden="true"
        />
      ) : baseState === "active" ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={cn(
            "flex aspect-square w-full items-center justify-center rounded-full border-2 border-dashed bg-white text-sm font-semibold transition disabled:cursor-not-allowed",
            animating
              ? "cursor-default"
              : "cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-60",
            !disabled && !animating && "animate-pulse",
          )}
          style={{ borderColor: color, color }}
          aria-label={`Feld ${slotNumber} stempeln`}
        >
          {slotNumber}
        </button>
      ) : (
        <span
          className="flex aspect-square w-full items-center justify-center rounded-full border-2 border-dashed border-stone-200 bg-stone-50 text-sm font-medium text-stone-300"
          aria-label={`Feld ${slotNumber}: noch gesperrt`}
        >
          {slotNumber}
        </span>
      )}

      {/* Stempelabdruck (Tinte). Exit-Fade deckt den Revert-Fall ab: schlägt
          der Insert fehl, dreht das Prop zurück auf `active` und die Tinte
          blendet sanft aus — kein hängendes Overlay. */}
      <AnimatePresence initial={false}>
        {inkVisible && (
          <motion.span
            key="ink"
            className="absolute inset-0 flex items-center justify-center rounded-full shadow-inner"
            style={{ backgroundColor: color }}
            role="img"
            aria-label={`Feld ${slotNumber}: gestempelt`}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.75 }
            }
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <span
              className="-rotate-6 text-lg font-black text-white drop-shadow-sm"
              aria-hidden="true"
            >
              ✓
            </span>
          </motion.span>
        )}
      </AnimatePresence>

      {/* Fliegender Stempel — pro Feld genau einer gleichzeitig. */}
      {animating && (
        <StampAnimation
          color={color}
          onImpact={() => setImpacted(true)}
          onComplete={() => {
            setAnimating(false);
            setImpacted(false);
          }}
        />
      )}
    </span>
  );
}
