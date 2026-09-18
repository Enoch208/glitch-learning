import type { SubtractionProblem } from "@/engine/math/truth";

export type HandoffInput = {
  ruleName: string;
  traces: { problem: SubtractionProblem; finalAnswer: number }[];
  prediction: { predicted: number; bossAnswer: number } | null;
  forge: {
    problem: SubtractionProblem;
    glitchAnswer: number;
    truthAnswer: number;
    attempts: number;
  } | null;
  explanation: { missing: string[]; contradiction: boolean; coverage: number } | null;
  transfers: { problem: SubtractionProblem; answer: number; passed: boolean }[];
};

export type TutorHandoff = {
  defeated: boolean;
  ruleObserved: string;
  evidence: string[];
  prediction: string;
  counterexample: string;
  explanation: string;
  transfer: string;
  nextStep: string;
};

const written = (problem: SubtractionProblem) =>
  `${String(problem.minuend)} − ${String(problem.subtrahend)}`;

const conceptNextSteps: Record<string, string> = {
  "ten-is-ten-ones": "Trade one ten rod for ten single blocks and count them together.",
  "moves-not-creates": "Show that regrouping 52 still leaves 52, just split differently.",
  "tens-decrease": "Revisit why a regrouped ten leaves one fewer ten in the tens column.",
  "total-same": "Compare the value of the top number before and after regrouping.",
};

export function buildHandoff(input: HandoffInput): TutorHandoff {
  const passed = input.transfers.find((transfer) => transfer.passed);
  const defeated = input.forge !== null && passed !== undefined;
  const firstMissing = input.explanation?.missing[0];
  const lastTransfer = input.transfers.at(-1);

  return {
    defeated,
    ruleObserved: `${input.ruleName}: this rule seems to explain the learner's steps.`,
    evidence: input.traces.map(
      (trace) => `${written(trace.problem)} → ${String(trace.finalAnswer)}`,
    ),
    prediction:
      input.prediction === null
        ? "Not attempted."
        : input.prediction.predicted === input.prediction.bossAnswer
          ? "Predicted the rule's answer correctly."
          : "Did not yet predict the rule's answer.",
    counterexample:
      input.forge === null
        ? "No counterexample yet."
        : `${written(input.forge.problem)}: rule says ${String(input.forge.glitchAnswer)}, truth ${String(input.forge.truthAnswer)} (${String(input.forge.attempts)} tries).`,
    explanation:
      input.explanation === null
        ? "Not attempted."
        : `${String(Math.round(input.explanation.coverage * 4))} of 4 key ideas${input.explanation.contradiction ? ", and one of the rule's own beliefs" : ""}.`,
    transfer:
      lastTransfer === undefined
        ? "Not attempted."
        : `${written(lastTransfer.problem)} → ${String(lastTransfer.answer)}, ${lastTransfer.passed ? "correct on their own" : "not yet"}.`,
    nextStep:
      (firstMissing === undefined ? undefined : conceptNextSteps[firstMissing]) ??
      (defeated
        ? "Try regrouping across a zero, like 60 − 27."
        : "Work one regrouping problem together with base ten blocks."),
  };
}
