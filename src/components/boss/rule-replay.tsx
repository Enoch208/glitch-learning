"use client";

import { PlaceValueTray } from "@/components/canvas/place-value-tray";
import { FlippedOnes } from "./flipped-ones";
import type { RuleProgram } from "@/engine/rules/ast";
import { runRule } from "@/engine/rules/interpreter";
import type { SubtractionProblem } from "@/engine/math/truth";
import { cx } from "@/lib/cx";

export const REVEAL_BEATS = { acted: 1, glitch: 2, embodied: 3, settled: 4 } as const;

function caption(problem: SubtractionProblem, value: number, tensKept: boolean) {
  if (value !== problem.minuend && tensKept) {
    return "Ten ones appeared. The tens never paid.";
  }
  if (value !== problem.minuend) {
    return `The pieces no longer add up to ${String(problem.minuend)}.`;
  }
  return "It flipped the ones so it would not have to regroup.";
}

export function RuleReplay({
  problem,
  rule,
  beat,
}: {
  problem: SubtractionProblem;
  rule: RuleProgram;
  beat: number;
}) {
  const run = runRule(rule, problem);
  const startTens = Math.floor(problem.minuend / 10);
  const startOnes = problem.minuend % 10;
  const acted = beat >= REVEAL_BEATS.acted;
  const glitching = beat === REVEAL_BEATS.glitch;
  const value = run.tensTop * 10 + run.onesTop;
  const startValue = problem.minuend;
  const valueChanged = value !== startValue;
  const tensKept = run.tensTop === startTens;
  const showRule = acted;
  const tens = showRule ? run.tensTop : startTens;
  const ones = showRule ? run.onesTop : startOnes;
  const worth = tens * 10 + ones;

  return (
    <section className="rounded-xl bg-coral-100 p-4">
      <p className="text-caption font-bold tracking-widest text-coral-700 uppercase">
        {beat >= REVEAL_BEATS.embodied ? "This boss learned your rule" : "Watch the steps"}
      </p>
      <p className="mt-2 font-mono text-h2 text-ink tabular-nums">
        {problem.minuend} &minus; {problem.subtrahend}
        {beat >= REVEAL_BEATS.glitch ? ` \u2192 ${String(run.answer)}` : ""}
      </p>
      <PlaceValueTray
        tens={tens}
        ones={ones}
        startOnes={startOnes}
        tenBroken={showRule && run.tensTop < startTens}
        glitching={glitching && valueChanged}
        hideWorth
        className="mt-3 bg-surface"
      />
      <p
        className={cx(
          "mt-3 text-center font-mono text-h2 tabular-nums",
          glitching && valueChanged ? "glitch-fringe text-coral-700" : "text-ink",
          worth !== startValue ? "text-coral-700" : "",
        )}
        aria-live="polite"
      >
        {String(tens)} {tens === 1 ? "ten" : "tens"} + {String(ones)} {ones === 1 ? "one" : "ones"}{" "}
        = {String(worth)}
      </p>
      {!valueChanged && beat >= REVEAL_BEATS.glitch ? (
        <FlippedOnes problem={problem} glitching={glitching} className="mt-2" />
      ) : null}
      {beat >= REVEAL_BEATS.glitch ? (
        <p className="mt-2 text-center text-small font-bold text-coral-700">
          {caption(problem, value, tensKept)}
        </p>
      ) : null}
    </section>
  );
}
