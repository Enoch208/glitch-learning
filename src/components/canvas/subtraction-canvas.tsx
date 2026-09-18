"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { createTraceRecorder } from "@/engine/trace/recorder";
import type { SubtractionProblem } from "@/engine/math/truth";
import type { ReasoningTrace } from "@/events/trace";
import { cx } from "@/lib/cx";

type Place = "ones" | "tens";

const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const onesOf = (value: number) => value % 10;
const tensOf = (value: number) => Math.floor(value / 10);

function DigitCell({
  value,
  original,
  onClick,
  label,
  showMarkSlot = false,
}: {
  value: number;
  original: number;
  onClick?: (() => void) | undefined;
  label?: string | undefined;
  showMarkSlot?: boolean;
}) {
  const changed = value !== original;
  const interactive = onClick !== undefined;

  return (
    <div className="flex flex-col items-center">
      {showMarkSlot ? (
        <span
          className={cx(
            "h-6 font-mono text-caption text-ink-muted",
            changed ? "line-through" : "opacity-0",
          )}
        >
          {original}
        </span>
      ) : null}
      {interactive ? (
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          className="clay-interactive flex h-16 w-14 items-center justify-center rounded-md bg-surface text-h1 text-ink shadow-clay-1 hover:bg-violet-50 active:translate-y-px"
        >
          {value}
        </button>
      ) : (
        <span className="flex h-16 w-14 items-center justify-center text-h1 text-ink">{value}</span>
      )}
    </div>
  );
}

export function SubtractionCanvas({
  problem,
  onComplete,
}: {
  problem: SubtractionProblem;
  onComplete?: ((trace: ReasoningTrace) => void) | undefined;
}) {
  const recorder = useRef(createTraceRecorder(problem));
  const [topTens, setTopTens] = useState(() => tensOf(problem.minuend));
  const [topOnes, setTopOnes] = useState(() => onesOf(problem.minuend));
  const [results, setResults] = useState<Record<Place, number | null>>({ ones: null, tens: null });
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const startTens = tensOf(problem.minuend);
  const startOnes = onesOf(problem.minuend);
  const bottomTens = tensOf(problem.subtrahend);
  const bottomOnes = onesOf(problem.subtrahend);

  const borrowTen = useCallback(() => {
    if (submitted || topOnes >= 10) return;
    const next = topOnes + 10;
    recorder.current.record({ type: "borrow" });
    recorder.current.record({ type: "digit_edit", place: "ones", value: next });
    setTopOnes(next);
  }, [submitted, topOnes]);

  const decrementTens = useCallback(() => {
    if (submitted || topTens <= 0) return;
    const next = topTens - 1;
    recorder.current.record({ type: "digit_edit", place: "tens", value: next });
    setTopTens(next);
  }, [submitted, topTens]);

  const chooseDigit = useCallback(
    (digit: number) => {
      if (activePlace === null || submitted) return;
      recorder.current.record({ type: "column_result", place: activePlace, value: digit });
      setResults((current) => ({ ...current, [activePlace]: digit }));
      setActivePlace(null);
    },
    [activePlace, submitted],
  );

  const answer = useMemo(() => {
    if (results.tens === null || results.ones === null) return null;
    return results.tens * 10 + results.ones;
  }, [results]);

  const submit = useCallback(() => {
    if (answer === null || submitted) return;
    recorder.current.record({ type: "answer", value: answer });
    setSubmitted(true);
    onComplete?.(recorder.current.complete(answer));
  }, [answer, submitted, onComplete]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-end gap-1">
        <div className="flex gap-3">
          <DigitCell
            value={topTens}
            original={startTens}
            onClick={submitted ? undefined : decrementTens}
            label="Take one ten from the tens column"
            showMarkSlot
          />
          <DigitCell
            value={topOnes}
            original={startOnes}
            onClick={submitted ? undefined : borrowTen}
            label="Bring ten ones into the ones column"
            showMarkSlot
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="pr-2 text-h1 text-ink-muted">&minus;</span>
          <DigitCell value={bottomTens} original={bottomTens} />
          <DigitCell value={bottomOnes} original={bottomOnes} />
        </div>

        <div className="my-3 h-0.5 w-44 rounded-full bg-violet-200" />

        <div className="flex gap-3">
          {(["tens", "ones"] as const).map((place) => (
            <button
              key={place}
              type="button"
              onClick={() => {
                if (!submitted) setActivePlace(place);
              }}
              aria-label={`Answer for the ${place} column`}
              className={cx(
                "clay-interactive flex h-16 w-14 items-center justify-center rounded-md text-h1 shadow-clay-1 active:translate-y-px",
                activePlace === place ? "bg-violet-100 text-violet-600" : "bg-surface text-ink",
              )}
            >
              {results[place] ?? ""}
            </button>
          ))}
        </div>
      </div>

      {activePlace !== null ? (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {digits.map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => {
                chooseDigit(digit);
              }}
              className="clay-interactive flex h-12 w-12 items-center justify-center rounded-sm bg-surface text-h2 text-ink shadow-clay-1 hover:bg-violet-50 active:translate-y-px"
            >
              {digit}
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={submit}
        disabled={answer === null || submitted}
        className="clay-interactive mt-8 inline-flex h-12 items-center justify-center rounded-md bg-linear-to-b from-violet-400 to-violet-500 px-7 font-bold text-surface shadow-clay-raised active:translate-y-px active:shadow-clay-pressed disabled:pointer-events-none disabled:opacity-45"
      >
        {submitted ? "Answer recorded" : "Done"}
      </button>
    </div>
  );
}
