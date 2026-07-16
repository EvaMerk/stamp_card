/**
 * Übersetzungs-Wörterbücher (de + en) für die gesamte UI.
 *
 * Struktur: FLACHE, punkt-getrennte Schlüssel (z.B. "goal.progress"). Der
 * deutsche Datensatz `de` ist die QUELLE der Wahrheit — sein Typ `Messages`
 * erzwingt, dass `en` exakt dieselben Schlüssel hat (fehlende/zusätzliche
 * Schlüssel = TypeScript-Fehler).
 *
 * Werte sind entweder Strings oder — für interpolierte Texte — Funktionen, die
 * benannte Parameter erhalten (z.B. t("goal.progress", { done, total })).
 * Kleine Plural-Fälle direkt in der Funktion abbilden (z.B. Stempel/stamp).
 *
 * REGEL: Neue UI-Strings IMMER hier in BEIDE Wörterbücher eintragen und über
 * t() verwenden — niemals hartkodieren. Marken-/Eigenname „Stempelkarte“
 * bleibt in beiden Sprachen unübersetzt.
 */

/** Deutsches Wörterbuch = Quelle der Wahrheit für Schlüssel + Signaturen. */
export const de = {
  // ── Marke / gemeinsam ────────────────────────────────────────────────
  "brand.name": "Stempelkarte",
  "brand.tagline": "Deine Ziele, Stempel für Stempel.",
  "common.back": "Zurück",
  "common.cancel": "Abbrechen",
  "common.save": "Speichern",
  "common.saving": "Wird gespeichert …",
  "common.loading": "Lädt …",
  "common.notLoggedIn": "Du bist nicht angemeldet.",

  // ── Auth ─────────────────────────────────────────────────────────────
  "auth.email": "E-Mail",
  "auth.emailPlaceholder": "du@beispiel.de",
  "auth.password": "Passwort",
  "auth.passwordPlaceholder": "••••••••",
  "auth.login.heading": "Willkommen zurück!",
  "auth.login.submit": "Anmelden",
  "auth.login.submitting": "Wird angemeldet …",
  "auth.login.failed": "Anmeldung fehlgeschlagen.",
  "auth.login.forgot": "Passwort vergessen?",
  "auth.login.noAccount": "Noch kein Konto?",
  "auth.login.signupLink": "Jetzt registrieren",
  "auth.login.title": "Anmelden — Stempelkarte",

  "auth.signup.heading": "Konto erstellen",
  "auth.signup.passwordPlaceholder": "Mindestens 8 Zeichen",
  "auth.signup.submit": "Registrieren",
  "auth.signup.submitting": "Wird registriert …",
  "auth.signup.failed": "Registrierung fehlgeschlagen.",
  "auth.signup.hasAccount": "Schon ein Konto?",
  "auth.signup.loginLink": "Anmelden",
  "auth.signup.sentHeading": "Fast geschafft!",
  "auth.signup.sentBody": (p: { email: string }) =>
    `Wir haben dir eine E-Mail an ${p.email} geschickt. Bitte bestätige deine Adresse über den Link in der E-Mail, um dein Konto zu aktivieren.`,
  "auth.signup.toLogin": "Zur Anmeldung",
  "auth.signup.title": "Registrieren — Stempelkarte",

  "auth.passwordTooShort": "Das Passwort muss mindestens 8 Zeichen lang sein.",

  "auth.forgot.heading": "Passwort vergessen?",
  "auth.forgot.subtitle": "Kein Problem! Wir schicken dir einen Link zum Zurücksetzen.",
  "auth.forgot.submit": "Link senden",
  "auth.forgot.submitting": "Wird gesendet …",
  "auth.forgot.failed": "E-Mail konnte nicht gesendet werden.",
  "auth.forgot.backToLogin": "Zurück zur Anmeldung",
  "auth.forgot.sentHeading": "E-Mail unterwegs!",
  "auth.forgot.sentBody": (p: { email: string }) =>
    `Falls ein Konto für ${p.email} existiert, haben wir dir einen Link zum Zurücksetzen deines Passworts geschickt.`,

  "auth.reset.checking": "Link wird geprüft …",
  "auth.reset.invalidHeading": "Link ungültig oder abgelaufen",
  "auth.reset.invalidBody":
    "Bitte fordere einen neuen Link zum Zurücksetzen deines Passworts an.",
  "auth.reset.requestNew": "Neuen Link anfordern",
  "auth.reset.doneHeading": "Passwort geändert!",
  "auth.reset.doneBody": "Du wirst gleich zu deinem Dashboard weitergeleitet …",
  "auth.reset.heading": "Neues Passwort festlegen",
  "auth.reset.newPassword": "Neues Passwort",
  "auth.reset.newPasswordPlaceholder": "Mindestens 8 Zeichen",
  "auth.reset.repeatPassword": "Passwort wiederholen",
  "auth.reset.mismatch": "Die Passwörter stimmen nicht überein.",
  "auth.reset.submit": "Passwort speichern",
  "auth.reset.submitting": "Wird gespeichert …",
  "auth.reset.failed": "Passwort konnte nicht geändert werden.",

  "auth.guard.checking": "Anmeldung wird geprüft …",
  "auth.logout": "Abmelden",
  "auth.loggingOut": "Wird abgemeldet …",

  // ── Auth-Fehlercodes (aus Supabase) ──────────────────────────────────
  "authError.invalid_credentials": "E-Mail oder Passwort ist falsch.",
  "authError.email_not_confirmed":
    "Bitte bestätige zuerst deine E-Mail-Adresse — wir haben dir einen Link geschickt.",
  "authError.email_address_invalid": "Diese E-Mail-Adresse ist ungültig.",
  "authError.user_already_exists":
    "Für diese E-Mail-Adresse existiert bereits ein Konto.",
  "authError.email_exists":
    "Für diese E-Mail-Adresse existiert bereits ein Konto.",
  "authError.weak_password":
    "Das Passwort ist zu schwach. Bitte wähle ein stärkeres Passwort.",
  "authError.same_password":
    "Das neue Passwort muss sich vom alten unterscheiden.",
  "authError.over_email_send_rate_limit":
    "Zu viele E-Mails in kurzer Zeit. Bitte warte einen Moment und versuche es erneut.",
  "authError.over_request_rate_limit":
    "Zu viele Versuche. Bitte warte einen Moment und versuche es erneut.",
  "authError.session_expired":
    "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
  "authError.user_not_found": "Kein Konto mit diesen Daten gefunden.",

  // ── Dashboard ────────────────────────────────────────────────────────
  "dashboard.title": "Meine Ziele",
  "dashboard.settings": "Einstellungen",
  "dashboard.tabs.goals": "Ziele",
  "dashboard.tabs.overview": "Übersicht",
  "dashboard.viewLabel": "Dashboard-Ansicht",
  "dashboard.goalsLoading": "Ziele werden geladen …",
  "dashboard.newGoal": "Neues Ziel",
  "dashboard.detailsLink": "Details ansehen →",

  "empty.heading": "Noch keine Ziele — Zeit für dein erstes!",
  "empty.body":
    "Leg ein Ziel an (z.B. 100x Sport in diesem Jahr) und sammle Stempel — Feld für Feld, Karte für Karte, bis zur Belohnung.",
  "empty.cta": "Erstes Ziel anlegen",

  // ── Punchcard / Karte ────────────────────────────────────────────────
  "card.membership": (p: { n: number }) => `Mitgliedskarte · No. ${p.n}`,
  "card.of": (p: { total: number }) => `von ${p.total}`,
  "punch.stamp": (p: { n: number }) => `Feld ${p.n} stempeln`,
  "punch.stamped": (p: { n: number }) => `Feld ${p.n}: gestempelt`,
  "punch.locked": (p: { n: number }) => `Feld ${p.n}: noch gesperrt`,
  "reward.cardFull": "Karte voll!",
  "reward.cardComplete": (p: { n: number }) => `Karte ${p.n} ist komplett — stark!`,
  "reward.yourReward": "Deine Belohnung:",
  "reward.dismiss": "Hinweis schließen",
  "card.view.punchcard": "Stempelkarte",
  "card.view.stats": "Statistik",
  "card.view.show": (p: { label: string }) => `${p.label} anzeigen`,

  // ── Ziel-Detailseite ─────────────────────────────────────────────────
  "goal.loading": "Ziel wird geladen …",
  "goal.loadFailed": "Das Ziel konnte nicht geladen werden.",
  "goal.notFound": "Dieses Ziel wurde nicht gefunden.",
  "goal.backToDashboard": "← Zurück zum Dashboard",
  "goal.backToGoal": "← Zurück zum Ziel",
  "goal.edit": "Bearbeiten",
  "goal.delete": "Löschen",
  "goal.deleteFailed": "Löschen fehlgeschlagen.",
  "goal.stampsLoading": "Stempel werden geladen …",
  "goal.reached": "Ziel erreicht! 🎉",
  "goal.reachedShort": "Ziel erreicht!",
  // "37/100 Stempel · Karte 2/10 · noch 63 offen"
  "goal.detailProgress": (p: {
    done: number;
    total: number;
    card: number;
    cards: number;
    remaining: number;
  }) =>
    `${p.done}/${p.total} Stempel · Karte ${p.card}/${p.cards} · noch ${p.remaining} offen`,
  // Kompakt in der Kachel: "37/100" + "· Karte 2/10"
  "goal.cardCounter": (p: { card: number; cards: number }) =>
    `· Karte ${p.card}/${p.cards}`,
  "goal.stats": "Statistik",
  "goal.deleteConfirmTitle": "Ziel löschen?",
  "goal.deleteConfirmBody": (p: { title: string }) =>
    `Möchtest du „${p.title}“ wirklich löschen? Alle gesammelten Stempel gehen dabei unwiderruflich verloren.`,
  "goal.deleteConfirmCta": "Endgültig löschen",
  "goal.deleting": "Wird gelöscht …",

  // ── Ziel anlegen / bearbeiten (Seiten-Chrome) ────────────────────────
  "goal.new.title": "Neues Ziel anlegen",
  "goal.new.subtitle": "Definiere dein Ziel und deine Stempelkarten — los geht’s!",
  "goal.editPage.title": "Ziel bearbeiten",

  // ── GoalForm ─────────────────────────────────────────────────────────
  "form.title": "Titel",
  "form.titlePlaceholder": "z.B. 100x Sport",
  "form.description": "Beschreibung (optional)",
  "form.descriptionPlaceholder": "Worum geht es bei diesem Ziel?",
  "form.icon": "Symbol",
  "form.iconLabel": (p: { label: string }) => `Symbol ${p.label}`,
  "form.color": "Farbe",
  "form.colorLabel": (p: { label: string }) => `Farbe ${p.label}`,
  "form.targetCount": "Zielanzahl",
  "form.cardSize": "Felder pro Karte",
  "form.reward": "Belohnung pro Karte (optional)",
  "form.rewardPlaceholder": "z.B. Ein Kinoabend",
  "form.useCardRewards": "Unterschiedliche Belohnung pro Karte",
  "form.cardLabel": (p: { n: number }) => `Karte ${p.n}`,
  "form.rewardForCard": (p: { n: number }) => `Belohnung für Karte ${p.n}`,
  "form.rewardInputPlaceholder": "Belohnung (optional)",
  "form.maxRewardsHint": (p: { max: number }) =>
    `Es können höchstens ${p.max} Karten individuell belohnt werden — für die übrigen gilt die Standard-Belohnung.`,
  "form.emptyRewardHint": "Leere Felder verwenden die Standard-Belohnung oben.",
  "form.legacyIcon": (p: { icon: string }) => `Bisheriges Symbol ${p.icon}`,
  "form.submitCreate": "Ziel anlegen",
  "form.submitUpdate": "Änderungen speichern",
  "form.saveFailed": "Speichern fehlgeschlagen.",
  // Live-Vorschau der Kartenaufteilung
  "form.previewOne": (p: { slots: number }) =>
    `→ 1 Karte mit ${p.slots} ${p.slots === 1 ? "Feld" : "Feldern"}`,
  "form.previewMany": (p: { cards: number; size: number }) =>
    `→ ${p.cards} Karten à ${p.size} ${p.size === 1 ? "Feld" : "Feldern"}`,
  "form.previewLastCard": (p: { base: string; last: number }) =>
    `${p.base}, letzte Karte mit ${p.last} ${p.last === 1 ? "Feld" : "Feldern"}`,

  // GoalForm-Validierung (zod)
  "form.err.titleRequired": "Bitte gib einen Titel ein.",
  "form.err.titleMax": "Der Titel darf höchstens 200 Zeichen lang sein.",
  "form.err.descriptionMax": "Die Beschreibung ist zu lang (max. 2000 Zeichen).",
  "form.err.iconRequired": "Bitte wähle ein Symbol.",
  "form.err.colorRequired": "Bitte wähle eine Farbe.",
  "form.err.number": "Bitte gib eine Zahl ein.",
  "form.err.integer": "Bitte gib eine ganze Zahl ein.",
  "form.err.targetMin": "Die Zielanzahl muss mindestens 1 sein.",
  "form.err.targetMax": "Die Zielanzahl ist zu groß.",
  "form.err.cardSizeMin": "Die Kartengröße muss mindestens 1 sein.",
  "form.err.cardSizeMax": "Maximal 100 Felder pro Karte.",
  "form.err.startRequired": "Bitte wähle ein Startdatum.",
  "form.err.rewardMax": "Die Belohnung ist zu lang.",
  "form.err.endRequired": "Bei eigenem Zeitraum ist ein Enddatum erforderlich.",
  "form.err.endBeforeStart": "Das Enddatum darf nicht vor dem Startdatum liegen.",

  // ── PeriodPicker ─────────────────────────────────────────────────────
  "period.label": "Zeitraum",
  "period.typeLabel": "Zeitraum-Typ",
  "period.year": "Jahr",
  "period.month": "Monat",
  "period.week": "Woche",
  "period.custom": "Eigener Zeitraum",
  "period.startDate": "Startdatum",
  "period.endDate": "Enddatum",
  // "Zeitraum: 5. Juli 2026 – 4. Juli 2027 (Jahr)"
  "period.range": (p: { start: string; end: string; type: string }) =>
    `Zeitraum: ${p.start} – ${p.end} (${p.type})`,
  // Detail-Header: "Jahr · 5. Juli 2026 – 4. Juli 2027"
  "period.goalRange": (p: { type: string; start: string; end: string }) =>
    `${p.type} · ${p.start} – ${p.end}`,
  "period.goalFrom": (p: { type: string; start: string }) =>
    `${p.type} · ab ${p.start}`,

  // ── Icon-Labels (GoalForm-Auswahl) ───────────────────────────────────
  "goalIcon.Target": "Zielscheibe",
  "goalIcon.Barbell": "Krafttraining",
  "goalIcon.PersonSimpleRun": "Laufen",
  "goalIcon.Bicycle": "Radfahren",
  "goalIcon.SwimmingPool": "Schwimmen",
  "goalIcon.BookOpen": "Lesen",
  "goalIcon.PencilLine": "Schreiben",
  "goalIcon.MusicNotes": "Musik",
  "goalIcon.Palette": "Kreativität",
  "goalIcon.Plant": "Pflanzen",
  "goalIcon.Drop": "Wasser trinken",
  "goalIcon.ForkKnife": "Ernährung",
  "goalIcon.Moon": "Schlaf",
  "goalIcon.Broom": "Haushalt",
  "goalIcon.PiggyBank": "Sparen",
  "goalIcon.ChatsCircle": "Soziales",
  "goalIcon.Sun": "Draußen sein",
  "goalIcon.Prohibit": "Verzicht",
  "goalIcon.Heart": "Selbstfürsorge",
  "goalIcon.Sparkle": "Besonderes",

  // ── Farb-Labels (GoalForm) ───────────────────────────────────────────
  "color.mandarine": "Mandarine",
  "color.coral": "Koralle",
  "color.rosa": "Rosa",
  "color.flieder": "Flieder",
  "color.himmelblau": "Himmelblau",
  "color.tuerkis": "Türkis",
  "color.gruen": "Grün",
  "color.mokka": "Mokka",

  // ── Analytics (pro Ziel) ─────────────────────────────────────────────
  "analytics.loading": "Statistik wird geladen …",
  "analytics.chartLoading": "Diagramm wird geladen …",
  "analytics.empty":
    "Noch keine Stempel — sobald du den ersten setzt, wächst hier deine Verlaufskurve.",
  // Suffix nach der (fett gerenderten) Bruchzahl:
  // "37/100" + " gestempelt · 63 offen · 3/10 Karten voll"
  "analytics.statsSuffix": (p: {
    remaining: number;
    fullCards: number;
    cards: number;
  }) =>
    ` gestempelt · ${p.remaining} offen · ${p.fullCards}/${p.cards} Karten voll`,
  "analytics.cardsOverview": "Übersicht aller Karten",
  "analytics.status.full": "voll",
  "analytics.status.active": "aktiv",
  "analytics.status.open": "offen",

  // ── Chart-Texte (Plotly) ─────────────────────────────────────────────
  "chart.target": "Ziel",
  "chart.nthStamp": (p: { n: string }) => `${p.n}. Stempel`,
  "chart.stampsCount": (p: { n: string }) => `${p.n} Stempel`,
  "chart.week": (p: { week: string; date: string }) =>
    `KW ${p.week} · ab ${p.date}`,
  "chart.cardFull": (p: { n: number; date: string }) =>
    `Karte ${p.n} voll · ${p.date}`,

  // ── Übersicht ────────────────────────────────────────────────────────
  "overview.loading": "Übersicht wird geladen …",
  "overview.loadFailed": "Die Übersicht konnte nicht geladen werden.",
  "overview.emptyHeading": "Hier gibt es noch nichts zu sehen",
  "overview.emptyBody":
    "Die Übersicht füllt sich, sobald du dein erstes Ziel anlegst und Stempel sammelst.",
  "overview.chartEmpty":
    "Noch keine Stempel — sobald du stempelst, vergleichen sich hier alle Ziele auf einen Blick.",
  // "12 Stempel gesamt · 3 Karten voll · 2 Ziele aktiv" (mit fetten Zahlen —
  // Komponente setzt die Zahlen selbst, hier nur die Wörter dazwischen)
  "overview.statsStamps": "Stempel gesamt",
  "overview.statsCards": "Karten voll",
  "overview.statsGoals": "Ziele aktiv",
  "overview.goalsHeading": "Ziele im Überblick",
  "overview.activityHeading": "Letzte Aktivität",
  // "37/100 · 3/10 Karten"
  "overview.goalRow": (p: {
    done: number;
    total: number;
    completed: number;
    cards: number;
  }) => `${p.done}/${p.total} · ${p.completed}/${p.cards} Karten`,
  "overview.progressOf": (p: { title: string }) => `Fortschritt ${p.title}`,

  "activity.empty": "Noch keine Aktivität — dein erster Stempel taucht hier auf.",
  "activity.today": "Heute",
  "activity.yesterday": "Gestern",
  "activity.deletedGoal": "Gelöschtes Ziel",
  "activity.cardFull": (p: { n: number; title: string }) =>
    `Karte ${p.n} von „${p.title}“ voll!`,
  "activity.stampsCount": (p: { n: number }) =>
    `${p.n} ${p.n === 1 ? "Stempel" : "Stempel"}`,
  "activity.showMore": "Mehr anzeigen",

  // ── Einstellungen ────────────────────────────────────────────────────
  "settings.title": "Einstellungen",
  "settings.deviceHint": "Gilt für dieses Gerät.",
  "settings.backToDashboard": "Zurück zum Dashboard",
  "settings.design": "Design",
  "settings.designHint": "Hell, dunkel oder automatisch nach Systemeinstellung.",
  "settings.themeMode": "Theme-Modus",
  "settings.mode.system": "System",
  "settings.mode.light": "Hell",
  "settings.mode.dark": "Dunkel",
  "settings.accent": "Akzentfarbe",
  "settings.accentHint": "Färbt Knöpfe, aktive Zustände und Glanzlichter der App.",
  "settings.language": "Sprache / Language",
  "settings.languageHint": "Sprache der App-Oberfläche.",
  "settings.lang.de": "Deutsch",
  "settings.lang.en": "English",

  // ── Akzent-Labels ────────────────────────────────────────────────────
  "accent.amber": "Amber",
  "accent.coral": "Koralle",
  "accent.pink": "Pink",
  "accent.violet": "Violett",
  "accent.blau": "Blau",
  "accent.tuerkis": "Türkis",
  "accent.gruen": "Grün",

  // ── Sonstiges ────────────────────────────────────────────────────────
  "home.redirecting": "Einen Moment …",
} as const;

