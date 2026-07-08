"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/supabase/auth-errors";
import { inputClassName } from "@/components/ui/Input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(authErrorMessage(signInError, "Anmeldung fehlgeschlagen."));
        return;
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(authErrorMessage(err, "Anmeldung fehlgeschlagen."));
    } finally {
      setSubmitting(false);
    }
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
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-medium text-ink-soft"
          >
            Passwort
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-accent-strong hover:underline"
          >
            Passwort vergessen?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        {submitting ? "Wird angemeldet …" : "Anmelden"}
      </button>

      <p className="text-center text-sm text-ink-soft">
        Noch kein Konto?{" "}
        <Link
          href="/signup"
          className="font-medium text-accent-strong hover:underline"
        >
          Jetzt registrieren
        </Link>
      </p>
    </form>
  );
}
