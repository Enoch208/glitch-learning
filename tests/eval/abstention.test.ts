import { describe, expect, test } from "vitest";
import { evaluateAbstention } from "@/engine/eval/abstention";

const options = { learnersPerRule: 10, maxQuestions: 6, seed: 7 };

describe("abstention under noise", () => {
  test("every noisy learner either gets no boss or is counted under the boss it got", () => {
    for (const report of evaluateAbstention(options)) {
      const bossed = Object.values(report.bosses).reduce((sum, count) => sum + count, 0);
      expect(report.abstained + bossed).toBe(report.learners);
    }
  });

  test("a noisy learner is never given a boss that is not a misconception", () => {
    for (const report of evaluateAbstention(options)) {
      expect(
        Object.keys(report.bosses).every((id) => id === "free-ten" || id === "flip-flop"),
      ).toBe(true);
    }
  });

  test("the same seed gives the same result", () => {
    expect(evaluateAbstention(options)).toEqual(evaluateAbstention(options));
  });
});
