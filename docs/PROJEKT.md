# Stempelkarte — Punchcard-Ziel-Dashboard

Vollständige Projekt-Dokumentation. Zielgruppe: Entwickler und KI-Agenten, die ohne
Vorwissen an diesem Projekt weiterarbeiten. **Vor jeder Änderung lesen.**

---

## 1. Was ist diese App?

Ein persönliches Ziel-Tracking-Dashboard im Stil von Treuepunkte-/Stempelkarten
(deutsch, Ich-Perspektive der Nutzerin):

- Ein **Ziel** hat einen Titel (z.B. „Sport machen"), eine **Zielanzahl**
  (z.B. 100x), einen Zeitraum (Jahr/Monat/Woche/eigener) und eine
  **Kartengröße** (z.B. 10 Felder pro Karte → 10 Karten).
- Pro Karte kann optional eine **Belohnung** hinterlegt werden — entweder eine
  Standard-Belohnung für alle Karten (`goals.reward_text`) oder individuell pro
  Karte (`goal_card_rewards`, Override gewinnt; leer = Fallback auf Standard).
- Tippen auf das nächste freie Feld setzt einen **Stempel** mit einer
  CSS-3D-Animation (Stempel schwingt herab, Impact, Tintenring).
- **Horizontales Wischen** (oder Klick auf die ●-○-Punkte) auf einer Ziel-Kachel
  wechselt zur **Statistik**: Plotly-Chart (kumulative Linie, Ziellinie,
  Kartengrenzen, Frequenz-Balken) + Kartenübersicht mit Belohnungen.
- Dashboard-Tab **„Übersicht"**: ziel-übergreifendes Prozent-Chart aller Ziele
  mit Stern-Markern für volle Karten, Aktivitäts-Feed nach Tagen,
  Fortschrittsliste.
- Auth: E-Mail + Passwort über Supabase (Registrieren, Login, Passwort-Reset).

Die App läuft als Website und soll **später per Capacitor als iOS/Android-App**
in die App Stores (Phase 5, noch nicht umgesetzt).

Der ursprüngliche Implementierungsplan liegt (außerhalb des Repos) unter
`~/.claude/plans/playful-floating-biscuit.md`.

---

## 2. Unverhandelbare Architektur-Regeln

Diese Regeln existieren wegen der App-Store-/Capacitor-Anforderung. **Verstöße
brechen den statischen Export.** Jede Änderung muss beide Builds bestehen
(siehe §7).

1. **Keine Server Actions, keine Route Handlers (`app/api/...`) für
   Kernfunktionen.** Alle Supabase-Zugriffe laufen client-seitig über
   `src/lib/supabase/client.ts` (Browser-Client-Singleton). Grund: Der
   Capacitor-Build ist ein statischer Export ohne Node-Server.
2. **Keine dynamischen Routen-Segmente** (`[id]`). Detailseiten nutzen
   Query-Parameter: `/goal?id=...`, `/goal/edit?id=...`. `useSearchParams`
   immer in `<Suspense>` wrappen (Prerender-Anforderung).
3. **Plotly niemals statisch importieren.** Nur das Muster aus
   `src/components/analytics/StampHistoryChart.tsx` verwenden:
   `react-plotly.js/factory` + `plotly.js-basic-dist-min` (NICHT `plotly.js`!),
   geladen ausschließlich via `next/dynamic(() => import(...), { ssr: false })`
   und erst gemountet, wenn der Nutzer die Ansicht öffnet. Das Basic-Bundle
   kann nur `scatter`/`bar`/`pie` — keine anderen Trace-Typen verwenden.
4. **Animationen mit `motion` (Import aus `motion/react`)** — dem Nachfolger von
   framer-motion. Kein three.js/React-Three-Fiber einführen (Bundle-Größe).
5. **Punchcards werden berechnet, nie gespeichert.** Kartengrenzen, aktive
   Karte, freie Felder sind reine Funktionen aus `target_count`, `card_size`
   und der Stempelmenge — in SQL (`goal_progress`-View) und identisch in TS
   (`src/lib/goals/punchcard-math.ts`). Beide müssen synchron bleiben.
6. **Stamps sind append-only.** Kein UPDATE/DELETE auf `stamps` (weder Code
   noch RLS-Policy vorhanden). „Stempel zurücknehmen" wäre ein bewusstes
   Feature mit neuer, eng begrenzter Delete-Policy.
7. **UI ist zweisprachig (Deutsch/Englisch)**, Design: warmes Amber/Creme,
   runde Karten, verspielt. Sprachsystem gespiegelt vom Theme/Akzent-System:
   Standard = Gerätesprache (`navigator.language` „de*" → Deutsch, sonst
   Englisch), pro Gerät in `localStorage` (`stempelkarte-lang`) — kein
   Supabase-/DB-Zustand, umschaltbar schon vor dem Login (Umschalter im
   `(auth)/layout.tsx` und in den Einstellungen). Der blockierende Inline-Head-
   Script in `layout.tsx` löst die Sprache vor dem ersten Paint auf und setzt
   `<html lang>` (kein Flash). Kern: `src/lib/i18n/` (`constants.ts`,
   `messages.ts` mit typisierten `de`+`en`-Dicts inkl. Interpolation/Plural,
   `LanguageProvider.tsx` → `useTranslation()`/`useI18n()`, `date-locale.ts`).
   **Alle sichtbaren Strings über `t()`** — neue Texte IMMER in beide
   Wörterbücher, nie hartkodieren. Datums-/Chart-Beschriftungen folgen der
   Sprache (date-fns `de`/`enUS`, Plotly-Texte via `t`/`lang`). Marke
   „Stempelkarte" bleibt unübersetzt; Nutzerinhalte (Ziel-Titel,
   Belohnungstexte) werden NICHT übersetzt. Supabase-Auth-Fehler über
   `src/lib/supabase/auth-errors.ts` (liefert i18n-Schlüssel; `t` übergeben).
