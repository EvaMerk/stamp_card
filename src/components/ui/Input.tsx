"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** Gemeinsamer Look für Text-Eingaben: Pillenform, Tokens aus globals.css. */
export const inputClassName =
  "rounded-full border border-hairline bg-surface px-4 py-2.5 text-ink shadow-sm outline-none transition placeholder:text-ink-faint focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:cursor-not-allowed disabled:bg-sunken disabled:text-ink-faint";

/** Textarea-Variante: Pillenform funktioniert mehrzeilig nicht — großzügiger Radius. */
export const textareaClassName = inputClassName.replace(
  "rounded-full",
  "rounded-3xl",
);

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
        <label htmlFor={inputId} className="text-sm font-medium text-ink-soft">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(inputClassName, error && "border-danger/50", className)}
        {...props}
      />
      {hint && !error && <p className="text-xs text-ink-faint">{hint}</p>}
      {error && (
        <p className="text-xs text-danger" role="alert">
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
        <label htmlFor={inputId} className="text-sm font-medium text-ink-soft">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={cn(
          textareaClassName,
          "resize-y",
          error && "border-danger/50",
          className,
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-ink-faint">{hint}</p>}
      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
