import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ExplanationRecord,
  ForgeRecord,
  PredictionRecord,
  TransferRecord,
} from "@/engine/game/evidence";
import { completeStage } from "@/engine/game/machine";
import type { RuleProgram } from "@/engine/rules/ast";
import type { ReasoningTrace } from "@/events/trace";
import { journeyStages, type StageStatus } from "@/lib/journey";

type RunData = {
  completedStageIds: string[];
  traces: ReasoningTrace[];
  induced: RuleProgram | null;
  prediction: PredictionRecord | null;
  forge: ForgeRecord | null;
  explanation: ExplanationRecord | null;
  transfers: TransferRecord[];
  soundOn: boolean;
};

export type RunState = RunData & {
  recordTrace: (trace: ReasoningTrace) => void;
  recordInduced: (rule: RuleProgram) => void;
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
  induced: null,
  prediction: null,
  forge: null,
  explanation: null,
  transfers: [],
  soundOn: true,
};

export const useRunStore = create<RunState>()(
  persist(
    (set, get) => ({
      ...freshRun,
      recordTrace: (trace) => {
        set((state) => ({ traces: [...state.traces, trace] }));
      },
      recordInduced: (rule) => {
        set({ induced: rule });
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
        const state = get();
        const completed = ids.reduce((current, id) => {
          const transition = completeStage(current, id, state);
          return transition.ok ? transition.completed : current;
        }, state.completedStageIds);
        set({ completedStageIds: completed });
      },
      resetRun: () => {
        set((state) => ({ ...freshRun, soundOn: state.soundOn }));
      },
      toggleSound: () => {
        set((state) => ({ soundOn: !state.soundOn }));
      },
    }),
    { name: "glitch-run", version: 4, migrate: () => freshRun },
  ),
);

export function stageStatusFor(stageId: string, completedStageIds: string[]): StageStatus {
  if (completedStageIds.includes(stageId)) return "done";

  const firstUnfinished = journeyStages.find((stage) => !completedStageIds.includes(stage.id));
  return firstUnfinished?.id === stageId ? "active" : "locked";
}
