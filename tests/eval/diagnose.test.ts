import { describe, expect, test } from "vitest";
import { createRandom } from "@/engine/learner/random";
import { simulateObservation } from "@/engine/learner/synthetic";
import { hypotheses } from "@/engine/learner/posterior";
import { runRule } from "@/engine/rules/interpreter";
import { evaluateStrategies } from "@/engine/eval/diagnose";

const freeTen = hypotheses.find((h) => h.id === "free-ten");

describe("seeded randomness", () => {
  test("the same seed replays the same sequence", () => {
    const a = createRandom(7);
    const b = createRandom(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe("synthetic learners", () => {
  test("a learner who never slips answers exactly as their rule predicts", () => {
    if (freeTen === undefined) throw new Error("free ten hypothesis missing");
    const problem = { minuend: 52, subtrahend: 28 };
    const observation = simulateObservation({ ...freeTen, slip: 0 }, problem, createRandom(1));

    expect(observation.answer).toBe(runRule(freeTen.rule, problem).answer);
  });
});

describe("strategy evaluation", () => {
  const options = { learnersPerRule: 6, maxQuestions: 5, seed: 11 };

  test("is deterministic for a fixed seed", () => {
    expect(evaluateStrategies(options)).toEqual(evaluateStrategies(options));
  });

  test("every learner ends with the right outcome, a wrong boss or a missed misconception", () => {
    const leaks = evaluateStrategies(options).filter(
      (report) => report.correct + report.wrongBoss + report.missed !== report.learners,
    );
    expect(leaks).toEqual([]);
  });

  test("reports all four strategies", () => {
    expect(evaluateStrategies(options).map((report) => report.strategy)).toEqual([
      "glitch",
      "random-question",
      "answer-lookup",
      "answer-only",
    ]);
  });
});
