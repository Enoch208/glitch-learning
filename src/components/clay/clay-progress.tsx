import type { CSSProperties } from "react";
import { cx } from "@/lib/cx";

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

export function ClayProgress({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const percent = clampPercent(value);

  return (
    <div
      className={cx("h-2.5 w-full overflow-hidden rounded-full bg-violet-50", className)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="clay-progress-fill h-full rounded-full bg-linear-to-r from-violet-400 to-violet-500 clay-fill-transition"
        style={{ "--clay-progress": `${String(percent)}%` } as CSSProperties}
      />
    </div>
  );
}
