/**
 * Übersetzte Labels für die Zeitraum-Typen. Ersetzt die früheren statischen
 * deutschen PERIOD_TYPE_LABELS — die Beschriftungen leben jetzt im i18n-Dict
 * (period.year/month/week/custom) und werden hier zur aktiven Sprache
 * aufgelöst.
 */

import type { TranslateFn } from "@/lib/i18n/LanguageProvider";
import type { MessageKey } from "@/lib/i18n/messages";
import type { PeriodType } from "@/lib/goals/types";

const KEYS: Record<PeriodType, MessageKey> = {
  year: "period.year",
  month: "period.month",
  week: "period.week",
  custom: "period.custom",
};

export function periodTypeLabel(t: TranslateFn, type: PeriodType): string {
  return t(KEYS[type]);
}
