"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { GoalList } from "@/components/dashboard/GoalList";
import { OverviewPanel } from "@/components/overview/OverviewPanel";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { useGoals } from "@/hooks/useGoals";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "ziele", label: "Ziele" },
  { key: "uebersicht", label: "Übersicht" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function DashboardContent() {
  const { user } = useAuth();
  const { goals, loading, error } = useGoals();

  // Tab-Zustand lebt client-seitig; ?tab= hält ihn über Reloads hinweg.
  // useSearchParams nur für den Initialwert — Updates laufen über
  // history.replaceState (kein Navigations-Roundtrip, kein Back-Stack-Müll).
  const searchParams = useSearchParams();
  const initialTab: TabKey =
    searchParams.get("tab") === "uebersicht" ? "uebersicht" : "ziele";
  const [tab, setTab] = useState<TabKey>(initialTab);
  // Übersicht (mit Plotly-Chart) erst beim ersten Aktivieren mounten —
  // gleiche Begründung wie das Analytics-Panel der GoalCard.
  const [overviewMounted, setOverviewMounted] = useState(
    initialTab === "uebersicht",
  );

  function switchTab(next: TabKey) {
    if (next === "uebersicht") setOverviewMounted(true);
    setTab(next);
    window.history.replaceState(
      window.history.state,
      "",
      next === "ziele" ? "/dashboard" : "/dashboard?tab=uebersicht",
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 rotate-[-6deg] items-center justify-center rounded-xl border-2 border-dashed border-amber-400 bg-amber-100 text-xl"
            aria-hidden="true"
          >
            🏅
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-800">
              Meine Ziele
            </h1>
            {user?.email && (
              <p className="text-xs text-stone-500">{user.email}</p>
            )}
          </div>
        </div>
        <LogoutButton />
      </header>

      <div
        className="mx-auto mb-8 grid w-full max-w-sm grid-cols-2 gap-1 rounded-2xl bg-stone-100 p-1"
        role="tablist"
        aria-label="Dashboard-Ansicht"
      >
        {TABS.map(({ key, label }) => {
          const selected = tab === key;
          return (
            <button
              key={key}
              id={`tab-${key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`tabpanel-${key}`}
              onClick={() => switchTab(key)}
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-medium transition",
                selected
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-stone-500 hover:text-stone-700",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <main className="flex flex-1 flex-col">
        <div
          id="tabpanel-ziele"
          role="tabpanel"
          aria-labelledby="tab-ziele"
          className={cn("flex flex-1 flex-col", tab !== "ziele" && "hidden")}
        >
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner label="Ziele werden geladen …" />
            </div>
          ) : error ? (
            <p
              className="mx-auto max-w-md rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : goals.length === 0 ? (
            <EmptyState />
          ) : (
            <GoalList goals={goals} />
          )}
        </div>

        {overviewMounted && (
          <div
            id="tabpanel-uebersicht"
            role="tabpanel"
            aria-labelledby="tab-uebersicht"
            className={cn(
              "flex flex-1 flex-col",
              tab !== "uebersicht" && "hidden",
            )}
          >
            <OverviewPanel active={tab === "uebersicht"} />
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="flex min-h-dvh items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </AuthGuard>
  );
}
