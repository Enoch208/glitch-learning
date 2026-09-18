import type { Icon, IconWeight } from "@phosphor-icons/react";

export type ClayGlyph = Icon;

const glyphSizes = {
  sm: 18,
  md: 22,
  nav: 26,
  lg: 28,
  xl: 36,
} as const;

export type ClayIconSize = keyof typeof glyphSizes;

export function ClayIcon({
  glyph: Glyph,
  size = "md",
  weight = "duotone",
  className,
}: {
  glyph: ClayGlyph;
  size?: ClayIconSize;
  weight?: IconWeight;
  className?: string | undefined;
}) {
  return <Glyph size={glyphSizes[size]} weight={weight} className={className} />;
}
