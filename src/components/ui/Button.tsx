"use client";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-contrast shadow-md shadow-accent/25 hover:bg-accent-strong",
  secondary:
    "border border-hairline bg-surface text-ink-soft shadow-sm hover:border-accent/50 hover:text-accent-strong",
  danger: "bg-danger text-accent-contrast shadow-md shadow-danger/25 hover:opacity-90",
  ghost: "text-ink-soft hover:bg-sunken hover:text-ink",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

/** Pillen-Button im „Ticket & Tinte“-Look (Tokens aus globals.css). */
export function Button({
  variant = "primary",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
