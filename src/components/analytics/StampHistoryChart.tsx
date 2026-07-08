"use client";

/**
 * Plotly-Chart der Stempel-Historie eines Ziels.
 *
 * WICHTIG (Bundle): nutzt `react-plotly.js/factory` mit
 * `plotly.js-basic-dist-min` (~1 MB statt >3 MB volles Plotly) und wird von
 * GoalAnalytics ausschließlich via `next/dynamic(..., { ssr: false })`
 * geladen. Plotly landet dadurch weder im Server-Bundle noch im initialen
 * Routen-Chunk — kompatibel mit `output: 'export'` (Capacitor).
 *
 * Theme: Plotly kann keine CSS-Variablen lesen — usePrefersDark() wählt die
 * Light-/Dark-Farbvariante aus chart-theme.ts und rendert bei Theme-Wechsel
 * neu (Hintergründe bleiben transparent, die Seite scheint durch).
 *
 * Aufbau (ein Plot, zwei y-Achsen-Zeilen mit gemeinsamer Zeitachse):
 * - oben (~2/3): kumulative Fortschritts-Treppenlinie in Zielfarbe,
 *   gestrichelte Ziellinie („Ziel") + gepunktete Kartengrenzen als Shapes
 * - unten (~1/4): Balken der Stempel-Frequenz pro Woche/Monat
 * `dragmode: false`, damit Plotly weder den Karten-Swipe noch das vertikale
 * Scrollen auf Touch-Geräten schluckt.
 */

import Plotly from "plotly.js-basic-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";
import type { Config, Data, Layout } from "plotly.js";
import { usePrefersDark } from "@/hooks/usePrefersDark";
import { chartTheme } from "@/lib/analytics/chart-theme";
import type { StampChartData } from "@/lib/analytics/chart-data";

const Plot = createPlotlyComponent(Plotly);

const FONT_STACK = "ui-sans-serif, system-ui, -apple-system, sans-serif";

export interface StampHistoryChartProps {
  data: StampChartData;
  /** Zielfarbe (Hex) für Linie und Balken. */
  color: string;
  /** Gesamthöhe des Charts in px. */
  height?: number;
}

export default function StampHistoryChart({
  data,
  color,
  height = 240,
}: StampHistoryChartProps) {
  const theme = chartTheme(usePrefersDark());
  const { cumulative, target, cardBoundaries, frequency } = data;
  const maxY = Math.max(target, cumulative.y[cumulative.y.length - 1] ?? 0);

  const traces: Data[] = [
    {
      type: "scatter",
      mode: "lines+markers",
      x: cumulative.x,
      y: cumulative.y,
      line: { color, width: 2.5, shape: "hv" },
      marker: { color, size: 5 },
      hovertemplate: "%{x|%d.%m.%Y}<br>%{y}. Stempel<extra></extra>",
    },
    {
      type: "bar",
      x: frequency.x,
      y: frequency.y,
      width: frequency.widths,
      yaxis: "y2",
      marker: { color: `${color}66` },
      hovertext: frequency.labels,
      hovertemplate: "%{hovertext}<br>%{y} Stempel<extra></extra>",
    },
  ];

  const layout: Partial<Layout> = {
    autosize: true,
    margin: { l: 34, r: 8, t: 10, b: 26 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    showlegend: false,
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
    },
    yaxis: {
      domain: [0.34, 1],
      range: [0, maxY * 1.12],
      gridcolor: theme.grid,
      zeroline: false,
      tickfont: { size: 10, color: theme.tick },
      fixedrange: true,
    },
    yaxis2: {
      domain: [0, 0.24],
      rangemode: "tozero",
      showgrid: false,
      zeroline: false,
      nticks: 3,
      tickfont: { size: 9, color: theme.tick },
      fixedrange: true,
    },
    shapes: [
      ...cardBoundaries.map((y) => ({
        type: "line" as const,
        xref: "paper" as const,
        x0: 0,
        x1: 1,
        yref: "y" as const,
        y0: y,
        y1: y,
        line: { color: theme.boundary, width: 1, dash: "dot" as const },
      })),
      {
        type: "line",
        xref: "paper",
        x0: 0,
        x1: 1,
        yref: "y",
        y0: target,
        y1: target,
        line: { color: theme.target, width: 1.5, dash: "dash" },
      },
    ],
    annotations: [
      {
        xref: "paper",
        x: 0.995,
        xanchor: "right",
        yref: "y",
        y: target,
        yanchor: "bottom",
        text: "Ziel",
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
      data={traces}
      layout={layout}
      config={config}
      useResizeHandler
      style={{ width: "100%", height }}
    />
  );
}
