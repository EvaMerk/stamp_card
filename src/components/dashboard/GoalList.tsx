"use client";

import Link from "next/link";
import type { Goal } from "@/lib/goals/types";
import { GoalCard } from "./GoalCard";

/**
 * Responsives Grid aller Ziel-Kacheln + "+ Neues Ziel"-Kachel.
 */
export function GoalList({ goals }: { goals: Goal[] }) {
  return (
    <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}

      <Link
        href="/goals/new"
        className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-5 text-amber-700 transition hover:border-amber-400 hover:bg-amber-50"
      >
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl font-bold text-amber-500 shadow-sm"
          aria-hidden="true"
        >
          +
        </span>
        <span className="text-sm font-semibold">Neues Ziel</span>
      </Link>
    </div>
  );
}
