"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";

/**
 * Liefert `true`, wenn das AUFGELÖSTE Theme dunkel ist — also der Wert, den der
 * Nutzer per Einstellungen (System/Hell/Dunkel) tatsächlich sieht, NICHT die
 * rohe OS-Präferenz.
 *
 * Verwendung: Plotly kann keine CSS-Variablen lesen — die Charts wählen damit
 * die passende Farbvariante aus src/lib/analytics/chart-theme.ts und rendern
 * beim Theme-Wechsel neu. Quelle ist der ThemeProvider (data-theme am <html>),
 * damit eine manuelle Dunkel-/Hell-Wahl auch die Charts umschaltet — sonst
 * bekäme z.B. „Dunkel" auf einem hellen OS einen hellen Chart.
 */
export function usePrefersDark(): boolean {
  return useTheme().resolvedTheme === "dark";
}
