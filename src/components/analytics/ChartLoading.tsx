"use client";

import { useTranslation } from "@/lib/i18n/LanguageProvider";

/**
 * Übersetzter Lade-Platzhalter für die lazy geladenen Plotly-Charts
 * (StampHistoryChart / OverviewChart). Als eigene Client-Komponente, damit die
 * `loading`-Option von next/dynamic (Modul-Ebene) `t()` nutzen kann.
 */
export function ChartLoading({ heightClass }: { heightClass: string }) {
  const { t } = useTranslation();
  return (
    <div
      className={`flex ${heightClass} items-center justify-center rounded-[20px] bg-sunken text-xs text-ink-faint`}
      aria-hidden="true"
    >
      {t("analytics.chartLoading")}
    </div>
  );
}
