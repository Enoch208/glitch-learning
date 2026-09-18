import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react/dist/ssr";
import { ClayIcon } from "@/components/clay/clay-icon";

const stepButton =
  "clay-interactive flex size-11 items-center justify-center rounded-md bg-surface text-violet-500 shadow-clay-1 active:translate-y-px";

export function DigitStepper({
  value,
  min,
  label,
  onChange,
}: {
  value: number;
  min: number;
  label: string;
  onChange: (next: number) => void;
}) {
  const span = 10 - min;
  const shift = (delta: number) => {
    onChange(((value - min + delta + span) % span) + min);
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        aria-label={`${label} up`}
        onClick={() => {
          shift(1);
        }}
        className={stepButton}
      >
        <ClayIcon glyph={CaretUpIcon} size="md" weight="bold" />
      </button>
      <span
        aria-label={`${label} is ${String(value)}`}
        className="flex h-14 w-12 items-center justify-center text-h1 text-ink tabular-nums"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`${label} down`}
        onClick={() => {
          shift(-1);
        }}
        className={stepButton}
      >
        <ClayIcon glyph={CaretDownIcon} size="md" weight="bold" />
      </button>
    </div>
  );
}
