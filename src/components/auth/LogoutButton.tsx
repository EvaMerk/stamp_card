"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleLogout() {
    setSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Abmelden fehlgeschlagen:", err);
    } finally {
      router.replace("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={submitting}
      className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 shadow-sm transition hover:border-amber-300 hover:text-amber-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {submitting ? "Wird abgemeldet …" : "Abmelden"}
    </button>
  );
}