8. **Next.js 16**: Diese Version weicht von älterem Trainingswissen ab —
   vor API-Nutzung die Doku in `node_modules/next/dist/docs/` prüfen.
   Bekannt: `middleware.ts` ist als `proxy.ts` deprecated (funktioniert noch).

---

## 3. Tech-Stack

| Bereich | Technologie |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, `src/`-Verzeichnis, Alias `@/*`) |
| Sprache | TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first-Konfiguration in `globals.css`) |
| Backend | Supabase (Postgres + Auth + RLS), Projekt-Ref `vfhhetnxezsimuezxxwf` |
| Supabase-Client | `@supabase/supabase-js` + `@supabase/ssr` |
| Animation/Gesten | `motion` v12 (`import ... from "motion/react"`) |
| Charts | `react-plotly.js` + `plotly.js-basic-dist-min` (Factory-Pattern) |
| Formulare | `react-hook-form` + `zod` v4 (`@hookform/resolvers`) |
| Datum | `date-fns` v4, Locale je UI-Sprache (`de`/`enUS`, via `src/lib/i18n/date-locale.ts`) |
| i18n | eigenes leichtgewichtiges System (`src/lib/i18n/`, de/en, localStorage, keine Lib) |
| Utilities | `clsx` + `tailwind-merge` (via `cn()` in `src/lib/utils.ts`) |

Alle Abhängigkeiten sind bereits installiert — für die geplanten nächsten
Schritte (außer Capacitor, §9.3) muss nichts nachinstalliert werden.

---

## 4. Verzeichnisstruktur (Wegweiser)

```
supabase/
  migrations/0001_init.sql          # Tabellen, Checks, Indizes, RLS, updated_at-Trigger
  migrations/0002_goal_progress_view.sql  # goal_progress-View (security_invoker = on)
  setup.sql                         # Kombinierte Kopie beider Migrationen (für SQL-Editor)
src/
  middleware.ts                     # Supabase-Session-Refresh (nur Web; im Export-Build inaktiv)
  app/
    page.tsx                        # "/" → Redirect je nach Session (Client)
    (auth)/login|signup|forgot-password|reset-password/page.tsx
    dashboard/page.tsx              # Tabs "Ziele" | "Übersicht" (?tab=uebersicht)
    goals/new/page.tsx              # Ziel anlegen
    goal/page.tsx                   # Ziel-Detail  (?id=..., KEIN dynamisches Segment!)
    goal/edit/page.tsx              # Ziel bearbeiten (?id=...)
  components/
    auth/                           # LoginForm, SignupForm, LogoutButton, AuthGuard
    dashboard/                      # GoalList (Grid), GoalCard (Swipe-Container), EmptyState
    punchcard/                      # PunchCardGrid, PunchSlot, StampAnimation, RewardBadge
    analytics/                      # GoalAnalytics(+View), StampHistoryChart, CardOverviewList
    overview/                       # OverviewPanel, OverviewChart, ActivityFeed (Übersicht-Tab)
    goals/                          # GoalForm (Anlegen+Bearbeiten), PeriodPicker
    ui/                             # Button, Input(+Textarea), Modal, Spinner
  hooks/
    useAuth.ts                      # Session + onAuthStateChange
    useGoals.ts                     # Ziel-Liste + refetch
    useGoalStamps.ts                # Stamps eines Ziels; addStamp = optimistisch + Revert
  lib/
    supabase/client.ts              # getSupabaseClient() — DER Datenzugriffsweg
    supabase/server.ts              # nur für Server-Kontexte (Middleware); Kern-App nutzt ihn NICHT
    supabase/auth-errors.ts         # deutsche Übersetzung von Auth-Fehlercodes
    goals/punchcard-math.ts         # totalCards, activeCardIndex, slotsForCard, firstEmptySlot ...
    goals/queries.ts                # alle CRUD-/Lese-Funktionen (typisiert)
    goals/types.ts                  # Row-Typen, PERIOD_TYPE_LABELS
    analytics/chart-data.ts         # Plotly-Transformationen für EIN Ziel
    analytics/overview-data.ts      # Plotly-/Feed-Transformationen über ALLE Ziele
  types/supabase.ts                 # Handgeschriebene DB-Typen (regenerierbar, s. Kommentar dort)
.env.local                          # echte Supabase-Zugangsdaten (nicht committen)
.env.local.example                  # Platzhalter-Vorlage
.claude/launch.json                 # Preview-Server-Konfiguration (Name: "dev", Port 3000)
```

