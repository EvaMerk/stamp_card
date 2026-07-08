"use client";

import Link from "next/link";
import { Target } from "@phosphor-icons/react";

/** Freundlicher Leerzustand fürs Dashboard, wenn noch keine Ziele existieren. */
export function EmptyState() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <span
        className="aura absolute left-1/2 top-8 h-56 w-56 -translate-x-1/2"
        aria-hidden="true"
      />
      <span
        className="relative flex h-20 w-20 rotate-[-8deg] items-center justify-center rounded-full bg-stamp text-stamp-check shadow-card"
        aria-hidden="true"
      >
        <Target size={40} weight="bold" />
      </span>
      <h2 className="relative font-display text-xl font-semibold tracking-tight text-ink">
        Noch keine Ziele — Zeit für dein erstes!
      </h2>
      <p className="relative max-w-sm text-sm leading-6 text-ink-soft">
        Leg ein Ziel an (z.B. 100x Sport in diesem Jahr) und sammle Stempel —
        Feld für Feld, Karte für Karte, bis zur Belohnung.
      </p>
      <Link
        href="/goals/new"
        className="relative mt-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast shadow-md shadow-accent/25 transition hover:bg-accent-strong active:scale-[0.98]"
      >
        Erstes Ziel anlegen
      </Link>
    </div>
  );
}
