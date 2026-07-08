"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** Gemeinsamer Look für Text-Eingaben (analog LoginForm). */
export const inputClassName =
  "rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400";

interface FieldChromeProps {
  label?: string;
  hint?: string;
  error?: string;
}

export interface InputProps
  extends React.ComponentPropsWithRef<"input">,
    FieldChromeProps {}

/** Label + Input + Fehlermeldung im App-Stil. Ref-kompatibel mit react-hook-form. */
export function Input({
  label,
  hint,
  error,
  id,
  className,
  ...props
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(inputClassName, error && "border-red-300", className)}
        {...props}
      />
      {hint && !error && <p className="text-xs text-stone-500">{hint}</p>}
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export interface TextareaProps
  extends React.ComponentPropsWithRef<"textarea">,
    FieldChromeProps {}

/** Mehrzeilige Variante von {@link Input}. */
export function Textarea({
  label,
  hint,
  error,
  id,
  className,
  rows = 3,
  ...props
}: TextareaProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={cn(
          inputClassName,
          "resize-y",
          error && "border-red-300",
          className,
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-stone-500">{hint}</p>}
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
