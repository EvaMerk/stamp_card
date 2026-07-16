"use client";

import { LANGS, type Lang } from "@/lib/i18n/constants";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

const SHORT: Record<Lang, string> = { de: "DE", en: "EN" };

/**
 * Kompakter DE/EN-Umschalter (Segmented Pill). Auf den Auth-Seiten sichtbar,
 * damit die Sprache schon vor dem Login wählbar ist. Nutzt denselben
 * LanguageProvider/localStorage-Schlüssel wie die Einstellungsseite.
 */
export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div
      className="inline-grid grid-cols-2 gap-0.5 rounded-full border border-hairline bg-surface p-0.5 shadow-sm"
      role="radiogroup"
      aria-label="Sprache / Language"
    >
      {LANGS.map((key) => {
        const selected = lang === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={key === "de" ? "Deutsch" : "English"}
            onClick={() => setLang(key)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition",
              selected
                ? "bg-accent text-accent-contrast shadow-sm"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {SHORT[key]}
          </button>
        );
      })}
    </div>
  );
}
