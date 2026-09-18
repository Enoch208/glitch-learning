import type { SubtractionProblem } from "@/engine/math/truth";
import {
  reasoningEventSchema,
  reasoningTraceSchema,
  type ReasoningEvent,
  type ReasoningTrace,
} from "@/events/trace";

type WithoutTimestamp<T> = T extends unknown ? Omit<T, "at"> : never;

export type RecordableEvent = WithoutTimestamp<ReasoningEvent>;

export type TraceRecorder = {
  record: (event: RecordableEvent) => void;
  complete: (finalAnswer: number) => ReasoningTrace;
};

export function createTraceRecorder(
  problem: SubtractionProblem,
  now: () => number = Date.now,
): TraceRecorder {
  const startedAt = now();
  const events: ReasoningEvent[] = [];

  return {
    record(event) {
      events.push(reasoningEventSchema.parse({ ...event, at: now() }));
    },
    complete(finalAnswer) {
      return reasoningTraceSchema.parse({
        problemId: `p-${String(problem.minuend)}-${String(problem.subtrahend)}`,
        problem,
        events,
        finalAnswer,
        startedAt,
        completedAt: now(),
      });
    },
  };
}
