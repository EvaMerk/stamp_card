"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/supabase/auth-errors";

export default function ForgotPasswordPage() {
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
        setError(
          authErrorMessage(resetError, "E-Mail konnte nicht gesendet werden."),
        );
        return;
      }
      setEmailSent(true);
    } catch (err) {
      setError(authErrorMessage(err, "E-Mail konnte nicht gesendet werden."));
    } finally {
      setSubmitting(false);
    }
  }

  if (emailSent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-3xl">
          📬
        </span>
        <h2 className="text-lg font-semibold text-stone-800">
          E-Mail unterwegs!
        </h2>
        <p className="text-sm leading-6 text-stone-600">
          Falls ein Konto für{" "}
          <span className="font-medium text-stone-800">{email}</span> existiert,
          haben wir dir einen Link zum Zurücksetzen deines Passworts geschickt.
        </p>
        <Link
          href="/login"
          className="mt-2 text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          Zurück zur Anmeldung
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-2 text-center text-xl font-semibold text-stone-800">
        Passwort vergessen?
      </h2>
      <p className="mb-6 text-center text-sm text-stone-500">
        Kein Problem! Wir schicken dir einen Link zum Zurücksetzen.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-stone-700">
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="du@beispiel.de"
            className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          />
        </div>

        {error && (
          <p
            className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-amber-500 px-6 py-3 font-semibold text-white shadow-md shadow-amber-500/25 transition hover:bg-amber-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Wird gesendet …" : "Link senden"}
        </button>

        <p className="text-center text-sm text-stone-500">
          <Link
            href="/login"
            className="font-medium text-amber-600 hover:text-amber-700"
          >
            Zurück zur Anmeldung
          </Link>
        </p>
      </form>
    </>
  );
}
