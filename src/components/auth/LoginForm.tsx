"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/supabase/auth-errors";

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
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-medium text-stone-700"
          >
            Passwort
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
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
        {submitting ? "Wird angemeldet …" : "Anmelden"}
      </button>

      <p className="text-center text-sm text-stone-500">
        Noch kein Konto?{" "}
        <Link
          href="/signup"
          className="font-medium text-amber-600 hover:text-amber-700"
        >
          Jetzt registrieren
        </Link>
      </p>
    </form>
  );
}
