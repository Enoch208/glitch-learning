"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRightIcon, CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { ClayIcon } from "@/components/clay/clay-icon";
import { createTraceRecorder } from "@/engine/trace/recorder";
import type { SubtractionProblem } from "@/engine/math/truth";
import type { ReasoningTrace } from "@/events/trace";
import { cx } from "@/lib/cx";
import { PlaceValueTray } from "./place-value-tray";
import { useCue } from "@/lib/sound/use-cue";

type Step = "look" | "setup" | "answer" | "done";
type Place = "ones" | "tens";

const steps: Step[] = ["look", "setup", "answer"];
const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const onesOf = (value: number) => value % 10;
const tensOf = (value: number) => Math.floor(value / 10);

const prompts: Record<Step, string> = {
  look: "Look at the numbers.",
  setup: "Change the top row if you need to.",
  answer: "Now write your answer.",
  done: "Answer recorded.",
};

function DigitCell({
  value,
  original,
  showMark,
}: {
  value: number;
  original: number;
  showMark?: boolean;
}) {
  return (
    <span className="flex flex-col items-center">
      {showMark === true ? (
        <span
          className={cx(
            "h-6 font-mono text-caption text-ink-muted",
            value === original ? "opacity-0" : "line-through",
          )}
        >
          {original}
        </span>
      ) : null}
      <span className="flex h-16 w-14 items-center justify-center text-h1 text-ink tabular-nums">
        {value}
      </span>
    </span>
  );
}

function AdjustRow({
  letter,
  badgeTone,
  label,
  applied,
  onToggle,
  highlighted = false,
}: {
  letter: string;
  badgeTone: string;
  label: string;
  applied: boolean;
  onToggle: () => void;
  highlighted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={applied}
      className={cx(
        "clay-interactive flex min-h-16 w-full items-center gap-3 rounded-md px-3 text-left text-small font-bold shadow-clay-1 active:translate-y-px",
        applied ? "bg-violet-50 text-violet-600 ring-2 ring-violet-300" : "bg-surface text-ink",
      )}
    >
      <span
        className={cx(
          "flex size-9 shrink-0 items-center justify-center rounded-full text-small font-bold",
          applied ? "bg-violet-500 text-surface" : badgeTone,
          highlighted && !applied ? "animate-pulse ring-2 ring-violet-300" : "",
        )}
      >
        {applied ? <ClayIcon glyph={CheckIcon} size="sm" weight="bold" /> : letter}
      </span>
      <span className="flex-1">{label}</span>
    </button>
  );
}

