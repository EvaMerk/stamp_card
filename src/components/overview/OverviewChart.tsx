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
 * Prozent statt absoluter Stempel auf der y-Achse, damit unterschiedlich
 * große Ziele (100x Sport vs. 20x Lesen) auf einer Achse vergleichbar sind.
 */

import Plotly from "plotly.js-basic-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";
import type { Config, Data, Layout } from "plotly.js";
import { format, parseISO } from "date-fns";
import type {
  CardCompletion,
  GoalPercentSeries,
} from "@/lib/analytics/overview-data";
import type { Goal } from "@/lib/goals/types";

const Plot = createPlotlyComponent(Plotly);

const STONE_400 = "#a8a29e";
const STONE_100 = "#f5f5f4";
const AMBER_600 = "#d97706";
const FONT_STACK = "ui-sans-serif, system-ui, -apple-system, sans-serif";
const FALLBACK_COLOR = "#f59e0b";

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
  const seriesByGoal = new Map(series.map((s) => [s.goalId, s]));

  // Legende = Ziel-Symbol + Titel; Linien in der jeweiligen Zielfarbe.
  const lineTraces: Data[] = goals.flatMap((goal) => {
    const goalSeries = seriesByGoal.get(goal.id);
    if (!goalSeries || goalSeries.x.length === 0) return [];
    const color = goal.color ?? FALLBACK_COLOR;
    return [
      {
        type: "scatter",
        mode: "lines+markers",
        name: `${goal.icon ?? "🎯"} ${goal.title}`,
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
        name: `${goal.icon ?? "🎯"} ${goal.title}`,
        showlegend: false,
        x: goalCompletions.map((c) => c.completedAt),
        y: goalCompletions.map((c) => c.percent),
        marker: {
          symbol: "star",
          size: 13,
          color,
          line: { color: "#ffffff", width: 1 },
        },
        hovertext: goalCompletions.map(
          (c) =>
            `Karte ${c.cardNumber} voll · ${format(
              parseISO(c.completedAt),
              "dd.MM.yyyy",
            )}`,
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
      font: { family: FONT_STACK, size: 11, color: "#57534e" },
    },
    dragmode: false,
    font: { family: FONT_STACK, size: 11, color: STONE_400 },
    // Numerisches Datumsformat statt (englischer) Monatsnamen — das Basic-
    // Bundle enthält keine deutsche Plotly-Locale.
    xaxis: {
      type: "date",
      tickformat: "%d.%m.%y",
      tickfont: { size: 10, color: STONE_400 },
      showgrid: false,
      zeroline: false,
      fixedrange: true,
    },
    yaxis: {
      range: [0, 112],
      ticksuffix: " %",
      gridcolor: STONE_100,
      zeroline: false,
      tickfont: { size: 10, color: STONE_400 },
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
        line: { color: AMBER_600, width: 1.5, dash: "dash" },
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
        text: "Ziel",
        showarrow: false,
        font: { size: 10, color: AMBER_600 },
      },
    ],
    hoverlabel: {
      bgcolor: "#292524",
      bordercolor: "#292524",
      font: { family: FONT_STACK, size: 11, color: "#fafaf9" },
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
