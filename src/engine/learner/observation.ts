import type { SubtractionProblem } from "@/engine/math/truth";
import type { ReasoningTrace } from "@/events/trace";

export type Observation = {
  problem: SubtractionProblem;
  answer: number;
  steps: { onesTop: number; tensTop: number };
};

export function observationFromTrace(trace: ReasoningTrace): Observation {
  const steps = {
    onesTop: trace.problem.minuend % 10,
    tensTop: Math.floor(trace.problem.minuend / 10),
  };

  for (const event of trace.events) {
    if (event.type === "digit_edit" && event.place === "ones") steps.onesTop = event.value;
    if (event.type === "digit_edit" && event.place === "tens") steps.tensTop = event.value;
  }

  return { problem: trace.problem, answer: trace.finalAnswer, steps };
}
