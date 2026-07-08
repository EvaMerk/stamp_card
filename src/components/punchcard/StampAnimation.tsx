"use client";

import { useEffect, useId, useRef } from "react";
import { motion } from "motion/react";

/**
 * Gesamtdauer des Stempel-Flugs in Sekunden (Absenken → Impact → Abheben).
 */
const STAMP_DURATION_S = 0.85;

/**
 * Zeitpunkt des Aufpralls als Anteil der Gesamtdauer — muss zu den
 * Keyframe-`times` unten passen (der Frame, an dem der Stempel aufsetzt).
 */
const IMPACT_FRACTION = 0.32;

/** Zeitpunkt des Aufpralls in Millisekunden (für den onImpact-Timer). */
export const STAMP_IMPACT_MS = Math.round(
  STAMP_DURATION_S * IMPACT_FRACTION * 1000,
);

export interface StampAnimationProps {
  /** Akzentfarbe des Ziels — färbt Gummi-Pad und Tintenring. */
  color: string;
  /** Feuert im Moment des Aufpralls (→ Feld darunter füllen). */
  onImpact?: () => void;
  /** Feuert, wenn der Stempel wieder abgehoben ist (→ Overlay abbauen). */
  onComplete?: () => void;
}

/**
 * Overlay-Stempel-Animation für ein einzelnes Punchcard-Feld (CSS-3D, kein
 * three.js): ein Gummistempel mit Holzgriff schwingt mit Perspektive
 * (`rotateX`/`transformPerspective`) von oben herab, setzt mit einem kurzen
 * Squash-Bounce und Rotations-Wackler auf, ein Tintenring pufft auf, dann
 * hebt der Stempel wieder ab und gibt das (permanent gefüllte) Feld frei.
 *
 * Muss in einem `position: relative`-Container mit Feld-Größe gemountet
 * werden. Lebensdauer = eine Animation; der Aufrufer unmountet die Komponente
 * in `onComplete`. Reduced Motion behandelt der Aufrufer (Overlay gar nicht
 * erst mounten).
 */
export function StampAnimation({
  color,
  onImpact,
  onComplete,
}: StampAnimationProps) {
  // Callbacks in Refs, damit der Impact-Timer nicht bei jedem Re-Render
  // (neue Inline-Callbacks) zurückgesetzt wird.
  const onImpactRef = useRef(onImpact);
  onImpactRef.current = onImpact;

  useEffect(() => {
    const timer = setTimeout(() => onImpactRef.current?.(), STAMP_IMPACT_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <span
      className="pointer-events-none absolute inset-0 z-10 block"
      style={{ transformStyle: "preserve-3d" }}
      aria-hidden="true"
    >
      {/* Tintenring: pufft im Moment des Aufpralls kurz auf. */}
      <motion.span
        className="absolute inset-0 block rounded-full"
        style={{ border: `3px solid ${color}` }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.7, 0], scale: [0.6, 1.45, 1.6] }}
        transition={{
          duration: 0.5,
          delay: STAMP_IMPACT_MS / 1000,
          times: [0, 0.35, 1],
          ease: "easeOut",
        }}
      />

      {/* Der Stempel selbst: fliegt mit Perspektive ein, Squash beim Impact,
          kleiner Wackler, dann Abheben nach hinten oben. */}
      <motion.span
        className="absolute inset-x-0 bottom-0 block"
        style={{
          transformPerspective: 520,
          transformOrigin: "50% 100%",
        }}
        initial={{
          opacity: 0,
          y: "-85%",
          rotateX: 48,
          rotate: -7,
          scaleX: 1.08,
          scaleY: 1.12,
        }}
        animate={{
          //           Anflug    Impact  Squash  Erholung  Ruhe   Abheben
          opacity: [0, 1, 1, 1, 1, 1, 0],
          y: ["-85%", "-8%", "0%", "-2%", "0%", "-30%", "-80%"],
          rotateX: [48, 10, 0, 0, 0, -18, -32],
          rotate: [-7, -2, 1.5, -1, 0, 2, 5],
          scaleX: [1.08, 1.01, 1.07, 0.99, 1, 1, 1.02],
          scaleY: [1.12, 1.02, 0.9, 1.03, 1, 1, 1.02],
        }}
        transition={{
          duration: STAMP_DURATION_S,
          times: [0, 0.22, IMPACT_FRACTION, 0.42, 0.52, 0.78, 1],
          ease: [
            "easeIn",
            "easeIn",
            "easeOut",
            "easeInOut",
            "easeOut",
            "easeIn",
          ],
        }}
        onAnimationComplete={() => onComplete?.()}
      >
        <StampSvg color={color} />
      </motion.span>
    </span>
  );
}

/**
 * Klassischer Gummistempel als Inline-SVG: Holzknauf, geschwungener Hals,
 * Holzsockel und Gummi-Pad in der Zielfarbe. Das Pad sitzt am unteren Rand
 * der viewBox, sodass es beim Aufsetzen genau auf dem Feld landet.
 */
function StampSvg({ color }: { color: string }) {
  // Eindeutige Gradient-IDs — es können mehrere Stempel gleichzeitig fliegen.
  const uid = useId();
  const woodId = `stamp-wood-${uid}`;
  const knobId = `stamp-knob-${uid}`;

  return (
    <svg
      viewBox="0 0 100 120"
      className="-ml-[22%] block w-[144%] max-w-none drop-shadow-md"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={woodId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a16207" />
          <stop offset="0.45" stopColor="#ca8a04" />
          <stop offset="1" stopColor="#854d0e" />
        </linearGradient>
        <radialGradient id={knobId} cx="0.38" cy="0.32" r="0.9">
          <stop offset="0" stopColor="#eab308" />
          <stop offset="0.55" stopColor="#a16207" />
          <stop offset="1" stopColor="#713f12" />
        </radialGradient>
      </defs>

      {/* Holzknauf */}
      <circle cx="50" cy="17" r="14" fill={`url(#${knobId})`} />
      <ellipse cx="45" cy="12" rx="5" ry="3.5" fill="#fef3c7" opacity="0.45" />

      {/* Geschwungener Hals */}
      <path
        d="M45 29 C45 41 39 47 33 55 L67 55 C61 47 55 41 55 29 Z"
        fill={`url(#${woodId})`}
      />

      {/* Holzsockel */}
      <rect x="21" y="55" width="58" height="30" rx="9" fill={`url(#${woodId})`} />
      <rect
        x="25"
        y="59"
        width="14"
        height="5"
        rx="2.5"
        fill="#fef3c7"
        opacity="0.35"
      />

      {/* Gummi-Pad in Zielfarbe — Unterkante = Unterkante der viewBox,
          damit das Pad beim Aufsetzen bündig auf dem Feld landet. */}
      <rect x="15" y="86" width="70" height="34" rx="10" fill={color} />
      {/* Schattierung an der Unterkante des Pads */}
      <rect
        x="15"
        y="106"
        width="70"
        height="14"
        rx="7"
        fill="#000"
        opacity="0.22"
      />
      {/* Glanzlicht auf dem Pad */}
      <rect
        x="21"
        y="90"
        width="20"
        height="5"
        rx="2.5"
        fill="#fff"
        opacity="0.3"
      />
    </svg>
  );
}
