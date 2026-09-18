import { describe, expect, test } from "vitest";
import { malformedPrograms, measureReliability } from "@/engine/eval/reliability";

describe("reliability counters", () => {
  const report = measureReliability();

  test("the malformed program corpus is not empty", () => {
    expect(malformedPrograms.length).toBeGreaterThan(5);
  });

  test("it checks the whole problem domain", () => {
    expect(report.problemsChecked).toBe(4995);
  });

  test("every counter the page will show is zero", () => {
    expect(report).toMatchObject({
      mathTruthFailures: 0,
      invalidProgramsAccepted: 0,
      falseCounterexamples: 0,
      correctRuleDisagreements: 0,
      stageViolationsAccepted: 0,
    });
  });

  test("the fuzz reaches the last stage on some runs", () => {
    expect(report.stageRunsReachingTransfer).toBeGreaterThan(0);
  });

  test("the stage machine was actually exercised, including rejected attempts", () => {
    expect(report.stageAttempts).toBeGreaterThan(1000);
    expect(report.stageTransitionsAccepted).toBeGreaterThan(0);
    expect(report.stageTransitionsAccepted).toBeLessThan(report.stageAttempts);
  });
});
