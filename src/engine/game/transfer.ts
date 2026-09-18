import { findCounterexamples } from "@/engine/counterexample/search";
import { solveByColumns, type SubtractionProblem } from "@/engine/math/truth";
import { observationFromTrace } from "@/engine/learner/observation";
import type { RuleProgram } from "@/engine/rules/ast";
import type { ReasoningTrace } from "@/events/trace";

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

export type TransferCheck = { answerRight: boolean; stepsRight: boolean; passed: boolean };

export function checkTransfer(trace: ReasoningTrace): TransferCheck {
  const truth = solveByColumns(trace.problem);
  const { answer, steps } = observationFromTrace(trace);
  const answerRight = answer === truth.answer;
  const stepsRight = steps.onesTop === truth.onesTop && steps.tensTop === truth.tensTop;
  return { answerRight, stepsRight, passed: answerRight && stepsRight };
}
