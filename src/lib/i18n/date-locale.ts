/**
 * date-fns-Locale zur aktiven UI-Sprache. Monats-/Wochentagsnamen und
 * Datumsformate folgen so der App-Sprache (de ↔ enUS).
 */

import { de, enUS, type Locale } from "date-fns/locale";
import type { Lang } from "./constants";

export function dateLocale(lang: Lang): Locale {
  return lang === "de" ? de : enUS;
}
