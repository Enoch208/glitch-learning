import { describe, expect, test } from "vitest";
import { createTraceRecorder } from "@/engine/trace/recorder";
import { reasoningTraceSchema } from "@/events/trace";

const problem = { minuend: 52, subtrahend: 28 };

const tickingClock = () => {
  let now = 1_700_000_000_000;
  return () => {
    now += 1000;
    return now;
  };
};

describe("the trace recorder", () => {
  test("produces a trace the schema accepts", () => {
    const recorder = createTraceRecorder(problem, tickingClock());
    recorder.record({ type: "borrow" });
    recorder.record({ type: "column_result", place: "ones", value: 4 });

    expect(reasoningTraceSchema.safeParse(recorder.complete(24)).success).toBe(true);
  });

  test("stamps each event with the moment it happened", () => {
    const recorder = createTraceRecorder(problem, tickingClock());
    recorder.record({ type: "borrow" });
    recorder.record({ type: "borrow" });

    const events = recorder.complete(24).events;

    expect(events[1]?.at).toBeGreaterThan(events[0]?.at ?? 0);
  });

  test("keeps the learner's actions in the order they happened", () => {
    const recorder = createTraceRecorder(problem, tickingClock());
    recorder.record({ type: "digit_edit", place: "ones", value: 12 });
    recorder.record({ type: "column_result", place: "ones", value: 4 });
    recorder.record({ type: "column_result", place: "tens", value: 3 });

    expect(recorder.complete(34).events.map((event) => event.type)).toEqual([
      "digit_edit",
      "column_result",
      "column_result",
    ]);
  });

  test("records a wrong answer without correcting it", () => {
    const recorder = createTraceRecorder(problem, tickingClock());
    recorder.record({ type: "column_result", place: "tens", value: 3 });

    expect(recorder.complete(34).finalAnswer).toBe(34);
  });

  test("refuses an event the canvas should never emit", () => {
    const recorder = createTraceRecorder(problem, tickingClock());

    expect(() => {
      recorder.record({ type: "column_result", place: "ones", value: 14 });
    }).toThrow();
  });
});