/**
 * Schlüssel-Menge und -Signaturen (aus `de` abgeleitet). String-Werte werden
 * zu `string` geweitet (sonst müssten die englischen Texte den deutschen
 * Literalen gleichen); Funktions-Werte behalten ihre Parameter-Signatur, damit
 * die Interpolation typsicher bleibt.
 */
export type Messages = {
  [K in keyof typeof de]: (typeof de)[K] extends (arg: infer A) => string
    ? (arg: A) => string
    : string;
};
export type MessageKey = keyof typeof de;

/** Englisches Wörterbuch — MUSS exakt dieselben Schlüssel wie `de` haben. */
export const en: Messages = {
  "brand.name": "Stempelkarte",
  "brand.tagline": "Your goals, stamp by stamp.",
  "common.back": "Back",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.saving": "Saving …",
  "common.loading": "Loading …",
  "common.notLoggedIn": "You are not logged in.",

  "auth.email": "Email",
  "auth.emailPlaceholder": "you@example.com",
  "auth.password": "Password",
  "auth.passwordPlaceholder": "••••••••",
  "auth.login.heading": "Welcome back!",
  "auth.login.submit": "Log in",
  "auth.login.submitting": "Logging in …",
  "auth.login.failed": "Login failed.",
  "auth.login.forgot": "Forgot password?",
  "auth.login.noAccount": "No account yet?",
  "auth.login.signupLink": "Sign up now",
  "auth.login.title": "Log in — Stempelkarte",

  "auth.signup.heading": "Create account",
  "auth.signup.passwordPlaceholder": "At least 8 characters",
  "auth.signup.submit": "Sign up",
  "auth.signup.submitting": "Signing up …",
  "auth.signup.failed": "Sign-up failed.",
  "auth.signup.hasAccount": "Already have an account?",
  "auth.signup.loginLink": "Log in",
  "auth.signup.sentHeading": "Almost there!",
  "auth.signup.sentBody": (p) =>
    `We sent an email to ${p.email}. Please confirm your address via the link in the email to activate your account.`,
  "auth.signup.toLogin": "Go to login",
  "auth.signup.title": "Sign up — Stempelkarte",

  "auth.passwordTooShort": "The password must be at least 8 characters long.",

  "auth.forgot.heading": "Forgot password?",
  "auth.forgot.subtitle": "No problem! We'll send you a link to reset it.",
  "auth.forgot.submit": "Send link",
  "auth.forgot.submitting": "Sending …",
  "auth.forgot.failed": "The email could not be sent.",
  "auth.forgot.backToLogin": "Back to login",
  "auth.forgot.sentHeading": "Email on its way!",
  "auth.forgot.sentBody": (p) =>
    `If an account exists for ${p.email}, we've sent you a link to reset your password.`,

  "auth.reset.checking": "Checking link …",
  "auth.reset.invalidHeading": "Link invalid or expired",
  "auth.reset.invalidBody": "Please request a new link to reset your password.",
  "auth.reset.requestNew": "Request new link",
  "auth.reset.doneHeading": "Password changed!",
  "auth.reset.doneBody": "You'll be redirected to your dashboard shortly …",
  "auth.reset.heading": "Set new password",
  "auth.reset.newPassword": "New password",
  "auth.reset.newPasswordPlaceholder": "At least 8 characters",
  "auth.reset.repeatPassword": "Repeat password",
  "auth.reset.mismatch": "The passwords do not match.",
  "auth.reset.submit": "Save password",
  "auth.reset.submitting": "Saving …",
  "auth.reset.failed": "The password could not be changed.",

  "auth.guard.checking": "Checking sign-in …",
  "auth.logout": "Log out",
  "auth.loggingOut": "Logging out …",

  "authError.invalid_credentials": "Email or password is incorrect.",
  "authError.email_not_confirmed":
    "Please confirm your email address first — we've sent you a link.",
  "authError.email_address_invalid": "This email address is invalid.",
  "authError.user_already_exists":
    "An account already exists for this email address.",
  "authError.email_exists":
    "An account already exists for this email address.",
  "authError.weak_password":
    "The password is too weak. Please choose a stronger password.",
  "authError.same_password":
    "The new password must be different from the old one.",
  "authError.over_email_send_rate_limit":
    "Too many emails in a short time. Please wait a moment and try again.",
  "authError.over_request_rate_limit":
    "Too many attempts. Please wait a moment and try again.",
  "authError.session_expired":
    "Your session has expired. Please log in again.",
  "authError.user_not_found": "No account found with these details.",

  "dashboard.title": "My goals",
  "dashboard.settings": "Settings",
  "dashboard.tabs.goals": "Goals",
  "dashboard.tabs.overview": "Overview",
  "dashboard.viewLabel": "Dashboard view",
  "dashboard.goalsLoading": "Loading goals …",
  "dashboard.newGoal": "New goal",
  "dashboard.detailsLink": "View details →",

  "empty.heading": "No goals yet — time for your first one!",
  "empty.body":
    "Create a goal (e.g. 100× exercise this year) and collect stamps — slot by slot, card by card, all the way to your reward.",
  "empty.cta": "Create your first goal",

  "card.membership": (p) => `Membership card · No. ${p.n}`,
  "card.of": (p) => `of ${p.total}`,
  "punch.stamp": (p) => `Stamp slot ${p.n}`,
  "punch.stamped": (p) => `Slot ${p.n}: stamped`,
  "punch.locked": (p) => `Slot ${p.n}: still locked`,
  "reward.cardFull": "Card full!",
  "reward.cardComplete": (p) => `Card ${p.n} is complete — nice!`,
  "reward.yourReward": "Your reward:",
  "reward.dismiss": "Dismiss notice",
  "card.view.punchcard": "Punch card",
  "card.view.stats": "Statistics",
  "card.view.show": (p) => `Show ${p.label}`,

  "goal.loading": "Loading goal …",
  "goal.loadFailed": "The goal could not be loaded.",
  "goal.notFound": "This goal was not found.",
  "goal.backToDashboard": "← Back to dashboard",
  "goal.backToGoal": "← Back to goal",
  "goal.edit": "Edit",
  "goal.delete": "Delete",
  "goal.deleteFailed": "Deletion failed.",
  "goal.stampsLoading": "Loading stamps …",
  "goal.reached": "Goal reached! 🎉",
  "goal.reachedShort": "Goal reached!",
  "goal.detailProgress": (p) => {
    const stampWord = p.total === 1 ? "stamp" : "stamps";
    return `${p.done}/${p.total} ${stampWord} · Card ${p.card}/${p.cards} · ${p.remaining} to go`;
  },
  "goal.cardCounter": (p) => `· Card ${p.card}/${p.cards}`,
  "goal.stats": "Statistics",
  "goal.deleteConfirmTitle": "Delete goal?",
  "goal.deleteConfirmBody": (p) =>
    `Do you really want to delete “${p.title}”? All collected stamps will be lost permanently.`,
  "goal.deleteConfirmCta": "Delete permanently",
  "goal.deleting": "Deleting …",

  "goal.new.title": "Create new goal",
  "goal.new.subtitle": "Define your goal and your punch cards — let's go!",
  "goal.editPage.title": "Edit goal",

  "form.title": "Title",
  "form.titlePlaceholder": "e.g. 100× exercise",
  "form.description": "Description (optional)",
  "form.descriptionPlaceholder": "What is this goal about?",
  "form.icon": "Icon",
  "form.iconLabel": (p) => `Icon ${p.label}`,
  "form.color": "Color",
  "form.colorLabel": (p) => `Color ${p.label}`,
  "form.targetCount": "Target count",
  "form.cardSize": "Slots per card",
  "form.reward": "Reward per card (optional)",
  "form.rewardPlaceholder": "e.g. A movie night",
  "form.useCardRewards": "Different reward per card",
  "form.cardLabel": (p) => `Card ${p.n}`,
  "form.rewardForCard": (p) => `Reward for card ${p.n}`,
  "form.rewardInputPlaceholder": "Reward (optional)",
  "form.maxRewardsHint": (p) =>
    `At most ${p.max} cards can be rewarded individually — the rest use the default reward.`,
  "form.emptyRewardHint": "Empty fields use the default reward above.",
  "form.legacyIcon": (p) => `Previous icon ${p.icon}`,
  "form.submitCreate": "Create goal",
  "form.submitUpdate": "Save changes",
  "form.saveFailed": "Saving failed.",
  "form.previewOne": (p) =>
    `→ 1 card with ${p.slots} ${p.slots === 1 ? "slot" : "slots"}`,
  "form.previewMany": (p) =>
    `→ ${p.cards} cards of ${p.size} ${p.size === 1 ? "slot" : "slots"}`,
  "form.previewLastCard": (p) =>
    `${p.base}, last card with ${p.last} ${p.last === 1 ? "slot" : "slots"}`,

  "form.err.titleRequired": "Please enter a title.",
  "form.err.titleMax": "The title may be at most 200 characters long.",
  "form.err.descriptionMax": "The description is too long (max. 2000 characters).",
  "form.err.iconRequired": "Please choose an icon.",
  "form.err.colorRequired": "Please choose a color.",
  "form.err.number": "Please enter a number.",
  "form.err.integer": "Please enter a whole number.",
  "form.err.targetMin": "The target count must be at least 1.",
  "form.err.targetMax": "The target count is too large.",
  "form.err.cardSizeMin": "The card size must be at least 1.",
  "form.err.cardSizeMax": "At most 100 slots per card.",
  "form.err.startRequired": "Please choose a start date.",
  "form.err.rewardMax": "The reward is too long.",
  "form.err.endRequired": "A custom period requires an end date.",
  "form.err.endBeforeStart": "The end date must not be before the start date.",

  "period.label": "Period",
  "period.typeLabel": "Period type",
  "period.year": "Year",
  "period.month": "Month",
  "period.week": "Week",
  "period.custom": "Custom period",
  "period.startDate": "Start date",
  "period.endDate": "End date",
  "period.range": (p) => `Period: ${p.start} – ${p.end} (${p.type})`,
  "period.goalRange": (p) => `${p.type} · ${p.start} – ${p.end}`,
  "period.goalFrom": (p) => `${p.type} · from ${p.start}`,

  "goalIcon.Target": "Target",
  "goalIcon.Barbell": "Strength training",
  "goalIcon.PersonSimpleRun": "Running",
  "goalIcon.Bicycle": "Cycling",
  "goalIcon.SwimmingPool": "Swimming",
  "goalIcon.BookOpen": "Reading",
  "goalIcon.PencilLine": "Writing",
  "goalIcon.MusicNotes": "Music",
  "goalIcon.Palette": "Creativity",
  "goalIcon.Plant": "Plants",
  "goalIcon.Drop": "Drink water",
  "goalIcon.ForkKnife": "Nutrition",
  "goalIcon.Moon": "Sleep",
  "goalIcon.Broom": "Housework",
  "goalIcon.PiggyBank": "Saving",
  "goalIcon.ChatsCircle": "Social",
  "goalIcon.Sun": "Being outdoors",
  "goalIcon.Prohibit": "Abstaining",
  "goalIcon.Heart": "Self-care",
  "goalIcon.Sparkle": "Special",

  "color.mandarine": "Tangerine",
  "color.coral": "Coral",
  "color.rosa": "Pink",
  "color.flieder": "Lilac",
  "color.himmelblau": "Sky blue",
  "color.tuerkis": "Turquoise",
  "color.gruen": "Green",
  "color.mokka": "Mocha",

  "analytics.loading": "Loading statistics …",
  "analytics.chartLoading": "Loading chart …",
  "analytics.empty":
    "No stamps yet — as soon as you set the first one, your progress curve grows here.",
  "analytics.statsSuffix": (p) =>
    ` stamped · ${p.remaining} to go · ${p.fullCards}/${p.cards} cards full`,
  "analytics.cardsOverview": "Overview of all cards",
  "analytics.status.full": "full",
  "analytics.status.active": "active",
  "analytics.status.open": "open",

  "chart.target": "Target",
  "chart.nthStamp": (p) => `Stamp no. ${p.n}`,
  "chart.stampsCount": (p) => `${p.n} stamps`,
  "chart.week": (p) => `Week ${p.week} · from ${p.date}`,
  "chart.cardFull": (p) => `Card ${p.n} full · ${p.date}`,

  "overview.loading": "Loading overview …",
  "overview.loadFailed": "The overview could not be loaded.",
  "overview.emptyHeading": "Nothing to see here yet",
  "overview.emptyBody":
    "The overview fills up once you create your first goal and collect stamps.",
  "overview.chartEmpty":
    "No stamps yet — once you start stamping, all goals compare here at a glance.",
  "overview.statsStamps": "stamps total",
  "overview.statsCards": "cards full",
  "overview.statsGoals": "goals active",
  "overview.goalsHeading": "Goals at a glance",
  "overview.activityHeading": "Recent activity",
  "overview.goalRow": (p) =>
    `${p.done}/${p.total} · ${p.completed}/${p.cards} cards`,
  "overview.progressOf": (p) => `Progress ${p.title}`,

  "activity.empty": "No activity yet — your first stamp will appear here.",
  "activity.today": "Today",
  "activity.yesterday": "Yesterday",
  "activity.deletedGoal": "Deleted goal",
  "activity.cardFull": (p) => `Card ${p.n} of “${p.title}” full!`,
  "activity.stampsCount": (p) => `${p.n} ${p.n === 1 ? "stamp" : "stamps"}`,
  "activity.showMore": "Show more",

  "settings.title": "Settings",
  "settings.deviceHint": "Applies to this device.",
  "settings.backToDashboard": "Back to dashboard",
  "settings.design": "Appearance",
  "settings.designHint": "Light, dark, or automatic based on system setting.",
  "settings.themeMode": "Theme mode",
  "settings.mode.system": "System",
  "settings.mode.light": "Light",
  "settings.mode.dark": "Dark",
  "settings.accent": "Accent color",
  "settings.accentHint": "Colors buttons, active states, and highlights of the app.",
  "settings.language": "Language / Sprache",
  "settings.languageHint": "Language of the app interface.",
  "settings.lang.de": "Deutsch",
  "settings.lang.en": "English",

  "accent.amber": "Amber",
  "accent.coral": "Coral",
  "accent.pink": "Pink",
  "accent.violet": "Violet",
  "accent.blau": "Blue",
  "accent.tuerkis": "Turquoise",
  "accent.gruen": "Green",

  "home.redirecting": "One moment …",
};

export const MESSAGES: Record<"de" | "en", Messages> = { de, en };