Muster, die überall gelten:
- Seiten sind Client Components, geschützte Seiten in `<AuthGuard>` gewrappt.
- Datenzugriff: Komponente/Hook → Funktion in `lib/goals/queries.ts` →
  `getSupabaseClient()`. Neue Queries dort ergänzen, nicht inline schreiben.
- Schwere Panels (Plotly) werden lazy gemountet (erst bei Aktivierung) und
  danach gemountet+versteckt gehalten.

---

## 5. Datenmodell

Tabellen (alle mit RLS, Owner-only über `(select auth.uid()) = user_id`):

- **`goals`**: `title`, `description`, `icon` (Emoji), `color` (Hex),
  `target_count` (>0), `card_size` (>0), `period_type`
  (`year|month|week|custom`), `start_date`, `end_date` (Pflicht bei `custom`),
  `reward_text` (Standard-Belohnung), `is_archived` (bisher ungenutzt),
  `created_at`/`updated_at` (Trigger).
- **`goal_card_rewards`**: `goal_id`, `card_index` (0-basiert!), `reward_text`.
  Unique `(goal_id, card_index)`. Override pro Karte; UI-Fallback ist
  `goals.reward_text`. Beim Bearbeiten ersetzt `updateGoal` alle Zeilen des Ziels.
- **`stamps`**: `goal_id`, `user_id` (denormalisiert für RLS), `card_index`,
  `slot_index` (beide 0-basiert), `stamped_at`. Unique
  `(goal_id, card_index, slot_index)` verhindert Doppelstempel. Append-only.
  Invariante: Felder werden sequenziell gefüllt (erst Feld n, dann n+1) —
  Testdaten müssen lückenlos sein.
- **View `goal_progress`** (`security_invoker = on`): `total_cards`,
  `total_stamps`, `active_card_index` (gedeckelt auf letzte Karte),
  `remaining_count`. Formeln müssen 1:1 zu `punchcard-math.ts` passen.

Wichtig: Die letzte Karte kann **kleiner** sein (100 Ziele / 7er-Karten →
15 Karten, letzte mit 2 Feldern). `slotsForCard()` behandelt das; jede neue
Logik muss diesen Fall mitdenken.

---

## 6. Setup & Umgebung

- `.env.local` braucht `NEXT_PUBLIC_SUPABASE_URL` und
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (aktuell bereits mit echten Werten des
  Projekts `vfhhetnxezsimuezxxwf` gefüllt). Fehlen sie, wirft
  `getSupabaseClient()` einen deutschen Konfigurationsfehler erst bei Nutzung.
- Migrationen: liegen in `supabase/migrations/`, sind im Live-Projekt bereits
  eingespielt. Neue Migration = neue nummerierte Datei + im Supabase-SQL-Editor
  ausführen (kein CLI-Link eingerichtet). `supabase/setup.sql` danach nicht
  vergessen zu aktualisieren (oder löschen, wenn CLI-Workflow eingerichtet wird).
- **Supabase-Dashboard-Zustand (Stand Juli 2026):** „Confirm email" ist
  AUSGESCHALTET (zum Testen). Vor echtem Launch wieder einschalten (§9.4).
