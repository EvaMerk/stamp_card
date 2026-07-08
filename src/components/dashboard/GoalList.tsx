"use client";

import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
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
        className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-accent/40 bg-accent-soft p-5 text-accent-strong transition hover:border-accent/70"
      >
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-accent shadow-sm"
          aria-hidden="true"
        >
          <Plus size={22} weight="bold" />
        </span>
        <span className="text-sm font-semibold">Neues Ziel</span>
      </Link>
    </div>
  );
}
