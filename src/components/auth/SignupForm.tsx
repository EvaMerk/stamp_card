"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/supabase/auth-errors";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (signUpError) {
        setError(authErrorMessage(signUpError, "Registrierung fehlgeschlagen."));
        return;
      }
      setEmailSent(true);
    } catch (err) {
      setError(authErrorMessage(err, "Registrierung fehlgeschlagen."));
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
          Fast geschafft!
        </h2>
        <p className="text-sm leading-6 text-stone-600">
          Wir haben dir eine E-Mail an{" "}
          <span className="font-medium text-stone-800">{email}</span> geschickt.
          Bitte bestätige deine Adresse über den Link in der E-Mail, um dein
          Konto zu aktivieren.
        </p>
        <Link
          href="/login"
          className="mt-2 rounded-full bg-amber-500 px-6 py-3 font-semibold text-white shadow-md shadow-amber-500/25 transition hover:bg-amber-600 active:scale-[0.98]"
        >
          Zur Anmeldung
        </Link>
      </div>
    );
  }

  return (
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

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-stone-700"
        >
          Passwort
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mindestens 8 Zeichen"
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
        {submitting ? "Wird registriert …" : "Registrieren"}
      </button>

      <p className="text-center text-sm text-stone-500">
        Schon ein Konto?{" "}
        <Link
          href="/login"
          className="font-medium text-amber-600 hover:text-amber-700"
        >
          Anmelden
        </Link>
      </p>
    </form>
  );
}
