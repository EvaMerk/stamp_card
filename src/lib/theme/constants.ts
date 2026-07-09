/**
 * Theme-Konstanten & Helfer, die von der Einstellungs-UI und dem
 * ThemeProvider geteilt werden.
 *
 * WICHTIG: Der blockierende Inline-Head-Script (src/app/layout.tsx) darf diese
 * Datei NICHT importieren (er läuft vor dem Bundle, muss self-contained sein).
 * Die dortigen String-Literale müssen deshalb zu diesen Werten passen —
 * bei Änderung beide Stellen anpassen.
 */

import { DEFAULT_ACCENT, isAccentKey } from "./accents";

/** Vom Nutzer wählbarer Modus. "system" folgt der OS-Einstellung. */
export type ThemeMode = "system" | "light" | "dark";

/** Aufgelöster Modus, der als data-theme am <html> landet. */
export type ResolvedTheme = "light" | "dark";

export const DEFAULT_MODE: ThemeMode = "system";

/** localStorage-Schlüssel (pro Gerät). */
export const MODE_STORAGE_KEY = "stempelkarte-theme";
export const ACCENT_STORAGE_KEY = "stempelkarte-accent";

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

/** Sicheres Lesen von localStorage (SSR-/Export-sicher). */
export function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return DEFAULT_MODE;
  try {
    const raw = window.localStorage.getItem(MODE_STORAGE_KEY);
    return isThemeMode(raw) ? raw : DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

export function readStoredAccent(): string {
  if (typeof window === "undefined") return DEFAULT_ACCENT;
  try {
    const raw = window.localStorage.getItem(ACCENT_STORAGE_KEY);
    return isAccentKey(raw) ? raw : DEFAULT_ACCENT;
  } catch {
    return DEFAULT_ACCENT;
  }
}

/** Aktuelle OS-Präferenz (matchMedia). */
export function systemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Löst den anzuwendenden Modus auf: bei "system" zählt die OS-Präferenz. */
export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "light") return "light";
  if (mode === "dark") return "dark";
  return systemPrefersDark() ? "dark" : "light";
}
