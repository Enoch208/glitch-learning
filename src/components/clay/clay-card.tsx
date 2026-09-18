import type { HTMLAttributes } from "react";
import { cx } from "@/lib/cx";

const elevations = {
  flat: "shadow-none ring-1 ring-violet-50",
  low: "shadow-clay-1",
  medium: "shadow-clay-2",
  high: "shadow-clay-3",
} as const;

const paddings = {
  none: "",
  snug: "p-4",
  comfortable: "p-6",
  roomy: "p-8",
} as const;

export type ClayCardElevation = keyof typeof elevations;
export type ClayCardPadding = keyof typeof paddings;

export function ClayCard({
  elevation = "medium",
  padding = "comfortable",
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  elevation?: ClayCardElevation;
  padding?: ClayCardPadding;
}) {
  return (
    <div
      className={cx("rounded-xl bg-surface", elevations[elevation], paddings[padding], className)}
      {...rest}
    >
      {children}
    </div>
  );
}
