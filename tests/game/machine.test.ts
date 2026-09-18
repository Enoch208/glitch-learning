import { describe, expect, test } from "vitest";
import { completeStage, STAGE_ORDER, type RunEvidence } from "@/engine/game/machine";
import { runRule } from "@/engine/rules/interpreter";
import { freeTenRule } from "@/engine/rules/known-rules";
import type { ReasoningTrace } from "@/events/trace";

const freeTenTrace = (minuend: number, subtrahend: number): ReasoningTrace => {
  const run = runRule(freeTenRule, { minuend, subtrahend });
  return {
    problemId: `p-${String(minuend)}-${String(subtrahend)}`,
    problem: { minuend, subtrahend },
    events: [
      { type: "borrow", at: 1 },
      { type: "digit_edit", at: 2, place: "ones", value: run.onesTop },
    ],
    finalAnswer: run.answer,
    startedAt: 0,
    completedAt: 3,
  };
};

const empty: RunEvidence = {
  traces: [],
  prediction: null,
  forge: null,
  explanation: null,
  transfers: [],
};

const full: RunEvidence = {
  traces: [freeTenTrace(52, 28), freeTenTrace(31, 15)],
  prediction: { problem: { minuend: 20, subtrahend: 17 }, predicted: 13, bossAnswer: 13 },
  forge: {
    problem: { minuend: 20, subtrahend: 11 },
    truthAnswer: 9,
    glitchAnswer: 19,
    attempts: 1,
  },
  explanation: {
    selected: [],
    missing: [],
    coverage: 1,
    contradiction: false,
    followUpUsed: false,
  },
  transfers: [{ problem: { minuend: 26, subtrahend: 17 }, answer: 9, passed: true }],
};

const completeAll = (evidence: RunEvidence) =>
  STAGE_ORDER.reduce<{ completed: string[]; rejected: string[] }>(
    (state, stage) => {
      const result = completeStage(state.completed, stage, evidence);
      return result.ok
        ? { ...state, completed: result.completed }
        : { ...state, rejected: [...state.rejected, stage] };
    },
    { completed: [], rejected: [] },
  );

describe("stage machine", () => {
  test("with full evidence every stage completes in order", () => {
    expect(completeAll(full)).toEqual({ completed: STAGE_ORDER, rejected: [] });
  });

  test("a stage cannot be skipped", () => {
    expect(completeStage([], "forge", full).ok).toBe(false);
  });

  test("with no evidence nothing completes", () => {
    expect(completeAll(empty).completed).toEqual([]);
  });

  test("diagnosis cannot finish without a boss earned from the traces", () => {
    const oneTrace = { ...full, traces: full.traces.slice(0, 1) };
    expect(completeStage(["encounter", "observation"], "diagnostic", oneTrace).ok).toBe(false);
  });

  test("the forge only completes on a problem that actually breaks the rule", () => {
    const unbroken = { ...full, forge: { ...full.forge, glitchAnswer: 9 } } as RunEvidence;
    expect(
      completeStage(["encounter", "observation", "diagnostic", "boss"], "forge", unbroken).ok,
    ).toBe(false);
  });

  test("transfer needs a passed attempt, not just an attempt", () => {
    const failed = {
      ...full,
      transfers: [{ problem: { minuend: 26, subtrahend: 17 }, answer: 19, passed: false }],
    };
    const before = ["encounter", "observation", "diagnostic", "boss", "forge", "explain"];
    expect(completeStage(before, "transfer", failed).ok).toBe(false);
  });

  test("completing a finished stage again changes nothing", () => {
    const result = completeStage(["encounter"], "encounter", full);
    expect(result).toEqual({ ok: true, completed: ["encounter"] });
  });
});
