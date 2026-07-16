"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  LANG_STORAGE_KEY,
  type Lang,
  resolveLang,
} from "./constants";
import { MESSAGES, type MessageKey, type Messages } from "./messages";

/**
 * Parameter-Typ eines Schlüssels: bei Funktions-Werten deren Parameter, sonst
 * `void` (keine Parameter erlaubt).
 */
type ParamsOf<K extends MessageKey> = Messages[K] extends (arg: infer A) => string
  ? A
  : void;

/**
 * Übersetzungsfunktion mit typisierten Parametern:
 * - String-Schlüssel: `t("common.save")`
 * - interpolierte Schlüssel: `t("goal.detailProgress", { done, total, … })`
 * Fehlende Parameter oder ein falscher Parametertyp sind TypeScript-Fehler.
 */
export interface TranslateFn {
  <K extends MessageKey>(
    key: K,
    ...args: ParamsOf<K> extends void ? [] : [params: ParamsOf<K>]
  ): string;
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TranslateFn;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function makeTranslate(lang: Lang): TranslateFn {
  const dict = MESSAGES[lang];
  return ((key, params?) => {
    const entry = dict[key];
    if (typeof entry === "function") {
      // Funktionswert → interpolieren. Params sind über TranslateFn typsicher.
      return (entry as (p: unknown) => string)(params);
    }
    return entry as string;
  }) as TranslateFn;
}

/**
 * Hält die UI-Sprache (pro Gerät, localStorage) und stellt `t` bereit.
 *
 * Der blockierende Inline-Head-Script in layout.tsx setzt `document.
 * documentElement.lang` bereits VOR dem ersten Paint (kein Flash) — dieser
 * Provider liest denselben Zustand nach, hält ihn synchron und re-rendert bei
 * Änderung. Vorbild: ThemeProvider.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Erstwert deterministisch (DEFAULT_LANG via resolveLang bei SSR/Export) —
  // beim Mounten wird die echte Geräte-/gespeicherte Sprache übernommen.
  const [lang, setLangState] = useState<Lang>("de");

  useEffect(() => {
    const resolved = resolveLang();
    setLangState(resolved);
    if (typeof document !== "undefined") {
      document.documentElement.lang = resolved;
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
    }
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      /* Speichern optional; UI bleibt trotzdem korrekt. */
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t: makeTranslate(lang) }),
    [lang, setLang],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

/** Zugriff auf aktive Sprache, Umschalter und Übersetzungsfunktion. */
export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useI18n muss innerhalb von <LanguageProvider> genutzt werden.");
  }
  return ctx;
}

/** Kurzform: nur `t` und `lang`. */
export function useTranslation(): { t: TranslateFn; lang: Lang } {
  const { t, lang } = useI18n();
  return { t, lang };
}