- **Test-Konto** (Live-Daten, darf für Tests benutzt werden):
  `merkeva+e2e@gmx.de` / `E2E-Test-Passwort-42!` — enthält die Ziele
  „Sport machen" (100/10, blau) und „Lesen" (20/5, grün) mit Stempeln über
  mehrere Tage. Zweites, kaputtes Konto `merkeva+punchcardtest@gmx.de`
  (unbestätigt) kann im Dashboard gelöscht werden.
- Kein Git-Repo initialisiert (Stand Juli 2026). §9.1 zuerst erledigen!

---

## 7. Entwickeln, Bauen, Verifizieren

```bash
npm run dev                          # Dev-Server auf :3000 (oder Preview-Tool, Name "dev")
npx tsc --noEmit                     # Typprüfung — muss sauber sein
npm run build                        # normaler Build — muss durchlaufen
NEXT_OUTPUT_MODE=export npm run build  # statischer Export (Capacitor) — MUSS durchlaufen
```

**Definition of Done für jede Änderung:** alle drei Checks grün + manueller
Test im Browser mit dem Test-Konto. Typischer E2E-Pfad: Login → Dashboard →
Feld stempeln (Animation + Persistenz nach Reload prüfen) → Swipe/Punkt-Klick
zur Statistik (Chart rendert) → Tab „Übersicht" (Chart + Feed rendern).

Für UI-Tests ohne Live-Daten: temporäre Demo-Seite unter `src/app/dev-*/page.tsx`
mit Mock-Daten anlegen, visuell testen, **vor Abschluss löschen** und Builds
erneut laufen lassen (bewährtes Muster aus der Entwicklung).

Stolperfallen:
- Plotly-Chunk ist ~1,1 MB — taucht er im Initial-Bundle von Dashboard/Goal
  auf, ist Regel §2.3 verletzt (prüfbar: `out/`-HTML darf keinen
  Plotly-Verweis enthalten).
- `zod` ist v4, `date-fns` ist v4 — API-Unterschiede zu v3 beachten.
- GMX unterstützt keine Plus-Adressen — für neue Test-Konten trotzdem okay,
  solange „Confirm email" aus ist (Mails kommen nie an, stören aber nicht).

---

## 8. Was ist fertig? (Stand 6. Juli 2026)

| Bereich | Status |
|---|---|
| Auth (Login/Signup/Reset, deutsche Fehler) | ✅ live getestet |
| Ziel-CRUD inkl. Emoji/Farbe/Zeitraum/Live-Vorschau | ✅ live getestet |
| Belohnung pro Karte (Standard + Override im Edit-Formular) | ✅ live getestet |
| Punchcard + 3D-Stempel-Animation + RewardBadge | ✅ live getestet |
| Swipe → Statistik pro Ziel (Plotly + Kartenliste) | ✅ live getestet |
| Dashboard-Tab „Übersicht" (alle Ziele, %-Chart, Feed) | ✅ live getestet |
| Statischer Export-Build (Capacitor-Bereitschaft) | ✅ läuft durch |
| PWA installierbar (Manifest `src/app/manifest.ts`, Icons, iOS-Meta) | ✅ umgesetzt (Juli 2026) |
| Git-Repo, Deployment, Capacitor, E-Mail-Bestätigung an | ❌ offen → §9 |

---

## 9. Nächste Schritte (empfohlene Reihenfolge mit Einzelschritten)

### 9.1 Git-Repo initialisieren (zuerst! ~5 Min)
Sichert den Stand, bevor irgendetwas anderes passiert.
1. `git init` im Projekt-Root; prüfen, dass `.gitignore` `.env.local`,
   `node_modules/`, `.next/`, `out/` ausschließt (tut sie — `.env.local.example`
   ist per `!`-Regel erlaubt).
2. `git add -A && git commit` (Initial-Commit).
3. Optional: GitHub-Repo anlegen (`gh repo create`, privat) und pushen —
   Voraussetzung für 9.2.

### 9.2 Web-Deployment auf Vercel (~30 Min)
Damit die App am Handy nutzbar ist, bevor die Store-Version existiert.
1. GitHub-Repo verbinden (Vercel-Dashboard → New Project) oder `npx vercel`.
2. Env-Variablen in Vercel setzen: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Werte aus `.env.local`). **Kein**
   `NEXT_OUTPUT_MODE` setzen (normaler Build mit Middleware).
