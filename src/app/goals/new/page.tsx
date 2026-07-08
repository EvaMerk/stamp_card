"use client";

import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { GoalForm } from "@/components/goals/GoalForm";

export default function NewGoalPage() {
  return (
    <AuthGuard>
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-8">
        <header className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            ← Zurück zum Dashboard
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-stone-800">
            Neues Ziel anlegen
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Definiere dein Ziel und deine Stempelkarten — los geht’s!
          </p>
        </header>

        <main className="rounded-3xl border border-amber-100 bg-white p-6 shadow-xl shadow-amber-900/5 sm:p-8">
          <GoalForm />
        </main>
      </div>
    </AuthGuard>
  );
}
