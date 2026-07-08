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

/**
 * Zielseite des Recovery-Links aus der "Passwort vergessen"-E-Mail.
 * Der Supabase-Browser-Client tauscht den Code aus der URL automatisch gegen
 * eine Session (detectSessionInUrl); sobald die Session da ist, kann das neue
 * Passwort über updateUser gesetzt werden.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
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
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(
          authErrorMessage(updateError, "Passwort konnte nicht geändert werden."),
        );
        return;
      }
      setDone(true);
      setTimeout(() => router.replace("/dashboard"), 2000);
    } catch (err) {
      setError(authErrorMessage(err, "Passwort konnte nicht geändert werden."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <Spinner label="Link wird geprüft …" />;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="bg-danger-soft flex h-14 w-14 items-center justify-center rounded-full text-danger">
          <Warning size={28} weight="fill" aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl font-semibold text-ink">
          Link ungültig oder abgelaufen
        </h2>
        <p className="text-sm leading-6 text-ink-soft">
          Bitte fordere einen neuen Link zum Zurücksetzen deines Passworts an.
        </p>
        <Link
          href="/forgot-password"
          className="mt-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-contrast shadow-md shadow-accent/25 transition hover:bg-accent-strong active:scale-[0.98]"
        >
          Neuen Link anfordern
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
          Passwort geändert!
        </h2>
        <p className="text-sm leading-6 text-ink-soft">
          Du wirst gleich zu deinem Dashboard weitergeleitet …
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-6 text-center font-display text-2xl font-semibold tracking-tight text-ink">
        Neues Passwort festlegen
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-ink-soft"
          >
            Neues Passwort
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

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="passwordConfirm"
            className="text-sm font-medium text-ink-soft"
          >
            Passwort wiederholen
          </label>
          <input
            id="passwordConfirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="••••••••"
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
          {submitting ? "Wird gespeichert …" : "Passwort speichern"}
        </button>
      </form>
    </>
  );
}
