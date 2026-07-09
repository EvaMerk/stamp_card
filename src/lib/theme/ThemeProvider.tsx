"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_ACCENT, type AccentKey, isAccentKey } from "./accents";
import {
  ACCENT_STORAGE_KEY,
  DEFAULT_MODE,
  MODE_STORAGE_KEY,
  type ResolvedTheme,
  type ThemeMode,
  readStoredAccent,
  readStoredMode,
  resolveTheme,
  systemPrefersDark,
} from "./constants";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  accent: AccentKey;
  setAccent: (accent: AccentKey) => void;
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Setzt data-theme (aufgelöst) + data-accent am <html>. */
function applyToDocument(resolved: ResolvedTheme, accent: AccentKey) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.accent = accent;
}

/**
 * Hält Theme-Modus + Akzentfarbe (pro Gerät, localStorage) und spiegelt sie
 * live auf <html data-theme>/<html data-accent>.
 *
 * Der blockierende Inline-Head-Script in layout.tsx setzt beide Attribute
 * bereits VOR dem ersten Paint (kein Flash) — dieser Provider liest denselben
 * Zustand nach, hält ihn synchron und reagiert auf Änderungen (UI-Auswahl
 * sowie, im Modus "system", auf OS-Umschaltungen via matchMedia).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE);
  const [accent, setAccentState] = useState<AccentKey>(DEFAULT_ACCENT);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  // Beim Mounten: gespeicherte Werte übernehmen (Inline-Script hat das DOM
  // bereits gesetzt — hier wird nur der React-State angeglichen).
  useEffect(() => {
    const storedMode = readStoredMode();
    const storedAccentRaw = readStoredAccent();
    const storedAccent = isAccentKey(storedAccentRaw)
      ? storedAccentRaw
      : DEFAULT_ACCENT;
    const resolved = resolveTheme(storedMode);
    setModeState(storedMode);
    setAccentState(storedAccent);
    setResolvedTheme(resolved);
    applyToDocument(resolved, storedAccent);
  }, []);

  // Im Modus "system": OS-Umschaltungen live nachziehen.
  useEffect(() => {
    if (mode !== "system") return;
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const resolved: ResolvedTheme = systemPrefersDark() ? "dark" : "light";
      setResolvedTheme(resolved);
      applyToDocument(resolved, accent);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode, accent]);

  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeState(next);
      const resolved = resolveTheme(next);
      setResolvedTheme(resolved);
      applyToDocument(resolved, accent);
      try {
        window.localStorage.setItem(MODE_STORAGE_KEY, next);
      } catch {
        /* Speichern optional; UI bleibt trotzdem korrekt. */
      }
    },
    [accent],
  );

  const setAccent = useCallback(
    (next: AccentKey) => {
      setAccentState(next);
      applyToDocument(resolvedTheme, next);
      try {
        window.localStorage.setItem(ACCENT_STORAGE_KEY, next);
      } catch {
        /* Speichern optional. */
      }
    },
    [resolvedTheme],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, setMode, accent, setAccent, resolvedTheme }),
    [mode, setMode, accent, setAccent, resolvedTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** Zugriff auf Theme-Modus, Akzent und aufgelöstes Theme. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme muss innerhalb von <ThemeProvider> genutzt werden.");
  }
  return ctx;
}
