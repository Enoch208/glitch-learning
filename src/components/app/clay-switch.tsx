import { cx } from "@/lib/cx";

export function ClaySwitch({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={cx(
        "clay-interactive flex h-8 w-14 shrink-0 items-center rounded-full px-1",
        on ? "bg-violet-500 shadow-clay-pressed" : "bg-violet-100",
      )}
    >
      <span
        className={cx(
          "size-6 rounded-full bg-surface shadow-clay-1 transition-transform duration-200 ease-clay",
          on ? "translate-x-6" : "translate-x-0",
        )}
      />
    </button>
  );
}
