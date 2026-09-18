import type { HTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import { toneInks, toneSurfaces, type ClayTone } from "./tones";

export function ClayTag({
  tone = "violet",
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: ClayTone }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-caption font-bold",
        toneSurfaces[tone],
        toneInks[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
