import {
  ArrowsLeftRightIcon,
  HandPalmIcon,
  StackSimpleIcon,
  WaveTriangleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { ClayIcon, type ClayGlyph } from "@/components/clay/clay-icon";
import type { RuleGlyphName } from "@/lib/journey";

const glyphs: Record<RuleGlyphName, ClayGlyph> = {
  stack: StackSimpleIcon,
  swap: ArrowsLeftRightIcon,
  slip: WaveTriangleIcon,
  halt: HandPalmIcon,
};

export function RuleGlyph({ name, className }: { name: RuleGlyphName; className?: string }) {
  return (
    <span className="flex size-12 items-center justify-center rounded-md bg-surface shadow-clay-1">
      <ClayIcon glyph={glyphs[name]} size="md" weight="fill" className={className} />
    </span>
  );
}
