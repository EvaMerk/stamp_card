"use client";

/**
 * Zentrale Ziel-Symbolik („Ticket & Tinte“): kuratierte Phosphor-Icons als
 * gestempelte Piktogramme. In goals.icon wird der Phosphor-NAME als String
 * gespeichert (z.B. "Barbell") — KEINE Migration nötig, die Spalte bleibt
 * text.
 *
 * Rückwärtskompatibilität: Bestandsziele enthalten Emojis ("🏃", "📚").
 * {@link GoalIcon} rendert bekannte Phosphor-Namen als Icon und alles andere
 * unverändert als Text (Emoji-Fallback). Überall verwenden, wo ein
 * Ziel-Symbol erscheint (Dashboard-Kachel, Detail-Header, Übersicht, Feed,
 * Icon-Picker im GoalForm).
 */

import type { CSSProperties } from "react";
import {
  Barbell,
  Bicycle,
  BookOpen,
  Broom,
  ChatsCircle,
  Drop,
  ForkKnife,
  Heart,
  Moon,
  MusicNotes,
  Palette,
  PencilLine,
  PersonSimpleRun,
  PiggyBank,
  Plant,
  Prohibit,
  Sparkle,
  Sun,
  SwimmingPool,
  Target,
  type Icon,
  type IconWeight,
} from "@phosphor-icons/react";

/** Bekannte Phosphor-Icons (Name in goals.icon → Komponente). */
export const GOAL_ICONS: Record<string, Icon> = {
  Target,
  Barbell,
  PersonSimpleRun,
  Bicycle,
  SwimmingPool,
  BookOpen,
  PencilLine,
  MusicNotes,
  Palette,
  Plant,
  Drop,
  ForkKnife,
  Moon,
  Broom,
  PiggyBank,
  ChatsCircle,
  Sun,
  Prohibit,
  Heart,
  Sparkle,
};

/** Standard-Symbol für neue Ziele bzw. Fallback bei goal.icon = null. */
export const DEFAULT_GOAL_ICON = "Target";

/** Kuratierte Auswahl fürs GoalForm (Reihenfolge = Anzeige im Grid). */
export const GOAL_ICON_CHOICES: { name: string; label: string }[] = [
  { name: "Target", label: "Zielscheibe" },
  { name: "Barbell", label: "Krafttraining" },
  { name: "PersonSimpleRun", label: "Laufen" },
  { name: "Bicycle", label: "Radfahren" },
  { name: "SwimmingPool", label: "Schwimmen" },
  { name: "BookOpen", label: "Lesen" },
  { name: "PencilLine", label: "Schreiben" },
  { name: "MusicNotes", label: "Musik" },
  { name: "Palette", label: "Kreativität" },
  { name: "Plant", label: "Pflanzen" },
  { name: "Drop", label: "Wasser trinken" },
  { name: "ForkKnife", label: "Ernährung" },
  { name: "Moon", label: "Schlaf" },
  { name: "Broom", label: "Haushalt" },
  { name: "PiggyBank", label: "Sparen" },
  { name: "ChatsCircle", label: "Soziales" },
  { name: "Sun", label: "Draußen sein" },
  { name: "Prohibit", label: "Verzicht" },
  { name: "Heart", label: "Selbstfürsorge" },
  { name: "Sparkle", label: "Besonderes" },
];

export interface GoalIconProps {
  /** Wert aus goals.icon: Phosphor-Name ODER Emoji (Bestandsdaten). */
  name?: string | null;
  size?: number;
  weight?: IconWeight;
  className?: string;
  style?: CSSProperties;
}

/**
 * Rendert das Symbol eines Ziels: bekannter Phosphor-Name → Icon
 * (weight="bold" als gestempeltes Piktogramm), sonst der rohe String
 * (Emoji-Fallback für Bestandsdaten), null → Zielscheibe.
 */
export function GoalIcon({
  name,
  size = 20,
  weight = "bold",
  className,
  style,
}: GoalIconProps) {
  const IconComponent = GOAL_ICONS[name ?? DEFAULT_GOAL_ICON];
  if (IconComponent) {
    return (
      <IconComponent
        size={size}
        weight={weight}
        className={className}
        style={style}
        aria-hidden="true"
      />
    );
  }
  return (
    <span
      className={className}
      style={{ fontSize: size * 0.85, lineHeight: 1, ...style }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
