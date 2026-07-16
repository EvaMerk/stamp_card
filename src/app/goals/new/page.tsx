"use client";

import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { GoalForm } from "@/components/goals/GoalForm";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export default function NewGoalPage() {
  const { t } = useTranslation();
  return (
    <AuthGuard>
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-8">
        <header className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            {t("goal.backToDashboard")}
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-stone-800">
            {t("goal.new.title")}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {t("goal.new.subtitle")}
          </p>
        </header>

        <main className="rounded-3xl border border-amber-100 bg-white p-6 shadow-xl shadow-amber-900/5 sm:p-8">
          <GoalForm />
        </main>
      </div>
    </AuthGuard>
  );
}
