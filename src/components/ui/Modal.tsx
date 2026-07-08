"use client";

import { useEffect } from "react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * Simples Modal (z.B. für Lösch-Bestätigungen): Overlay + weiße Karte im
 * App-Stil. Schließt per Escape und Klick auf den Hintergrund.
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
        className="absolute inset-0 bg-stone-900/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-3xl border border-amber-100 bg-white p-6 shadow-xl shadow-amber-900/10">
        <h2 className="mb-3 text-lg font-bold tracking-tight text-stone-800">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
