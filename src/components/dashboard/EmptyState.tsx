"use client";

import Link from "next/link";

/** Freundlicher Leerzustand fürs Dashboard, wenn noch keine Ziele existieren. */
export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <span
        className="flex h-20 w-20 rotate-[-6deg] items-center justify-center rounded-3xl border-2 border-dashed border-amber-300 bg-amber-50 text-4xl"
        aria-hidden="true"
      >
        🎯
      </span>
      <h2 className="text-lg font-semibold text-stone-700">
        Noch keine Ziele — Zeit für dein erstes!
      </h2>
      <p className="max-w-sm text-sm leading-6 text-stone-500">
        Leg ein Ziel an (z.B. 100x Sport in diesem Jahr) und sammle Stempel —
        Feld für Feld, Karte für Karte, bis zur Belohnung.
      </p>
      <Link
        href="/goals/new"
        className="mt-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition hover:bg-amber-600 active:scale-[0.98]"
      >
        Erstes Ziel anlegen
      </Link>
    </div>
  );
}
