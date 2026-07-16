"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Warning } from "@phosphor-icons/react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/supabase/auth-errors";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";
import { inputClassName } from "@/components/ui/Input";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

/**
 * Zielseite des Recovery-Links aus der "Passwort vergessen"-E-Mail.
 * Der Supabase-Browser-Client tauscht den Code aus der URL automatisch gegen
 * eine Session (detectSessionInUrl); sobald die Session da ist, kann das neue
 * Passwort über updateUser gesetzt werden.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { session, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t("auth.passwordTooShort"));
      return;
    }
    if (password !== passwordConfirm) {
      setError(t("auth.reset.mismatch"));
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(authErrorMessage(t, updateError, t("auth.reset.failed")));
        return;
      }
      setDone(true);
      setTimeout(() => router.replace("/dashboard"), 2000);
    } catch (err) {
      setError(authErrorMessage(t, err, t("auth.reset.failed")));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <Spinner label={t("auth.reset.checking")} />;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="bg-danger-soft flex h-14 w-14 items-center justify-center rounded-full text-danger">
          <Warning size={28} weight="fill" aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl font-semibold text-ink">
          {t("auth.reset.invalidHeading")}
        </h2>
        <p className="text-sm leading-6 text-ink-soft">
          {t("auth.reset.invalidBody")}
        </p>
        <Link
          href="/forgot-password"
          className="mt-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-contrast shadow-md shadow-accent/25 transition hover:bg-accent-strong active:scale-[0.98]"
        >
          {t("auth.reset.requestNew")}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="bg-accent-soft flex h-14 w-14 items-center justify-center rounded-full text-success">
          <CheckCircle size={28} weight="fill" aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl font-semibold text-ink">
          {t("auth.reset.doneHeading")}
        </h2>
        <p className="text-sm leading-6 text-ink-soft">
          {t("auth.reset.doneBody")}
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-6 text-center font-display text-2xl font-semibold tracking-tight text-ink">
        {t("auth.reset.heading")}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-ink-soft"
          >
            {t("auth.reset.newPassword")}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("auth.reset.newPasswordPlaceholder")}
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="passwordConfirm"
            className="text-sm font-medium text-ink-soft"
          >
            {t("auth.reset.repeatPassword")}
          </label>
          <input
            id="passwordConfirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder={t("auth.passwordPlaceholder")}
            className={inputClassName}
          />
        </div>

        {error && (
          <p
            className="bg-danger-soft rounded-2xl px-4 py-2.5 text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-contrast shadow-md shadow-accent/25 transition hover:bg-accent-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? t("auth.reset.submitting") : t("auth.reset.submit")}
        </button>
      </form>
    </>
  );
}
