"use client";

import Link from "next/link";
import { ArrowLeft, Check } from "@phosphor-icons/react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ACCENTS } from "@/lib/theme/accents";
import { useTheme } from "@/lib/theme/ThemeProvider";
import type { ThemeMode } from "@/lib/theme/constants";
import { LANGS, type Lang } from "@/lib/i18n/constants";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { MessageKey } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

const MODES: { key: ThemeMode; labelKey: MessageKey }[] = [
  { key: "system", labelKey: "settings.mode.system" },
  { key: "light", labelKey: "settings.mode.light" },
  { key: "dark", labelKey: "settings.mode.dark" },
];

/** Akzent-Schlüssel → i18n-Label (übersetzte Farbnamen). */
const ACCENT_LABEL_KEYS: Record<string, MessageKey> = {
  amber: "accent.amber",
  coral: "accent.coral",
  pink: "accent.pink",
  violet: "accent.violet",
  blau: "accent.blau",
  tuerkis: "accent.tuerkis",
  gruen: "accent.gruen",
};

const LANG_LABEL_KEYS: Record<Lang, MessageKey> = {
  de: "settings.lang.de",
  en: "settings.lang.en",
};

function SettingsContent() {
  const { mode, setMode, accent, setAccent } = useTheme();
  const { t, lang, setLang } = useI18n();

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-8">
      {/* Akzent-Aura hinter dem Header (dekorativ) */}
      <span
        className="aura absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2"
        aria-hidden="true"
      />

      <header className="relative mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-accent-strong"
        >
          <ArrowLeft size={16} weight="bold" />
          {t("settings.backToDashboard")}
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink">
          {t("settings.title")}
        </h1>
        <p className="mt-1 text-sm text-ink-faint">{t("settings.deviceHint")}</p>
      </header>

      <main className="relative flex flex-col gap-8">
        {/* ── Sprache / Language ─────────────────────────────────────────── */}
        <section className="rounded-3xl border border-hairline bg-surface p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-ink">
            {t("settings.language")}
          </h2>
          <p className="mt-1 mb-4 text-sm text-ink-soft">
            {t("settings.languageHint")}
          </p>

          <div
            className="grid grid-cols-2 gap-1 rounded-full bg-sunken p-1"
            role="radiogroup"
            aria-label={t("settings.language")}
          >
            {LANGS.map((key) => {
              const selected = lang === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setLang(key)}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition",
                    selected
                      ? "bg-surface text-accent-strong shadow-sm"
                      : "text-ink-soft hover:text-ink",
                  )}
                >
                  {t(LANG_LABEL_KEYS[key])}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Design / Theme-Modus ──────────────────────────────────────── */}
        <section className="rounded-3xl border border-hairline bg-surface p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-ink">
            {t("settings.design")}
          </h2>
          <p className="mt-1 mb-4 text-sm text-ink-soft">
            {t("settings.designHint")}
          </p>

          <div
            className="grid grid-cols-3 gap-1 rounded-full bg-sunken p-1"
            role="radiogroup"
            aria-label={t("settings.themeMode")}
          >
            {MODES.map(({ key, labelKey }) => {
              const selected = mode === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setMode(key)}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition",
                    selected
                      ? "bg-surface text-accent-strong shadow-sm"
                      : "text-ink-soft hover:text-ink",
                  )}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Akzentfarbe ───────────────────────────────────────────────── */}
        <section className="rounded-3xl border border-hairline bg-surface p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-ink">
            {t("settings.accent")}
          </h2>
          <p className="mt-1 mb-4 text-sm text-ink-soft">
            {t("settings.accentHint")}
          </p>

          <div
            className="grid grid-cols-4 gap-3 sm:grid-cols-7"
            role="radiogroup"
            aria-label={t("settings.accent")}
          >
            {ACCENTS.map(({ key, swatch }) => {
              const selected = accent === key;
              const label = t(ACCENT_LABEL_KEYS[key]);
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={label}
                  title={label}
                  onClick={() => setAccent(key)}
                  className={cn(
                    "relative mx-auto flex h-11 w-11 items-center justify-center rounded-full shadow-sm transition active:scale-95",
                    "ring-offset-2 ring-offset-surface",
                    selected
                      ? "ring-2 ring-ink"
                      : "ring-1 ring-hairline hover:ring-ink-faint",
                  )}
                  style={{ backgroundColor: swatch }}
                >
                  {selected && (
                    <Check size={20} weight="bold" className="text-white" />
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function EinstellungenPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
