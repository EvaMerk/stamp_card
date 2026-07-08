"use client";

import { useState } from "react";
import Link from "next/link";
import { Mailbox } from "@phosphor-icons/react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/supabase/auth-errors";
import { inputClassName } from "@/components/ui/Input";

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
        <span className="bg-accent-soft flex h-14 w-14 items-center justify-center rounded-full text-accent-strong">
          <Mailbox size={28} weight="fill" aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl font-semibold text-ink">
          Fast geschafft!
        </h2>
        <p className="text-sm leading-6 text-ink-soft">
          Wir haben dir eine E-Mail an{" "}
          <span className="font-medium text-ink">{email}</span> geschickt.
          Bitte bestätige deine Adresse über den Link in der E-Mail, um dein
          Konto zu aktivieren.
        </p>
        <Link
          href="/login"
          className="mt-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-contrast shadow-md shadow-accent/25 transition hover:bg-accent-strong active:scale-[0.98]"
        >
          Zur Anmeldung
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink-soft">
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
          className={inputClassName}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-ink-soft"
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
        {submitting ? "Wird registriert …" : "Registrieren"}
      </button>

      <p className="text-center text-sm text-ink-soft">
        Schon ein Konto?{" "}
        <Link
          href="/login"
          className="font-medium text-accent-strong hover:underline"
        >
          Anmelden
        </Link>
      </p>
    </form>
  );
}
