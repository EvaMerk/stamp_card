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
import type { TranslateFn } from "@/lib/i18n/LanguageProvider";
import type { MessageKey } from "@/lib/i18n/messages";
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

/**
 * Kuratierte Auswahl fürs GoalForm (Reihenfolge = Anzeige im Grid). Die
 * anzeigbaren Labels sind übersetzt: `labelKey` verweist auf den i18n-
 * Schlüssel (goalIcon.*), aufgelöst über {@link goalIconLabel}.
 */
export const GOAL_ICON_CHOICES: { name: string; labelKey: MessageKey }[] = [
  { name: "Target", labelKey: "goalIcon.Target" },
  { name: "Barbell", labelKey: "goalIcon.Barbell" },
  { name: "PersonSimpleRun", labelKey: "goalIcon.PersonSimpleRun" },
  { name: "Bicycle", labelKey: "goalIcon.Bicycle" },
  { name: "SwimmingPool", labelKey: "goalIcon.SwimmingPool" },
  { name: "BookOpen", labelKey: "goalIcon.BookOpen" },
  { name: "PencilLine", labelKey: "goalIcon.PencilLine" },
  { name: "MusicNotes", labelKey: "goalIcon.MusicNotes" },
  { name: "Palette", labelKey: "goalIcon.Palette" },
  { name: "Plant", labelKey: "goalIcon.Plant" },
  { name: "Drop", labelKey: "goalIcon.Drop" },
  { name: "ForkKnife", labelKey: "goalIcon.ForkKnife" },
  { name: "Moon", labelKey: "goalIcon.Moon" },
  { name: "Broom", labelKey: "goalIcon.Broom" },
  { name: "PiggyBank", labelKey: "goalIcon.PiggyBank" },
  { name: "ChatsCircle", labelKey: "goalIcon.ChatsCircle" },
  { name: "Sun", labelKey: "goalIcon.Sun" },
  { name: "Prohibit", labelKey: "goalIcon.Prohibit" },
  { name: "Heart", labelKey: "goalIcon.Heart" },
  { name: "Sparkle", labelKey: "goalIcon.Sparkle" },
];

/** Übersetztes Label eines Icon-Namens (Fallback: der rohe Name). */
export function goalIconLabel(t: TranslateFn, name: string): string {
  const choice = GOAL_ICON_CHOICES.find((c) => c.name === name);
  return choice ? t(choice.labelKey) : name;
}

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
