/**
 * Kuratierte Akzentfarben-Palette („Ticket & Tinte").
 *
 * EINZIGE QUELLE der Akzent-Liste für die TypeScript-Seite (Einstellungs-UI:
 * Swatches). Die tatsächlichen Token-Werte (--accent, --accent-strong,
 * --accent-soft, --accent-contrast, --aura) leben in src/app/globals.css,
 * geschlüsselt über denselben `key` via :root[data-accent="…"]. Beide MÜSSEN
 * synchron bleiben — neue Farbe hier UND dort ergänzen.
 *
 * `swatch` ist nur die Vorschau-Füllung des runden Auswahl-Buttons (Light-Wert
 * von --accent); die echte Anwendung passiert über data-accent + CSS.
 *
 * "amber" ist der Standard und reproduziert die bisherigen Amber-Werte exakt.
 */

export type AccentKey =
  | "amber"
  | "coral"
  | "pink"
  | "violet"
  | "blau"
  | "tuerkis"
  | "gruen";

export interface Accent {
  key: AccentKey;
  /** Deutsches Label für die Einstellungs-UI. */
  label: string;
  /** Vorschau-Farbe des Swatch-Buttons (= --accent im Light-Mode). */
  swatch: string;
}

export const ACCENTS: readonly Accent[] = [
  { key: "amber", label: "Amber", swatch: "#e07316" },
  { key: "coral", label: "Koralle", swatch: "#e14e3c" },
  { key: "pink", label: "Pink", swatch: "#d64a86" },
  { key: "violet", label: "Violett", swatch: "#8257d1" },
  { key: "blau", label: "Blau", swatch: "#2f74d0" },
  { key: "tuerkis", label: "Türkis", swatch: "#0f8f8a" },
  { key: "gruen", label: "Grün", swatch: "#4f9152" },
] as const;

export const DEFAULT_ACCENT: AccentKey = "amber";

const ACCENT_KEYS = new Set<string>(ACCENTS.map((a) => a.key));

/** Prüft, ob ein beliebiger String ein bekannter Akzent-Schlüssel ist. */
export function isAccentKey(value: unknown): value is AccentKey {
  return typeof value === "string" && ACCENT_KEYS.has(value);
}
