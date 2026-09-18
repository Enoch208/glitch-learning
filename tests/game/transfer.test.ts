import { describe, expect, test } from "vitest";
import { transferPassed, transferProblem } from "@/engine/game/transfer";
import { freeTenRule } from "@/engine/rules/known-rules";
import { runRule } from "@/engine/rules/interpreter";
import { isTwoDigitSubtraction, solveByColumns } from "@/engine/math/truth";

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

  test("passing means the true answer, nothing else", () => {
    const problem = transferProblem(freeTenRule, seen, 1);
    expect(transferPassed(problem, solveByColumns(problem).answer)).toBe(true);
    expect(transferPassed(problem, runRule(freeTenRule, problem).answer)).toBe(false);
  });
});
