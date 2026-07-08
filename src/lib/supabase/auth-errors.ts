import { AuthError } from "@supabase/supabase-js";

const MESSAGES: Record<string, string> = {
  invalid_credentials: "E-Mail oder Passwort ist falsch.",
  email_not_confirmed:
    "Bitte bestätige zuerst deine E-Mail-Adresse — wir haben dir einen Link geschickt.",
  email_address_invalid: "Diese E-Mail-Adresse ist ungültig.",
  user_already_exists: "Für diese E-Mail-Adresse existiert bereits ein Konto.",
  email_exists: "Für diese E-Mail-Adresse existiert bereits ein Konto.",
  weak_password: "Das Passwort ist zu schwach. Bitte wähle ein stärkeres Passwort.",
  same_password: "Das neue Passwort muss sich vom alten unterscheiden.",
  over_email_send_rate_limit:
    "Zu viele E-Mails in kurzer Zeit. Bitte warte einen Moment und versuche es erneut.",
  over_request_rate_limit:
    "Zu viele Versuche. Bitte warte einen Moment und versuche es erneut.",
  session_expired: "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
  user_not_found: "Kein Konto mit diesen Daten gefunden.",
};

/** Übersetzt Supabase-Auth-Fehler in deutsche, nutzerfreundliche Meldungen. */
export function authErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AuthError && error.code && MESSAGES[error.code]) {
    return MESSAGES[error.code];
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
