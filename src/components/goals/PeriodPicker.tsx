"use client";

import { addDays, addMonths, addYears, format, isValid, parseISO, subDays } from "date-fns";
import { Input } from "@/components/ui/Input";
import { PERIOD_TYPES, type PeriodType } from "@/lib/goals/types";
import { periodTypeLabel } from "@/lib/goals/period-labels";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { dateLocale } from "@/lib/i18n/date-locale";
import { cn } from "@/lib/utils";

export interface PeriodPickerProps {
  periodType: PeriodType;
  /** Startdatum als yyyy-MM-dd. */
  startDate: string;
  /** Enddatum als yyyy-MM-dd (nur bei `custom` relevant). */
  endDate: string;
  onPeriodTypeChange: (periodType: PeriodType) => void;
  onStartDateChange: (startDate: string) => void;
  onEndDateChange: (endDate: string) => void;
  startDateError?: string;
  endDateError?: string;
}

/** Abgeleitetes Enddatum für feste Zeiträume (Jahr/Monat/Woche). */
export function derivedEndDate(
  periodType: PeriodType,
  startDate: string,
): Date | null {
  const start = parseISO(startDate);
  if (!isValid(start)) return null;
  switch (periodType) {
    case "year":
      return subDays(addYears(start, 1), 1);
    case "month":
      return subDays(addMonths(start, 1), 1);
    case "week":
      return addDays(start, 6);
    default:
      return null;
  }
}


/**
 * Zeitraum-Auswahl: Pillen-Segmented-Control (Jahr/Monat/Woche/Eigener
 * Zeitraum) + Startdatum; Enddatum nur bei eigenem Zeitraum, sonst
 * abgeleitete Anzeige.
 */
export function PeriodPicker({
  periodType,
  startDate,
  endDate,
  onPeriodTypeChange,
  onStartDateChange,
  onEndDateChange,
  startDateError,
  endDateError,
}: PeriodPickerProps) {
  const { t, lang } = useI18n();
  const start = parseISO(startDate);
  const derivedEnd = derivedEndDate(periodType, startDate);
  const formatDate = (date: Date) =>
    format(date, "d. MMMM yyyy", { locale: dateLocale(lang) });

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-ink-soft">{t("period.label")}</span>

      <div
        className="grid grid-cols-2 gap-1 rounded-full bg-sunken p-1 max-sm:rounded-[20px] sm:grid-cols-4"
        role="radiogroup"
        aria-label={t("period.typeLabel")}
      >
        {PERIOD_TYPES.map((type) => {
          const selected = periodType === type;
          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onPeriodTypeChange(type)}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium transition",
                selected
                  ? "bg-surface text-accent-strong shadow-sm"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              {periodTypeLabel(t, type)}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          type="date"
          label={t("period.startDate")}
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          error={startDateError}
        />
        {periodType === "custom" && (
          <Input
            type="date"
            label={t("period.endDate")}
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onEndDateChange(e.target.value)}
            error={endDateError}
          />
        )}
      </div>

      {periodType !== "custom" && derivedEnd && isValid(start) && (
        <p className="text-xs text-ink-soft">
          {t("period.range", {
            start: formatDate(start),
            end: formatDate(derivedEnd),
            type: periodTypeLabel(t, periodType),
          })}
        </p>
      )}
    </div>
  );
}
