"use client";

/**
 * Plotly-Chart der Dashboard-Übersicht: eine kumulative Prozent-Linie pro
 * Ziel (0–100 %), Karten-Abschlüsse als Stern-Marker auf den Linien,
 * gestrichelte 100-%-Linie („Ziel").
 *
 * WICHTIG (Bundle): wie StampHistoryChart via `react-plotly.js/factory` mit
 * `plotly.js-basic-dist-min` gebaut und vom OverviewPanel ausschließlich per
 * `next/dynamic(..., { ssr: false })` geladen — Plotly landet weder im
 * Server-Bundle noch im initialen Routen-Chunk (Export-/Capacitor-kompatibel).
 *
 * Theme: usePrefersDark() wählt die Light-/Dark-Farbvariante aus
 * chart-theme.ts (Plotly kann keine CSS-Variablen lesen).
 *
 * Prozent statt absoluter Stempel auf der y-Achse, damit unterschiedlich
 * große Ziele (100x Sport vs. 20x Lesen) auf einer Achse vergleichbar sind.
 * Legende = nur der Titel (Plain-Text — Phosphor-Icon-Namen aus goals.icon
 * werden hier bewusst NICHT angezeigt).
 */

import Plotly from "plotly.js-basic-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";
import type { Config, Data, Layout } from "plotly.js";
import { format, parseISO } from "date-fns";
import { usePrefersDark } from "@/hooks/usePrefersDark";
import { chartTheme } from "@/lib/analytics/chart-theme";
import type {
  CardCompletion,
  GoalPercentSeries,
} from "@/lib/analytics/overview-data";
import type { Goal } from "@/lib/goals/types";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { dateLocale } from "@/lib/i18n/date-locale";

const Plot = createPlotlyComponent(Plotly);

const FONT_STACK = "ui-sans-serif, system-ui, -apple-system, sans-serif";
const FALLBACK_COLOR = "#e07316"; // --accent (Light)

export interface OverviewChartProps {
  goals: Goal[];
  /** Eine Prozent-Serie pro Ziel (gleiche Reihenfolge wie `goals`). */
  series: GoalPercentSeries[];
  /** Karten-Abschlüsse aller Ziele (Stern-Marker). */
  completions: CardCompletion[];
  /** Gesamthöhe des Charts in px. */
  height?: number;
}

export default function OverviewChart({
  goals,
  series,
  completions,
  height = 300,
}: OverviewChartProps) {
  const { t, lang } = useTranslation();
  const theme = chartTheme(usePrefersDark());
  const seriesByGoal = new Map(series.map((s) => [s.goalId, s]));

  // Legende = Ziel-Titel; Linien in der jeweiligen Zielfarbe.
  const lineTraces: Data[] = goals.flatMap((goal) => {
    const goalSeries = seriesByGoal.get(goal.id);
    if (!goalSeries || goalSeries.x.length === 0) return [];
    const color = goal.color ?? FALLBACK_COLOR;
    return [
      {
        type: "scatter",
        mode: "lines+markers",
        name: goal.title,
        x: goalSeries.x,
        y: goalSeries.y,
        line: { color, width: 2.5, shape: "hv" },
        marker: { color, size: 4 },
        hovertemplate:
          "%{x|%d.%m.%Y} · %{y:.0f} %<extra>%{fullData.name}</extra>",
      } satisfies Data,
    ];
  });

  // Karten-Abschlüsse als Stern-Marker auf den Linien (ohne eigene
  // Legenden-Einträge — die Farbe ordnet sie dem Ziel zu).
  const completionTraces: Data[] = goals.flatMap((goal) => {
    const goalCompletions = completions.filter((c) => c.goalId === goal.id);
    if (goalCompletions.length === 0) return [];
    const color = goal.color ?? FALLBACK_COLOR;
    return [
      {
        type: "scatter",
        mode: "markers",
        name: goal.title,
        showlegend: false,
        x: goalCompletions.map((c) => c.completedAt),
        y: goalCompletions.map((c) => c.percent),
        marker: {
          symbol: "star",
          size: 13,
          color,
          line: { color: theme.markerLine, width: 1 },
        },
        hovertext: goalCompletions.map((c) =>
          t("chart.cardFull", {
            n: c.cardNumber,
            date: format(parseISO(c.completedAt), "dd.MM.yyyy", {
              locale: dateLocale(lang),
            }),
          }),
        ),
        hovertemplate: "%{hovertext}<extra>%{fullData.name}</extra>",
      } satisfies Data,
    ];
  });

  const layout: Partial<Layout> = {
    autosize: true,
    margin: { l: 40, r: 8, t: 10, b: 26 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    showlegend: true,
    legend: {
      orientation: "h",
      x: 0,
      y: -0.22,
      yanchor: "top",
      font: { family: FONT_STACK, size: 11, color: theme.legend },
    },
    dragmode: false,
    font: { family: FONT_STACK, size: 11, color: theme.tick },
    // Numerisches Datumsformat statt (englischer) Monatsnamen — das Basic-
    // Bundle enthält keine deutsche Plotly-Locale.
    xaxis: {
      type: "date",
      tickformat: "%d.%m.%y",
      tickfont: { size: 10, color: theme.tick },
      showgrid: false,
      zeroline: false,
      fixedrange: true,
    },
    yaxis: {
      range: [0, 112],
      ticksuffix: " %",
      gridcolor: theme.grid,
      zeroline: false,
      tickfont: { size: 10, color: theme.tick },
      fixedrange: true,
    },
    shapes: [
      {
        type: "line",
        xref: "paper",
        x0: 0,
        x1: 1,
        yref: "y",
        y0: 100,
        y1: 100,
        line: { color: theme.target, width: 1.5, dash: "dash" },
      },
    ],
    annotations: [
      {
        xref: "paper",
        x: 0.995,
        xanchor: "right",
        yref: "y",
        y: 100,
        yanchor: "bottom",
        text: t("chart.target"),
        showarrow: false,
        font: { size: 10, color: theme.target },
      },
    ],
    hoverlabel: {
      bgcolor: theme.hoverBg,
      bordercolor: theme.hoverBg,
      font: { family: FONT_STACK, size: 11, color: theme.hoverText },
    },
  };

  const config: Partial<Config> = {
    displayModeBar: false,
    responsive: true,
    doubleClick: false,
    showTips: false,
  };

  return (
    <Plot
      data={[...lineTraces, ...completionTraces]}
      layout={layout}
      config={config}
      useResizeHandler
      style={{ width: "100%", height }}
    />
  );
}
