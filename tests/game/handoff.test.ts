import { describe, expect, test } from "vitest";
import { buildHandoff, type HandoffInput } from "@/engine/game/handoff";

const base: HandoffInput = {
  ruleName: "Free Ten",
  traces: [
    { problem: { minuend: 52, subtrahend: 28 }, finalAnswer: 34 },
    { problem: { minuend: 31, subtrahend: 15 }, finalAnswer: 26 },
  ],
  prediction: { predicted: 36, bossAnswer: 36 },
  forge: {
    problem: { minuend: 20, subtrahend: 11 },
    glitchAnswer: 19,
    truthAnswer: 9,
    attempts: 3,
  },
  explanation: { missing: [], contradiction: false, coverage: 1 },
  transfers: [{ problem: { minuend: 43, subtrahend: 17 }, answer: 26, passed: true }],
};

describe("tutor handoff", () => {
  test("a forged counterexample plus a solved transfer counts as defeating the rule", () => {
    expect(buildHandoff(base).defeated).toBe(true);
  });

  test("breaking the rule without solving a new problem alone is not victory", () => {
    const failed = {
      ...base,
      transfers: [{ ...base.transfers[0], passed: false }],
    } as HandoffInput;
    expect(buildHandoff(failed).defeated).toBe(false);
  });

  test("lists every problem that exposed the rule with the learner's answer", () => {
    expect(buildHandoff(base).evidence).toEqual(["52 − 28 → 34", "31 − 15 → 26"]);
  });

  test("the next step goes straight at the idea the learner left out", () => {
    const missing = {
      ...base,
      explanation: { missing: ["tens-decrease"], contradiction: false, coverage: 0.75 },
    };
    expect(buildHandoff(missing).nextStep).toMatch(/fewer ten/);
  });
});
