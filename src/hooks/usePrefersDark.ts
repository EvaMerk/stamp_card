"use client";

import { useEffect, useState } from "react";

/**
 * Folgt `prefers-color-scheme: dark` live (matchMedia-Listener).
 *
 * Verwendung: Plotly kann keine CSS-Variablen lesen — die Charts wählen
 * damit die passende Farbvariante aus src/lib/analytics/chart-theme.ts und
 * rendern beim Theme-Wechsel neu. Initial `false` (SSR-sicher); der echte
 * Wert kommt im ersten Effect — die Charts sind ohnehin rein client-seitig.
 */
export function usePrefersDark(): boolean {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setDark(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return dark;
}
