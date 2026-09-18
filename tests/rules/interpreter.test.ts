import { describe, expect, test } from "vitest";
import { runRule } from "@/engine/rules/interpreter";
import { correctRule, flipFlopRule, freeTenRule, knownRules } from "@/engine/rules/known-rules";
import { solveByColumns } from "@/engine/math/truth";

const everyProblem = () => {
  const problems: { minuend: number; subtrahend: number }[] = [];
  for (let minuend = 10; minuend <= 99; minuend += 1) {
    for (let subtrahend = 0; subtrahend <= minuend; subtrahend += 1) {
      problems.push({ minuend, subtrahend });
    }
  }
  return problems;
};

describe("rule interpreter", () => {
  test("the correct rule written in the DSL agrees with the truth engine everywhere", () => {
    const disagreements = everyProblem().filter((problem) => {
      const truth = solveByColumns(problem);
      const run = runRule(correctRule, problem);
      return (
        run.answer !== truth.answer ||
        run.onesTop !== truth.onesTop ||
        run.tensTop !== truth.tensTop
      );
    });

    expect(disagreements).toEqual([]);
  });

  test("Free Ten borrows the ten without paying for it", () => {
    expect(runRule(freeTenRule, { minuend: 52, subtrahend: 28 })).toMatchObject({
      onesTop: 12,
      tensTop: 5,
      answer: 34,
    });
  });

  test("Free Ten matches the correct rule exactly when no regrouping is needed", () => {
    const divergent = everyProblem().filter((problem) => {
      const needsRegroup = problem.minuend % 10 < problem.subtrahend % 10;
      const same = runRule(freeTenRule, problem).answer === runRule(correctRule, problem).answer;
      return needsRegroup === same;
    });

    expect(divergent).toEqual([]);
  });

  test("Flip Flop takes the smaller digit from the larger in each column", () => {
    expect(runRule(flipFlopRule, { minuend: 52, subtrahend: 28 }).answer).toBe(36);
  });

  test("every known rule runs on every problem without throwing", () => {
    const failures = knownRules.flatMap((rule) =>
      everyProblem().filter((problem) => {
        try {
          runRule(rule, problem);
          return false;
        } catch {
          return true;
        }
      }),
    );

    expect(failures).toEqual([]);
  });
});
