"use client";

import { SealCheck } from "@phosphor-icons/react";
import { LanguageSwitcher } from "@/components/settings/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { t } = useTranslation();

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* Orange-Aura hinter dem Logo/der Karte (rein dekorativ) */}
      <span
        className="aura absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2"
        aria-hidden="true"
      />

      {/* Sprach-Umschalter: schon vor dem Login sichtbar. */}
      <div className="absolute right-4 top-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="relative mb-8 flex flex-col items-center gap-3">
        <span
          className="flex h-16 w-16 rotate-[-6deg] items-center justify-center rounded-full bg-accent text-accent-contrast shadow-card"
          aria-hidden="true"
        >
          <SealCheck size={34} weight="fill" />
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          {t("brand.name")}
        </h1>
        <p className="text-sm text-ink-soft">{t("brand.tagline")}</p>
      </div>

      <div className="relative w-full max-w-md overflow-hidden rounded-[20px] border border-hairline bg-surface p-8 shadow-card">
        <span
          className="aura absolute -right-12 -top-12 h-40 w-40"
          aria-hidden="true"
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
