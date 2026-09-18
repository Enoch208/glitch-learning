import type { HTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import { ClayIcon, type ClayGlyph } from "./clay-icon";
import { toneAccents, toneSurfaces, type ClayTone } from "./tones";

export function ClayTile({
  glyph,
  label,
  tone = "violet",
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  glyph: ClayGlyph;
  label: string;
  tone?: ClayTone;
}) {
  return (
    <div
      className={cx(
        "flex aspect-square flex-col items-center justify-center gap-3 rounded-xl px-3 shadow-clay-1 clay-interactive hover:-translate-y-1 hover:shadow-clay-2",
        toneSurfaces[tone],
        className,
      )}
      {...rest}
    >
      <ClayIcon glyph={glyph} size="xl" weight="fill" className={toneAccents[tone]} />
      <span className="text-small font-bold text-ink">{label}</span>
    </div>
  );
}
