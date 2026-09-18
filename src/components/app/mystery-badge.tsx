import { QuestionIcon } from "@phosphor-icons/react/dist/ssr";
import { ClayIcon } from "@/components/clay/clay-icon";
import { cx } from "@/lib/cx";

const sizes = {
  sm: "size-12",
  lg: "size-24",
} as const;

export function MysteryBadge({
  size = "sm",
  className,
}: {
  size?: keyof typeof sizes;
  className?: string | undefined;
}) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "flex shrink-0 items-center justify-center rounded-full bg-surface text-violet-400 shadow-clay-2",
        sizes[size],
        className,
      )}
    >
      <ClayIcon glyph={QuestionIcon} size={size === "lg" ? "xl" : "md"} weight="bold" />
    </span>
  );
}
