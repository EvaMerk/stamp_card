"use client";

import { addDays, addMonths, addYears, format, isValid, parseISO, subDays } from "date-fns";
import { de } from "date-fns/locale";
import { Input } from "@/components/ui/Input";
import { PERIOD_TYPE_LABELS, PERIOD_TYPES, type PeriodType } from "@/lib/goals/types";
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

function formatDate(date: Date): string {
  return format(date, "d. MMMM yyyy", { locale: de });
}

/**
 * Zeitraum-Auswahl: Segmented Control (Jahr/Monat/Woche/Eigener Zeitraum) +
 * Startdatum; Enddatum nur bei eigenem Zeitraum, sonst abgeleitete Anzeige.
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
  const start = parseISO(startDate);
  const derivedEnd = derivedEndDate(periodType, startDate);

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-stone-700">Zeitraum</span>

      <div
        className="grid grid-cols-2 gap-1 rounded-2xl bg-stone-100 p-1 sm:grid-cols-4"
        role="radiogroup"
        aria-label="Zeitraum-Typ"
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
                "rounded-xl px-3 py-2 text-sm font-medium transition",
                selected
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-stone-500 hover:text-stone-700",
              )}
            >
              {PERIOD_TYPE_LABELS[type]}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          type="date"
          label="Startdatum"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          error={startDateError}
        />
        {periodType === "custom" && (
          <Input
            type="date"
            label="Enddatum"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onEndDateChange(e.target.value)}
            error={endDateError}
          />
        )}
      </div>

      {periodType !== "custom" && derivedEnd && isValid(start) && (
        <p className="text-xs text-stone-500">
          Zeitraum: {formatDate(start)} – {formatDate(derivedEnd)} (
          {PERIOD_TYPE_LABELS[periodType]})
        </p>
      )}
    </div>
  );
}
