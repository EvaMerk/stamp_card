"use client";

import { useState } from "react";
import Link from "next/link";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/supabase/auth-errors";
import { inputClassName } from "@/components/ui/Input";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        },
      );
      if (resetError) {
        setError(authErrorMessage(t, resetError, t("auth.forgot.failed")));
        return;
      }
      setEmailSent(true);
    } catch (err) {
      setError(authErrorMessage(t, err, t("auth.forgot.failed")));
    } finally {
      setSubmitting(false);
    }
  }

  if (emailSent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="bg-accent-soft flex h-14 w-14 items-center justify-center rounded-full text-accent-strong">
          <PaperPlaneTilt size={28} weight="fill" aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl font-semibold text-ink">
          {t("auth.forgot.sentHeading")}
        </h2>
        <p className="text-sm leading-6 text-ink-soft">
          {t("auth.forgot.sentBody", { email })}
        </p>
        <Link
          href="/login"
          className="mt-2 text-sm font-medium text-accent-strong hover:underline"
        >
          {t("auth.forgot.backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-2 text-center font-display text-2xl font-semibold tracking-tight text-ink">
        {t("auth.forgot.heading")}
      </h2>
      <p className="mb-6 text-center text-sm text-ink-soft">
        {t("auth.forgot.subtitle")}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-ink-soft">
            {t("auth.email")}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.emailPlaceholder")}
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
          {submitting ? t("auth.forgot.submitting") : t("auth.forgot.submit")}
        </button>

        <p className="text-center text-sm text-ink-soft">
          <Link
            href="/login"
            className="font-medium text-accent-strong hover:underline"
          >
            {t("auth.forgot.backToLogin")}
          </Link>
        </p>
      </form>
    </>
  );
}
