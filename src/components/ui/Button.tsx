"use client";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-amber-500 text-white shadow-md shadow-amber-500/25 hover:bg-amber-600",
  secondary:
    "border border-stone-200 bg-white text-stone-600 shadow-sm hover:border-amber-300 hover:text-amber-700",
  danger: "bg-red-500 text-white shadow-md shadow-red-500/25 hover:bg-red-600",
  ghost: "text-stone-500 hover:bg-stone-100 hover:text-stone-700",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

/** Pillen-Button im Punchcard-Look (analog LoginForm/LogoutButton). */
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
