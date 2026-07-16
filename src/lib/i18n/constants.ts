/**
 * i18n-Konstanten & Helfer, die von der Sprach-UI und dem LanguageProvider
 * geteilt werden.
 *
 * WICHTIG: Der blockierende Inline-Head-Script (src/app/layout.tsx) darf diese
 * Datei NICHT importieren (er läuft vor dem Bundle, muss self-contained sein).
 * Die dortigen String-Literale müssen deshalb zu diesen Werten passen —
 * bei Änderung beide Stellen anpassen. Vorbild: src/lib/theme/constants.ts.
 */

/** Vom Nutzer wählbare UI-Sprachen. */
export type Lang = "de" | "en";

export const LANGS: readonly Lang[] = ["de", "en"] as const;

/** localStorage-Schlüssel (pro Gerät). */
export const LANG_STORAGE_KEY = "stempelkarte-lang";

/** Fallback, falls navigator/localStorage nicht verfügbar sind. */
export const DEFAULT_LANG: Lang = "de";

export function isLang(value: unknown): value is Lang {
  return value === "de" || value === "en";
}

/**
 * Löst die anzuwendende Sprache auf: gespeicherte Wahl gewinnt; sonst folgt
 * die Sprache der Geräte-/Browser-Sprache (`navigator.language` beginnt mit
 * "de" → Deutsch, sonst Englisch). SSR-/Export-sicher.
 */
export function resolveLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const raw = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (isLang(raw)) return raw;
  } catch {
    /* localStorage nicht verfügbar → Geräte-Sprache. */
  }
  return deviceLang();
}

/** Geräte-/Browser-Sprache: "de*" → Deutsch, alles andere → Englisch. */
export function deviceLang(): Lang {
  if (typeof navigator === "undefined") return DEFAULT_LANG;
  const nav = navigator.language ?? "";
  return nav.toLowerCase().startsWith("de") ? "de" : "en";
}
