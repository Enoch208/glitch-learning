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
    return `Ten ones appeared, but no ten left the tens. ${String(problem.minuend)} became ${String(value)}.`;
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
  const valueChanged = value !== problem.minuend;
  const tensKept = run.tensTop === startTens;

  return (
    <section className="rounded-xl bg-coral-100 p-4">
      <p className="text-caption font-bold tracking-widest text-coral-700 uppercase">
        This boss learned your rule
      </p>
      <p className="mt-2 font-mono text-h2 text-ink tabular-nums">
        {problem.minuend} &minus; {problem.subtrahend} &rarr;{" "}
        {beat >= REVEAL_BEATS.glitch ? run.answer : "…"}
      </p>
      <PlaceValueTray
        tens={acted ? run.tensTop : startTens}
        ones={acted ? run.onesTop : startOnes}
        startOnes={startOnes}
        tenBroken={run.tensTop < startTens}
        glitching={glitching && valueChanged}
        className="mt-3 bg-surface"
      />
      {!valueChanged && beat >= REVEAL_BEATS.glitch ? (
        <FlippedOnes problem={problem} glitching={glitching} className="mt-2" />
      ) : null}
      {beat >= REVEAL_BEATS.glitch ? (
        <p
          className={cx(
            "mt-2 text-small font-bold text-coral-700",
            glitching && valueChanged ? "glitch-fringe" : "",
          )}
        >
          {caption(problem, value, tensKept)}
        </p>
      ) : null}
    </section>
  );
}
