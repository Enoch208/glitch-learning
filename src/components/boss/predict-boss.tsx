"use client";

import { useMemo, useState } from "react";
import { findCounterexamples } from "@/engine/counterexample/search";
import { solveByColumns, type SubtractionProblem } from "@/engine/math/truth";
import type { RuleProgram } from "@/engine/rules/ast";
import { runRule } from "@/engine/rules/interpreter";
import { cx } from "@/lib/cx";
import { useCue } from "@/lib/sound/use-cue";

const PREDICT_PICK = 6;

export function PredictBoss({
  rule,
  seen,
  onPredicted,
}: {
  rule: RuleProgram;
  seen: SubtractionProblem[];
  onPredicted: (problem: SubtractionProblem, predicted: number, bossAnswer: number) => void;
}) {
  const cue = useCue();
  const [picked, setPicked] = useState<number | null>(null);

  const round = useMemo(() => {
    const fresh = findCounterexamples(rule, 40).filter(
      (problem) =>
        !seen.some((s) => s.minuend === problem.minuend && s.subtrahend === problem.subtrahend),
    );
    const problem = fresh[PREDICT_PICK] ?? fresh[0] ?? { minuend: 43, subtrahend: 17 };
    const bossAnswer = runRule(rule, problem).answer;
    const truth = solveByColumns(problem).answer;
    const options = [...new Set([bossAnswer, truth, bossAnswer + 10])].sort((a, b) => a - b);
    return { problem, bossAnswer, options };
  }, [rule, seen]);

  const choose = (value: number) => {
    if (picked !== null) return;
    setPicked(value);
    cue("tap");
    onPredicted(round.problem, value, round.bossAnswer);
  };

  return (
    <section className="rounded-xl bg-surface p-5 shadow-clay-1">
      <p className="text-small font-bold text-ink">
        What will the boss say for {round.problem.minuend} &minus; {round.problem.subtrahend}?
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {round.options.map((value) => {
          const isBoss = value === round.bossAnswer;
          return (
            <button
              key={value}
              type="button"
              onClick={() => {
                choose(value);
              }}
              disabled={picked !== null}
              className={cx(
                "clay-interactive h-14 rounded-md text-h2 tabular-nums shadow-clay-1 active:translate-y-px",
                picked === null
                  ? "bg-surface text-ink"
                  : isBoss
                    ? "bg-coral-100 text-coral-700 ring-2 ring-coral-500"
                    : value === picked
                      ? "bg-violet-50 text-ink-muted"
                      : "bg-surface text-ink-muted",
              )}
            >
              {value}
            </button>
          );
        })}
      </div>
      {picked === null ? null : (
        <p className="mt-4 text-small text-ink-soft" aria-live="polite">
          {picked === round.bossAnswer
            ? "Yes. You can think like the boss now."
            : `The boss says ${String(round.bossAnswer)}. It follows its rule every time.`}
        </p>
      )}
    </section>
  );
}
