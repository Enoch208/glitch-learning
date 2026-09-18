import { describe, expect, test } from "vitest";
import { induceRules, type RuleProposer } from "@/engine/rules/induction";
import type { RuleProgram } from "@/engine/rules/ast";
import { runRule } from "@/engine/rules/interpreter";
import { freeTenRule } from "@/engine/rules/known-rules";
import type { Observation } from "@/engine/learner/observation";

const zeroOnesRule: RuleProgram = {
  name: "Zero when stuck",
  onesTop: { op: "var", name: "topOnes" },
  tensTop: { op: "var", name: "topTens" },
  onesResult: {
    op: "if",
    condition: {
      op: "lessThan",
      left: { op: "var", name: "topOnes" },
      right: { op: "var", name: "bottomOnes" },
    },
    then: { op: "const", value: 0 },
    else: {
      op: "subtract",
      left: { op: "var", name: "onesTop" },
      right: { op: "var", name: "bottomOnes" },
    },
  },
  tensResult: {
    op: "subtract",
    left: { op: "var", name: "tensTop" },
    right: { op: "var", name: "bottomTens" },
  },
};

const observe = (rule: RuleProgram, minuend: number, subtrahend: number): Observation => {
  const run = runRule(rule, { minuend, subtrahend });
  return {
    problem: { minuend, subtrahend },
    answer: run.answer,
    steps: { onesTop: run.onesTop, tensTop: run.tensTop },
  };
};

const zeroOnesEvidence = [
  observe(zeroOnesRule, 52, 28),
  observe(zeroOnesRule, 31, 15),
  observe(zeroOnesRule, 73, 38),
];
const proposing =
  (proposals: unknown[]): RuleProposer =>
  () =>
    Promise.resolve(proposals);

describe("rule induction", () => {
  test("a proposed rule nobody wrote into the library can explain the learner best", async () => {
    const result = await induceRules(zeroOnesEvidence, proposing([zeroOnesRule]));
    expect(result.source).toBe("proposer");
    expect(result.ranked[0]?.rule.name).toBe("Zero when stuck");
    expect(result.ranked[0]?.origin).toBe("induced");
  });

  test("anything that is not a valid program is rejected with a reason and never run", async () => {
    const result = await induceRules(
      zeroOnesEvidence,
      proposing(["return 42", { op: "eval", code: "process.exit()" }, null]),
    );
    expect(result.rejected).toHaveLength(3);
    expect(result.rejected.every((entry) => entry.reason.length > 0)).toBe(true);
    expect(result.ranked.every((candidate) => candidate.origin === "known")).toBe(true);
  });

  test("only the first three proposals are considered", async () => {
    const result = await induceRules(
      zeroOnesEvidence,
      proposing([zeroOnesRule, freeTenRule, zeroOnesRule, zeroOnesRule, zeroOnesRule]),
    );
    expect(result.proposalsConsidered).toBe(3);
  });

  test("when the proposer fails the known rules still produce a diagnosis", async () => {
    const failing: RuleProposer = () => Promise.reject(new Error("provider down"));
    const result = await induceRules(
      [observe(freeTenRule, 52, 28), observe(freeTenRule, 31, 15)],
      failing,
    );
    expect(result.source).toBe("fallback");
    expect(result.ranked[0]?.rule.name).toBe("Free Ten");
  });

  test("a rule that explains every step scores above one that only matches answers", async () => {
    const result = await induceRules(zeroOnesEvidence, proposing([zeroOnesRule]));
    const [best, second] = result.ranked;
    expect((best?.score ?? 0) > (second?.score ?? 0)).toBe(true);
    expect(best?.stepFit).toBe(1);
  });

  test("scores are the same every time for the same evidence", async () => {
    const a = await induceRules(zeroOnesEvidence, proposing([zeroOnesRule]));
    const b = await induceRules(zeroOnesEvidence, proposing([zeroOnesRule]));
    expect(a.ranked.map((c) => c.score)).toEqual(b.ranked.map((c) => c.score));
  });
});
