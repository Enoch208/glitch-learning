import { findCounterexamples } from "@/engine/counterexample/search";
import { solveByColumns, type SubtractionProblem } from "@/engine/math/truth";
import type { RuleProgram } from "@/engine/rules/ast";

const SEARCH_DEPTH = 400;
const STRIDE = 37;

const same = (a: SubtractionProblem, b: SubtractionProblem) =>
  a.minuend === b.minuend && a.subtrahend === b.subtrahend;

export function transferProblem(
  rule: RuleProgram,
  seen: SubtractionProblem[],
  attempt: number,
): SubtractionProblem {
  const unseen = findCounterexamples(rule, SEARCH_DEPTH).filter(
    (problem) => !seen.some((earlier) => same(earlier, problem)),
  );
  const chosen = unseen[(attempt * STRIDE) % Math.max(unseen.length, 1)];
  if (chosen === undefined) throw new RangeError("no unseen problem breaks this rule");
  return chosen;
}

export const transferPassed = (problem: SubtractionProblem, answer: number): boolean =>
  answer === solveByColumns(problem).answer;
