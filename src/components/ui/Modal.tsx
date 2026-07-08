"use client";

import { useEffect } from "react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * Simples Modal (z.B. für Lösch-Bestätigungen): Overlay + Karte im
 * „Ticket & Tinte“-Stil. Schließt per Escape und Klick auf den Hintergrund.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-[20px] border border-hairline bg-surface p-6 shadow-card">
        <span className="aura absolute -right-10 -top-10 h-36 w-36" aria-hidden="true" />
        <h2 className="relative mb-3 font-display text-xl font-bold tracking-tight text-ink">
          {title}
        </h2>
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
