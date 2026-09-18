import { describe, expect, test } from "vitest";
import { checkTransfer, transferProblem } from "@/engine/game/transfer";
import { freeTenRule } from "@/engine/rules/known-rules";
import { runRule } from "@/engine/rules/interpreter";
import {
  isTwoDigitSubtraction,
  solveByColumns,
  type SubtractionProblem,
} from "@/engine/math/truth";
import { createTraceRecorder } from "@/engine/trace/recorder";

function traceOf(problem: SubtractionProblem, onesTop: number, tensTop: number, answer: number) {
  const recorder = createTraceRecorder(problem, () => 0);
  recorder.record({ type: "digit_edit", place: "ones", value: onesTop });
  recorder.record({ type: "digit_edit", place: "tens", value: tensTop });
  return recorder.complete(answer);
}

describe("transfer", () => {
  const seen = [
    { minuend: 52, subtrahend: 28 },
    { minuend: 31, subtrahend: 15 },
  ];

  test("the transfer problem is new, valid and still breaks the rule", () => {
    const problem = transferProblem(freeTenRule, seen, 1);
    expect(seen).not.toContainEqual(problem);
    expect(isTwoDigitSubtraction(problem)).toBe(true);
    expect(runRule(freeTenRule, problem).answer).not.toBe(solveByColumns(problem).answer);
  });

  test("the second attempt gets a different problem from the first", () => {
    expect(transferProblem(freeTenRule, seen, 2)).not.toEqual(
      transferProblem(freeTenRule, seen, 1),
    );
  });

  test("passing needs the true answer and the true regrouping", () => {
    const problem = transferProblem(freeTenRule, seen, 1);
    const truth = solveByColumns(problem);
    const glitch = runRule(freeTenRule, problem);
    expect(checkTransfer(traceOf(problem, truth.onesTop, truth.tensTop, truth.answer)).passed).toBe(
      true,
    );
    expect(
      checkTransfer(traceOf(problem, glitch.onesTop, glitch.tensTop, glitch.answer)).passed,
    ).toBe(false);
  });

  test("the right answer with Free Ten steps does not pass", () => {
    const problem = transferProblem(freeTenRule, seen, 1);
    const truth = solveByColumns(problem);
    const glitch = runRule(freeTenRule, problem);
    const check = checkTransfer(traceOf(problem, glitch.onesTop, glitch.tensTop, truth.answer));
    expect(check).toEqual({ answerRight: true, stepsRight: false, passed: false });
  });
});