export function SubtractionCanvas({
  problem,
  onComplete,
  guided = false,
}: {
  problem: SubtractionProblem;
  onComplete?: ((trace: ReasoningTrace) => void) | undefined;
  guided?: boolean;
}) {
  const cue = useCue();
  const recorder = useRef(createTraceRecorder(problem));
  const [step, setStep] = useState<Step>("look");
  const promptRef = useRef<HTMLParagraphElement>(null);
  const firstStep = useRef(true);

  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    promptRef.current?.focus();
  }, [step]);
  const [gaveTenOnes, setGaveTenOnes] = useState(false);
  const [tookOneTen, setTookOneTen] = useState(false);
  const [results, setResults] = useState<Record<Place, number | null>>({ ones: null, tens: null });
  const [activePlace, setActivePlace] = useState<Place>("ones");

  const startTens = tensOf(problem.minuend);
  const startOnes = onesOf(problem.minuend);
  const topOnes = gaveTenOnes ? startOnes + 10 : startOnes;
  const topTens = tookOneTen ? startTens - 1 : startTens;

  const toggleTenOnes = useCallback(() => {
    const next = !gaveTenOnes;
    if (next) recorder.current.record({ type: "borrow" });
    recorder.current.record({
      type: "digit_edit",
      place: "ones",
      value: next ? startOnes + 10 : startOnes,
    });
    setGaveTenOnes(next);
    cue("regroup");
  }, [gaveTenOnes, startOnes, cue]);

  const toggleOneTen = useCallback(() => {
    const next = !tookOneTen;
    recorder.current.record({
      type: "digit_edit",
      place: "tens",
      value: next ? startTens - 1 : startTens,
    });
    setTookOneTen(next);
    cue("regroup");
  }, [tookOneTen, startTens, cue]);

  const chooseDigit = useCallback(
    (digit: number) => {
      recorder.current.record({ type: "column_result", place: activePlace, value: digit });
      setResults((current) => {
        const updated = { ...current, [activePlace]: digit };
        setActivePlace(updated.ones === null ? "ones" : "tens");
        return updated;
      });
    },
    [activePlace],
  );

  const answer = useMemo(() => {
    if (results.tens === null || results.ones === null) return null;
    return results.tens * 10 + results.ones;
  }, [results]);

  const advance = useCallback(() => {
    cue("tap");
    if (step === "look") {
      setStep("setup");
      return;
    }
    if (step === "setup") {
      setStep("answer");
      return;
    }
    if (step === "answer" && answer !== null) {
      recorder.current.record({ type: "answer", value: answer });
      setStep("done");
      onComplete?.(recorder.current.complete(answer));
    }
  }, [step, answer, onComplete, cue]);

  const stepNumber = step === "done" ? steps.length : steps.indexOf(step) + 1;
  const ctaLabel = step === "answer" ? "Done" : step === "done" ? "Answer recorded" : "Next";
  const ctaDisabled = step === "done" || (step === "answer" && answer === null);

  return (
    <div className="flex w-full flex-col">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <p
          ref={promptRef}
          tabIndex={-1}
          aria-live="polite"
          className="text-body font-bold text-ink focus-visible:outline-none"
        >
          {prompts[step]}
        </p>
        <span className="font-mono text-caption text-ink-muted">
          {stepNumber}/{steps.length}
        </span>
      </div>

      <PlaceValueTray
        tens={topTens}
        ones={topOnes}
        startOnes={startOnes}
        tenBroken={tookOneTen}
        className="mt-4"
      />

      <div className="my-5 flex flex-col items-center gap-1">
        <div className="flex items-end gap-3">
          <span className="w-6" aria-hidden="true" />
          <DigitCell value={topTens} original={startTens} showMark />
          <DigitCell value={topOnes} original={startOnes} showMark />
        </div>

        <div className="flex items-center gap-3">
          <span className="w-6 text-center text-h1 text-ink-muted">&minus;</span>
          <DigitCell value={tensOf(problem.subtrahend)} original={tensOf(problem.subtrahend)} />
          <DigitCell value={onesOf(problem.subtrahend)} original={onesOf(problem.subtrahend)} />
        </div>

        <div className="my-3 ml-9 h-0.5 w-36 rounded-full bg-violet-200" />

        <div className="flex items-center gap-3">
          <span className="w-6" aria-hidden="true" />
          {(["tens", "ones"] as const).map((place) => (
            <button
              key={place}
              type="button"
              onClick={() => {
                setActivePlace(place);
              }}
              disabled={step !== "answer"}
              aria-label={`Answer for the ${place}`}
              className={cx(
                "clay-interactive flex h-16 w-14 items-center justify-center rounded-md text-h1 tabular-nums shadow-clay-1 active:translate-y-px disabled:opacity-60",
                step === "answer" && activePlace === place
                  ? "bg-violet-100 text-violet-600 ring-2 ring-violet-300"
                  : "bg-surface text-ink",
              )}
            >
              {results[place] ?? ""}
            </button>
          ))}
        </div>
      </div>

      {step === "setup" ? (
        <div>
          <div className="space-y-2">
            <AdjustRow
              letter="A"
              badgeTone="bg-mint-200 text-mint-700"
              label="Give the ones 10 more"
              applied={gaveTenOnes}
              onToggle={toggleTenOnes}
              highlighted={guided}
            />
            <AdjustRow
              letter="B"
              badgeTone="bg-peach-100 text-peach-700"
              label="Take 1 from the tens"
              applied={tookOneTen}
              onToggle={toggleOneTen}
            />
          </div>
          <p className="mt-3 text-center text-caption text-ink-muted">
            Tap again to undo. You can skip both.
          </p>
        </div>
      ) : null}

      {step === "answer" ? (
        <div className="flex flex-wrap justify-center gap-2">
          {digits.map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => {
                chooseDigit(digit);
              }}
              className="clay-interactive flex size-14 items-center justify-center rounded-md bg-surface text-h2 text-ink tabular-nums shadow-clay-1 hover:bg-violet-50 active:translate-y-px"
            >
              {digit}
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={advance}
        disabled={ctaDisabled}
        className="clay-interactive mt-6 flex h-14 w-full items-center justify-center rounded-full bg-linear-to-b from-violet-500 to-violet-600 pr-2 pl-6 font-bold text-surface shadow-clay-raised active:translate-y-px active:shadow-clay-pressed disabled:pointer-events-none disabled:opacity-45"
      >
        <span className="flex-1 text-center">{ctaLabel}</span>
        <span className="flex size-10 items-center justify-center rounded-full bg-surface text-violet-500">
          <ClayIcon glyph={ArrowRightIcon} size="sm" weight="bold" />
        </span>
      </button>
    </div>
  );
}
