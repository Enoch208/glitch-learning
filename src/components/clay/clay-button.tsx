import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";

const base =
  "inline-flex items-center justify-center font-bold clay-interactive active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:pointer-events-none disabled:opacity-45";

const variants = {
  primary:
    "bg-linear-to-b from-violet-400 to-violet-500 text-surface shadow-clay-raised hover:from-violet-300 hover:to-violet-400 active:shadow-clay-pressed",
  secondary: "bg-violet-50 text-violet-600 shadow-clay-1 hover:bg-violet-100",
  ghost: "bg-surface text-ink-soft shadow-clay-1 hover:bg-surface-sunken",
} as const;

const sizes = {
  sm: "h-10 gap-2 rounded-sm px-4 text-small",
  md: "h-12 gap-2 rounded-md px-5 text-body",
  lg: "h-14 gap-3 rounded-lg px-7 text-body",
} as const;

export type ClayButtonVariant = keyof typeof variants;
export type ClayButtonSize = keyof typeof sizes;

export function ClayButton({
  variant = "primary",
  size = "md",
  leading,
  trailing,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ClayButtonVariant;
  size?: ClayButtonSize;
  leading?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <button className={cx(base, variants[variant], sizes[size], className)} {...rest}>
      {leading}
      {children}
      {trailing}
    </button>
  );
}
