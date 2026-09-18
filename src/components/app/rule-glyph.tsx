import Image, { type StaticImageData } from "next/image";
import flipFlopArt from "@/assets/clay/rule-flip-flop.webp";
import freeTenArt from "@/assets/clay/rule-free-ten.webp";
import { cx } from "@/lib/cx";
import { MysteryBadge } from "./mystery-badge";
import type { RuleGlyphName } from "@/lib/journey";

const art: Record<Exclude<RuleGlyphName, "found">, StaticImageData> = {
  stack: freeTenArt,
  swap: flipFlopArt,
};

const boxes = {
  sm: 30,
  md: 44,
  lg: 62,
} as const;

export type RuleArtSize = keyof typeof boxes;

export function RuleArt({
  name,
  size = "md",
  className,
}: {
  name: RuleGlyphName;
  size?: RuleArtSize;
  className?: string | undefined;
}) {
  if (name === "found") {
    return <MysteryBadge size={size === "lg" ? "lg" : "sm"} className={className} />;
  }

  const source = art[name];
  const box = boxes[size];
  const scale = Math.min(box / source.width, box / source.height);

  return (
    <Image
      src={source}
      alt=""
      width={Math.round(source.width * scale)}
      height={Math.round(source.height * scale)}
      className={className}
    />
  );
}

export function RuleChip({
  name,
  tone,
  className,
}: {
  name: RuleGlyphName;
  tone: string;
  className?: string | undefined;
}) {
  return (
    <span
      className={cx(
        "flex size-12 shrink-0 items-center justify-center rounded-sm",
        tone,
        className,
      )}
    >
      <RuleArt name={name} size="sm" />
    </span>
  );
}
