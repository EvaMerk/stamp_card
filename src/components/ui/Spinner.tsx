"use client";

import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function Spinner({ label }: { label?: string }) {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-12"
      role="status"
      aria-live="polite"
    >
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-accent/25 border-t-accent" />
      <span className="text-sm text-ink-faint">{label ?? t("common.loading")}</span>
    </div>
  );
}
