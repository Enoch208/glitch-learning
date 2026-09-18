import { describe, expect, test } from "vitest";
import {
  FIRST_PROBLEM,
  MAX_DIAGNOSTIC_QUESTIONS,
  nextProblem,
  sessionOutcome,
} from "@/engine/game/session";
import type { Observation } from "@/engine/learner/observation";
import { runRule } from "@/engine/rules/interpreter";
import { correctRule, freeTenRule } from "@/engine/rules/known-rules";
import type { RuleProgram } from "@/engine/rules/ast";
import type { SubtractionProblem } from "@/engine/math/truth";

const answerAs = (rule: RuleProgram, problem: SubtractionProblem): Observation => {
  const run = runRule(rule, problem);
  return { problem, answer: run.answer, steps: { onesTop: run.onesTop, tensTop: run.tensTop } };
};

const playAs = (rule: RuleProgram, count: number): Observation[] => {
  const observations: Observation[] = [];
  for (let index = 0; index < count; index += 1) {
    observations.push(answerAs(rule, nextProblem(observations)));
  }
  return observations;
};

describe("session", () => {
  test("every run opens on the same problem", () => {
    expect(nextProblem([])).toEqual(FIRST_PROBLEM);
  });

  test("the follow up question is chosen the same way every time", () => {
    const first = [answerAs(freeTenRule, FIRST_PROBLEM)];
    expect(nextProblem(first)).toEqual(nextProblem(first));
  });

  test("after a Free Ten answer the next question needs regrouping", () => {
    const next = nextProblem([answerAs(freeTenRule, FIRST_PROBLEM)]);
    expect(next.minuend % 10).toBeLessThan(next.subtrahend % 10);
  });

  test("no problem is asked twice", () => {
    const asked = playAs(correctRule, MAX_DIAGNOSTIC_QUESTIONS).map(
      (o) => `${String(o.problem.minuend)}-${String(o.problem.subtrahend)}`,
    );
    expect(new Set(asked).size).toBe(asked.length);
  });

  test("a Free Ten learner wakes the Free Ten boss", () => {
    expect(sessionOutcome(playAs(freeTenRule, 2))).toEqual({ kind: "boss", ruleId: "free-ten" });
  });

  test("a learner who regroups correctly ends with no rule found", () => {
    expect(sessionOutcome(playAs(correctRule, MAX_DIAGNOSTIC_QUESTIONS))).toEqual({
      kind: "no-rule-found",
    });
  });

  test("the session keeps asking while the evidence is still thin", () => {
    expect(sessionOutcome(playAs(correctRule, 1))).toEqual({ kind: "continue" });
  });
});
