import { describe, expect, test } from "vitest";
import { evaluateForge, findCounterexamples, forgeHints } from "@/engine/counterexample/search";
import { correctRule, flipFlopRule, freeTenRule } from "@/engine/rules/known-rules";
import { runRule } from "@/engine/rules/interpreter";
import { solveByColumns } from "@/engine/math/truth";

describe("forge evaluation", () => {
  test("a regrouping problem breaks Free Ten", () => {
    expect(evaluateForge(freeTenRule, { minuend: 52, subtrahend: 28 })).toMatchObject({
      validProblem: true,
      activatesTargetRule: true,
      truthAnswer: 24,
      glitchAnswer: 34,
      contradictsRule: true,
    });
  });

  test("a problem the rule gets right does not break it and scores nothing", () => {
    expect(evaluateForge(freeTenRule, { minuend: 48, subtrahend: 23 })).toMatchObject({
      validProblem: true,
      contradictsRule: false,
      score: 0,
    });
  });

  test("a problem outside two-digit subtraction is refused, not scored", () => {
    expect(evaluateForge(freeTenRule, { minuend: 23, subtrahend: 48 })).toMatchObject({
      validProblem: false,
      contradictsRule: false,
      score: 0,
    });
  });
});

describe("counterexample search", () => {
  test("every counterexample it returns is a real contradiction of every misconception", () => {
    const fake = [freeTenRule, flipFlopRule].flatMap((rule) =>
      findCounterexamples(rule, 50).filter(
        (problem) => runRule(rule, problem).answer === solveByColumns(problem).answer,
      ),
    );
    expect(fake).toEqual([]);
  });

  test("the correct rule has no counterexamples", () => {
    expect(findCounterexamples(correctRule, 10)).toEqual([]);
  });

  test("friendlier problems come first", () => {
    const [first, second] = findCounterexamples(freeTenRule, 2);
    expect(first).toBeDefined();
    expect((first?.minuend ?? 0) <= (second?.minuend ?? 0)).toBe(true);
  });

  test("hints get more specific and the second one points at a real counterexample", () => {
    const [nudge, example] = forgeHints(freeTenRule);
    expect(nudge?.text).toMatch(/ones/);
    expect(example?.problem).toBeDefined();
    const problem = example?.problem ?? { minuend: 0, subtrahend: 0 };
    expect(evaluateForge(freeTenRule, problem).contradictsRule).toBe(true);
  });
});
