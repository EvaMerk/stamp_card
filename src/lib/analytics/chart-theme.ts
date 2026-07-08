/**
 * Plotly-Farbvarianten für Light/Dark („Ticket & Tinte“).
 *
 * Plotly kann keine CSS-Variablen auflösen — diese Hex-/rgba-Werte sind die
 * Chart-Pendants der Design-Tokens in src/app/globals.css und MÜSSEN dort
 * synchron gehalten werden. Auswahl zur Laufzeit über usePrefersDark().
 */

export interface ChartTheme {
  /** Achsen-Ticks/Grundschrift (≈ --ink-faint). */
  tick: string;
  /** Gitterlinien (dezente Tinte/Weiß-Haarlinie). */
  grid: string;
  /** Kartengrenzen-Linien (etwas kräftiger als grid). */
  boundary: string;
  /** Ziellinie + „Ziel“-Label (≈ --accent-strong bzw. --accent). */
  target: string;
  /** Legenden-Text (≈ --ink-soft). */
  legend: string;
  /** Hover-Tooltip-Hintergrund (invertierte Tinte). */
  hoverBg: string;
  /** Hover-Tooltip-Text. */
  hoverText: string;
  /** Kontur um Marker (Sterne) — Papier-/Flächenfarbe. */
  markerLine: string;
}

const LIGHT: ChartTheme = {
  tick: "#a3977f",
  grid: "rgba(25, 21, 18, 0.08)",
  boundary: "rgba(25, 21, 18, 0.16)",
  target: "#b45708",
  legend: "#6b6152",
  hoverBg: "#191512",
  hoverText: "#faf3e7",
  markerLine: "#fffcf4",
};

const DARK: ChartTheme = {
  tick: "#8d8270",
  grid: "rgba(255, 255, 255, 0.08)",
  boundary: "rgba(255, 255, 255, 0.16)",
  target: "#ef9432",
  legend: "#b5a892",
  hoverBg: "#f2e8d8",
  hoverText: "#1d1915",
  markerLine: "#141210",
};

/** Passende Chart-Farbvariante zum aktiven Farbschema. */
export function chartTheme(dark: boolean): ChartTheme {
  return dark ? DARK : LIGHT;
}
