import { describe, expect, test } from "vitest";
import { entropy } from "@/engine/learner/entropy";
import {
  bossReady,
  defaultDiagnosticConfig,
  hypotheses,
  leadingHypothesis,
  posteriorAfter,
  uniformPrior,
} from "@/engine/learner/posterior";
import { expectedInformationGain, selectNextProblem } from "@/engine/learner/diagnostic";
import { observationFromTrace } from "@/engine/learner/observation";
import { createTraceRecorder } from "@/engine/trace/recorder";

const freeTenAt52 = {
  problem: { minuend: 52, subtrahend: 28 },
  answer: 34,
  steps: { onesTop: 12, tensTop: 5 },
};

describe("entropy", () => {
  test("four equally likely rules carry two bits", () => {
    expect(entropy([0.25, 0.25, 0.25, 0.25])).toBeCloseTo(2);
  });

  test("a certain rule carries none", () => {
    expect(entropy([1, 0, 0])).toBe(0);
  });
});

describe("posterior over rule hypotheses", () => {
  test("model confidence always sums to one", () => {
    const total = posteriorAfter([freeTenAt52]).reduce((sum, p) => sum + p, 0);
    expect(total).toBeCloseTo(1);
  });

  test("a borrow without the tens decrement makes Free Ten the leading model", () => {
    expect(leadingHypothesis(posteriorAfter([freeTenAt52])).id).toBe("free-ten");
  });

  test("a correct answer on a problem with no regrouping cannot separate Free Ten from correct", () => {
    const posterior = posteriorAfter([
      { problem: { minuend: 48, subtrahend: 23 }, answer: 25, steps: { onesTop: 8, tensTop: 4 } },
    ]);
    const correct = posterior[hypotheses.findIndex((h) => h.id === "correct")] ?? 0;
    const freeTen = posterior[hypotheses.findIndex((h) => h.id === "free-ten")] ?? 0;

    expect(Math.abs(correct - freeTen)).toBeLessThan(0.01);
  });
});

describe("active diagnostic selection", () => {
  test("a problem without regrouping teaches nothing about Free Ten versus correct", () => {
    const tied = hypotheses.map((h) => (h.id === "correct" || h.id === "free-ten" ? 0.5 : 0));
    expect(expectedInformationGain(tied, { minuend: 48, subtrahend: 23 })).toBeCloseTo(0, 3);
  });

  test("it asks a problem that separates the rules still in doubt", () => {
    const tied = hypotheses.map((h) => (h.id === "correct" || h.id === "free-ten" ? 0.5 : 0));
    const chosen = selectNextProblem(tied, [
      { minuend: 48, subtrahend: 23 },
      { minuend: 61, subtrahend: 27 },
      { minuend: 75, subtrahend: 31 },
    ]);

    expect(chosen).toEqual({ minuend: 61, subtrahend: 27 });
  });
});

describe("boss creation gate", () => {
  test("one observation is not enough to spawn a boss", () => {
    expect(bossReady([freeTenAt52], defaultDiagnosticConfig)).toBe(false);
  });

  test("consistent Free Ten evidence across problems opens the gate", () => {
    const evidence = [
      freeTenAt52,
      { problem: { minuend: 61, subtrahend: 27 }, answer: 44, steps: { onesTop: 11, tensTop: 6 } },
      { problem: { minuend: 73, subtrahend: 38 }, answer: 45, steps: { onesTop: 13, tensTop: 7 } },
    ];
    expect(leadingHypothesis(posteriorAfter(evidence)).id).toBe("free-ten");
    expect(bossReady(evidence, defaultDiagnosticConfig)).toBe(true);
  });

  test("agreeing observations on problems that separate nothing never open the gate", () => {
    const easy = [
      { problem: { minuend: 48, subtrahend: 23 }, answer: 25, steps: { onesTop: 8, tensTop: 4 } },
      { problem: { minuend: 67, subtrahend: 34 }, answer: 33, steps: { onesTop: 7, tensTop: 6 } },
      { problem: { minuend: 99, subtrahend: 11 }, answer: 88, steps: { onesTop: 9, tensTop: 9 } },
    ];

    expect(bossReady(easy, defaultDiagnosticConfig)).toBe(false);
  });

  test("the prior gives every hypothesis a chance", () => {
    expect(uniformPrior().every((p) => p > 0)).toBe(true);
  });
});

describe("reading a canvas trace", () => {
  test("the rewritten top digits and the answer come straight from the recorded events", () => {
    let now = 0;
    const recorder = createTraceRecorder({ minuend: 52, subtrahend: 28 }, () => (now += 1000));
    recorder.record({ type: "borrow" });
    recorder.record({ type: "digit_edit", place: "ones", value: 12 });
    recorder.record({ type: "column_result", place: "ones", value: 4 });
    recorder.record({ type: "column_result", place: "tens", value: 3 });

    expect(observationFromTrace(recorder.complete(34))).toEqual(freeTenAt52);
  });
});