3. Nach dem ersten Deploy in Supabase (Authentication → URL Configuration):
   Site URL auf die Vercel-Domain setzen und die Domain zu den Redirect URLs
   hinzufügen (sonst zeigen Bestätigungs-/Reset-Links auf localhost).
4. E2E-Smoke-Test auf der Live-URL (Login, Stempeln, Statistik).

### 9.3 Phase 5: Capacitor / App Store (~1–2 Tage, braucht Xcode/Android Studio)
Erst sinnvoll, wenn 9.1/9.2 stehen und die Web-App stabil genutzt wird.
1. Pakete installieren: `@capacitor/core @capacitor/cli @capacitor/ios
   @capacitor/android @capacitor/app @capacitor/browser`.
2. `npx cap init` → `capacitor.config.ts` mit `webDir: 'out'`, App-ID
   (z.B. `de.evamerk.stempelkarte`) und Namen anlegen.
3. Audit: keine Server Actions / Route Handlers vorhanden (Stand heute: sauber);
   `NEXT_OUTPUT_MODE=export npm run build` erzeugt `out/`.
4. `npx cap add ios` / `npx cap add android`, dann `npx cap sync`.
5. Auth-Deep-Links: Custom-URL-Scheme oder Universal Links registrieren und in
   Supabase als Redirect URL eintragen; in der App `@capacitor/app`-Listener
   für den Rücksprung aus Bestätigungs-/Reset-Mails; Redirect-Ziele in
   SignupForm/forgot-password per `Capacitor.isNativePlatform()` verzweigen.
6. In Xcode/Android Studio öffnen (`npx cap open ios`), Icons/Splash setzen,
   auf Gerät testen (besonders: Stempel-Animation-Performance, Swipe-Gesten,
   Safe-Area-Insets oben/unten).
7. Store-Zeug: Apple Developer Account (99 €/Jahr), App-Store-Einträge,
   Datenschutzerklärung (Pflicht, da Nutzerkonten!).

### 9.4 Vor dem echten Launch (Checkliste)
1. Supabase: „Confirm email" wieder EINSCHALTEN (Authentication →
   Sign In/Providers → Abschnitt User Signups).
2. Eigenen SMTP-Absender konfigurieren (Supabase-Standard-Mailer ist auf
   ~2-4 Mails/Stunde limitiert und landet oft im Spam) — z.B. Resend/Postmark.
3. E-Mail-Templates auf Deutsch anpassen (Authentication → Emails).
4. Test-Konten löschen (Authentication → Users).
5. `src/types/supabase.ts` einmal regenerieren
   (`npx supabase gen types typescript --project-id vfhhetnxezsimuezxxwf`)
   und mit den handgeschriebenen Typen abgleichen.

### 9.5 Sinnvolle Feature-Ideen (Backlog, jeweils klein & unabhängig)
- **Belohnung inline editieren**: Stift-Icon an jeder Zeile der
  Kartenübersicht (CardOverviewList) → kleines Inline-Feld → upsert in
  `goal_card_rewards`. (Vom User bereits als „vielleicht" angedacht.)
- **Stempel rückgängig** (letzter Stempel, kurzes Zeitfenster): braucht neue
  RLS-Delete-Policy (eng: nur eigener, jüngster Stempel) + neue Migration —
  bewusste Ausnahme von Regel §2.6, als solche dokumentieren.
- **Ziele archivieren**: `is_archived` existiert bereits in der DB; UI-Toggle
  im Edit-Formular + Filter in `getGoals` + Bereich „Archiviert" im Dashboard.
- **Zeitraum-Ende-Verhalten**: aktuell ist der Zeitraum rein informativ;
  Erinnerung/Reset/„geschafft?"-Auswertung am Periodenende wäre ein
  natürliches nächstes Produkt-Feature.

---

## 10. Arbeitsweise für KI-Agenten (Kurzfassung)

1. Diese Datei + `AGENTS.md` lesen. Bei Next.js-Fragen:
   `node_modules/next/dist/docs/`.
2. Vor dem Coden die betroffenen Bestandsdateien lesen und deren Muster
   übernehmen (Queries in `queries.ts`, Plotly nur per Factory+dynamic,
   deutsche UI-Texte, `cn()` für Klassen).
3. Nichts an `stamps` mutieren, keine Server-Endpoints einführen, keine
   dynamischen Routen-Segmente anlegen.
4. Nach jeder Änderung: `npx tsc --noEmit`, beide Builds, Browser-Test mit dem
   Test-Konto (§6/§7).
5. Temporäre Test-Seiten (`dev-*`) und Scratch-Dateien vor Abschluss entfernen.
