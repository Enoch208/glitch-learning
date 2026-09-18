import { blockSize, dividerLines, type BlockValue } from "@/engine/blocks/geometry";
import { cx } from "@/lib/cx";

export const BLOCK_UNIT = 22;

const tones = {
  1: { body: "fill-violet-300 stroke-violet-500", divider: "stroke-violet-500" },
  10: { body: "fill-mint-200 stroke-mint-500", divider: "stroke-mint-500" },
  100: { body: "fill-peach-100 stroke-peach-500", divider: "stroke-peach-500" },
} as const;

export function BaseTenBlock({
  value,
  unit = BLOCK_UNIT,
  className,
}: {
  value: BlockValue;
  unit?: number;
  className?: string | undefined;
}) {
  const { width, height } = blockSize(value, unit);
  const tone = tones[value];
  const radius = Math.round(unit * 0.3);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${String(width)} ${String(height)}`}
      className={cx("drop-shadow-block", className)}
      role="presentation"
    >
      <rect
        x={0.75}
        y={0.75}
        width={width - 1.5}
        height={height - 1.5}
        rx={radius}
        className={tone.body}
        strokeWidth={1.5}
      />
      {dividerLines(value, unit).map((line) => (
        <line
          key={`${String(line.x1)}-${String(line.y1)}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          className={tone.divider}
          strokeWidth={1}
          strokeOpacity={0.4}
        />
      ))}
    </svg>
  );
}
