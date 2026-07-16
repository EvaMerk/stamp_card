import { AuthError } from "@supabase/supabase-js";
import type { TranslateFn } from "@/lib/i18n/LanguageProvider";
import type { MessageKey } from "@/lib/i18n/messages";

/** Supabase-Fehlercode → Übersetzungsschlüssel (de/en im messages-Dict). */
const CODE_KEYS: Record<string, MessageKey> = {
  invalid_credentials: "authError.invalid_credentials",
  email_not_confirmed: "authError.email_not_confirmed",
  email_address_invalid: "authError.email_address_invalid",
  user_already_exists: "authError.user_already_exists",
  email_exists: "authError.email_exists",
  weak_password: "authError.weak_password",
  same_password: "authError.same_password",
  over_email_send_rate_limit: "authError.over_email_send_rate_limit",
  over_request_rate_limit: "authError.over_request_rate_limit",
  session_expired: "authError.session_expired",
  user_not_found: "authError.user_not_found",
};

/**
 * Übersetzt Supabase-Auth-Fehler in der aktiven UI-Sprache. `t` kommt aus dem
 * LanguageProvider (useTranslation); für gemappte Codes wird der lokalisierte
 * Text zurückgegeben, sonst die rohe Fehlermeldung, sonst der Fallback-Text.
 */
export function authErrorMessage(
  t: TranslateFn,
  error: unknown,
  fallback: string,
): string {
  if (error instanceof AuthError && error.code && CODE_KEYS[error.code]) {
    return t(CODE_KEYS[error.code]);
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
