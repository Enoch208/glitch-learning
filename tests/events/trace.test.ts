import { describe, expect, test } from "vitest";
import { reasoningTraceSchema } from "@/events/trace";

const traceOf = (events: unknown[]) => ({
  problemId: "p-52-28",
  problem: { minuend: 52, subtrahend: 28 },
  events,
  finalAnswer: 34,
  startedAt: 1_700_000_000_000,
  completedAt: 1_700_000_012_000,
});

describe("reasoningTraceSchema", () => {
  test("parses a trace of a learner who borrowed and answered", () => {
    const trace = traceOf([
      { type: "borrow", at: 1_700_000_003_000 },
      { type: "digit_edit", at: 1_700_000_004_000, place: "ones", value: 12 },
      { type: "column_result", at: 1_700_000_006_000, place: "ones", value: 4 },
      { type: "column_result", at: 1_700_000_009_000, place: "tens", value: 3 },
      { type: "answer", at: 1_700_000_012_000, value: 34 },
    ]);

    expect(reasoningTraceSchema.safeParse(trace).success).toBe(true);
  });

  test("rejects an event the canvas cannot emit", () => {
    const trace = traceOf([{ type: "guessed_wildly", at: 1_700_000_003_000 }]);

    expect(reasoningTraceSchema.safeParse(trace).success).toBe(false);
  });

  test("rejects a column result outside a single digit", () => {
    const trace = traceOf([
      { type: "column_result", at: 1_700_000_006_000, place: "ones", value: 14 },
    ]);

    expect(reasoningTraceSchema.safeParse(trace).success).toBe(false);
  });

  test("rejects a trace that completed before it started", () => {
    const trace = { ...traceOf([]), startedAt: 1_700_000_012_000, completedAt: 1_700_000_000_000 };

    expect(reasoningTraceSchema.safeParse(trace).success).toBe(false);
  });
});
