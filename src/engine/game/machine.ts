import { observationFromTrace } from "@/engine/learner/observation";
import type { RunEvidence } from "./evidence";
import { sessionOutcome } from "./session";

export type { RunEvidence } from "./evidence";

export const STAGE_ORDER = [
  "encounter",
  "observation",
  "diagnostic",
  "boss",
  "forge",
  "explain",
  "transfer",
];

const guards: Record<string, (evidence: RunEvidence) => boolean> = {
  encounter: (evidence) => evidence.traces.length > 0,
  observation: (evidence) => evidence.traces.length > 0,
  diagnostic: (evidence) =>
    sessionOutcome(evidence.traces.map(observationFromTrace)).kind === "boss",
  boss: (evidence) => evidence.prediction !== null,
  forge: (evidence) =>
    evidence.forge !== null && evidence.forge.glitchAnswer !== evidence.forge.truthAnswer,
  explain: (evidence) => evidence.explanation !== null,
  transfer: (evidence) => evidence.transfers.some((transfer) => transfer.passed),
};

export type StageTransition = { ok: true; completed: string[] } | { ok: false; reason: string };

export function completeStage(
  completed: string[],
  stage: string,
  evidence: RunEvidence,
): StageTransition {
  if (completed.includes(stage)) return { ok: true, completed };

  const position = STAGE_ORDER.indexOf(stage);
  const guard = guards[stage];
  if (position === -1 || guard === undefined) return { ok: false, reason: "unknown stage" };

  const earlier = STAGE_ORDER.slice(0, position);
  if (!earlier.every((previous) => completed.includes(previous))) {
    return { ok: false, reason: "an earlier stage is unfinished" };
  }
  if (!guard(evidence)) return { ok: false, reason: "the evidence for this stage is missing" };

  return { ok: true, completed: [...completed, stage] };
}
