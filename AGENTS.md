<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Projekt: Stempelkarte (Punchcard-Ziel-Dashboard)

**Lies zuerst `docs/PROJEKT.md`** — vollständige Doku: Architektur, Datenmodell,
Setup, Test-Konto, Roadmap mit Einzelschritten. Hier nur die harten Regeln:

1. **Kein Server-Code für Kernfunktionen**: keine Server Actions, keine Route
   Handlers. Alle Daten client-seitig über `src/lib/supabase/client.ts`
   (Funktionen in `src/lib/goals/queries.ts` ergänzen, nicht inline).
   Grund: statischer Export für Capacitor/App Store.
2. **Keine dynamischen Routen-Segmente** (`[id]`) — Query-Params nutzen
   (`/goal?id=...`); `useSearchParams` in `<Suspense>`.
3. **Plotly nur** per `react-plotly.js/factory` + `plotly.js-basic-dist-min`
   über `next/dynamic({ ssr: false })`, lazy gemountet (Vorbild:
   `src/components/analytics/StampHistoryChart.tsx`). Niemals statisch
   importieren, niemals das volle `plotly.js`.
4. **Animationen**: `motion` (Import aus `motion/react`); kein three.js.
5. **`stamps` ist append-only** (kein Update/Delete); Punchcards werden aus
   `target_count`/`card_size`/Stempelzahl **berechnet**
   (`src/lib/goals/punchcard-math.ts`, muss synchron zur SQL-View
   `goal_progress` bleiben) — nie als eigene Entität speichern.
6. **UI auf Deutsch**, Amber/Creme-Design; Auth-Fehler über
   `src/lib/supabase/auth-errors.ts` übersetzen.
7. **Definition of Done**: `npx tsc --noEmit`, `npm run build` **und**
   `NEXT_OUTPUT_MODE=export npm run build` sauber + Browser-Test mit dem
   Test-Konto (siehe `docs/PROJEKT.md` §6). Temporäre `dev-*`-Testseiten vor
   Abschluss löschen.
