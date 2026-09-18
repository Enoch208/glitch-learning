import Link from "next/link";
import { CheckIcon, LockSimpleIcon, PlayIcon } from "@phosphor-icons/react/dist/ssr";
import { ClayIcon } from "@/components/clay/clay-icon";
import { cx } from "@/lib/cx";
import type { JourneyStage } from "@/lib/journey";

const badgeTones = {
  done: "bg-mint-200 text-mint-700",
  active: "bg-violet-500 text-surface",
  locked: "bg-violet-50 text-ink-muted",
} as const;

const trailing = {
  done: { glyph: CheckIcon, className: "bg-mint-200 text-mint-700" },
  active: { glyph: PlayIcon, className: "bg-violet-500 text-surface" },
  locked: { glyph: LockSimpleIcon, className: "bg-violet-50 text-ink-muted" },
} as const;

function StageBody({ stage }: { stage: JourneyStage }) {
  const mark = trailing[stage.status];

  return (
    <>
      <span
        className={cx(
          "flex size-10 shrink-0 items-center justify-center rounded-sm text-body font-bold",
          badgeTones[stage.status],
        )}
      >
        {stage.index}
      </span>
      <span className="flex-1">
        <span
          className={cx(
            "block text-small font-bold",
            stage.status === "locked" ? "text-ink-muted" : "text-ink",
          )}
        >
          {stage.title}
        </span>
        <span className="block text-caption text-ink-muted">{stage.detail}</span>
      </span>
      <span className={cx("flex size-8 items-center justify-center rounded-full", mark.className)}>
        <ClayIcon glyph={mark.glyph} size="sm" weight="fill" />
      </span>
    </>
  );
}

export function StageRow({ stage }: { stage: JourneyStage }) {
  const shell =
    "flex items-center gap-3 rounded-md p-3 " +
    (stage.status === "active"
      ? "bg-violet-50 ring-1 ring-violet-200"
      : "bg-surface shadow-clay-1");

  if (stage.status === "active" && stage.href !== undefined) {
    return (
      <Link href={stage.href} className={cx(shell, "clay-interactive active:translate-y-px")}>
        <StageBody stage={stage} />
      </Link>
    );
  }

  return (
    <div className={shell} aria-disabled={stage.status === "locked"}>
      <StageBody stage={stage} />
    </div>
  );
}
