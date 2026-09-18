import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SubtractionProblem } from "@/engine/math/truth";
import type { ReasoningTrace } from "@/events/trace";
import { journeyStages, type StageStatus } from "@/lib/journey";

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

type RunData = {
  completedStageIds: string[];
  traces: ReasoningTrace[];
  prediction: PredictionRecord | null;
  forge: ForgeRecord | null;
  explanation: ExplanationRecord | null;
  transfers: TransferRecord[];
  soundOn: boolean;
};

export type RunState = RunData & {
  recordTrace: (trace: ReasoningTrace) => void;
  recordPrediction: (prediction: PredictionRecord) => void;
  recordForge: (forge: ForgeRecord) => void;
  recordExplanation: (explanation: ExplanationRecord) => void;
  recordTransfer: (transfer: TransferRecord) => void;
  completeStages: (ids: string[]) => void;
  resetRun: () => void;
  toggleSound: () => void;
};

const freshRun: RunData = {
  completedStageIds: [],
  traces: [],
  prediction: null,
  forge: null,
  explanation: null,
  transfers: [],
  soundOn: true,
};

export const useRunStore = create<RunState>()(
  persist(
    (set) => ({
      ...freshRun,
      recordTrace: (trace) => {
        set((state) => ({ traces: [...state.traces, trace] }));
      },
      recordPrediction: (prediction) => {
        set({ prediction });
      },
      recordForge: (forge) => {
        set({ forge });
      },
      recordExplanation: (explanation) => {
        set({ explanation });
      },
      recordTransfer: (transfer) => {
        set((state) => ({ transfers: [...state.transfers, transfer] }));
      },
      completeStages: (ids) => {
        set((state) => ({
          completedStageIds: [
            ...state.completedStageIds,
            ...ids.filter((id) => !state.completedStageIds.includes(id)),
          ],
        }));
      },
      resetRun: () => {
        set((state) => ({ ...freshRun, soundOn: state.soundOn }));
      },
      toggleSound: () => {
        set((state) => ({ soundOn: !state.soundOn }));
      },
    }),
    { name: "glitch-run", version: 3, migrate: () => freshRun },
  ),
);

export function stageStatusFor(stageId: string, completedStageIds: string[]): StageStatus {
  if (completedStageIds.includes(stageId)) return "done";

  const firstUnfinished = journeyStages.find((stage) => !completedStageIds.includes(stage.id));
  return firstUnfinished?.id === stageId ? "active" : "locked";
}
