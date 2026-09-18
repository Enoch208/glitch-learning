import type { SubtractionProblem } from "@/engine/math/truth";
import type { RuleProgram } from "@/engine/rules/ast";
import type { ReasoningTrace } from "@/events/trace";

export type PredictionRecord = {
  problem: SubtractionProblem;
  predicted: number;
  bossAnswer: number;
};

export type ForgeRecord = {
  problem: SubtractionProblem;
  truthAnswer: number;
  glitchAnswer: number;
  attempts: number;
};

export type ExplanationRecord = {
  selected: string[];
  missing: string[];
  coverage: number;
  contradiction: boolean;
  followUpUsed: boolean;
};

export type TransferRecord = { problem: SubtractionProblem; answer: number; passed: boolean };

export type RunEvidence = {
  traces: ReasoningTrace[];
  induced: RuleProgram | null;
  prediction: PredictionRecord | null;
  forge: ForgeRecord | null;
  explanation: ExplanationRecord | null;
  transfers: TransferRecord[];
};
