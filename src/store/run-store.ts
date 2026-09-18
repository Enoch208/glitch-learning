import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReasoningTrace } from "@/events/trace";
import { journeyStages, type StageStatus } from "@/lib/journey";

export type RunState = {
  completedStageIds: string[];
  lastTrace: ReasoningTrace | null;
  soundOn: boolean;
  completeStage: (id: string, trace: ReasoningTrace | null) => void;
  resetRun: () => void;
  toggleSound: () => void;
};

export const useRunStore = create<RunState>()(
  persist(
    (set) => ({
      completedStageIds: [],
      lastTrace: null,
      soundOn: true,
      completeStage: (id, trace) => {
        set((state) => ({
          completedStageIds: state.completedStageIds.includes(id)
            ? state.completedStageIds
            : [...state.completedStageIds, id],
          lastTrace: trace ?? state.lastTrace,
        }));
      },
      resetRun: () => {
        set({ completedStageIds: [], lastTrace: null });
      },
      toggleSound: () => {
        set((state) => ({ soundOn: !state.soundOn }));
      },
    }),
    { name: "glitch-run" },
  ),
);

export function stageStatusFor(stageId: string, completedStageIds: string[]): StageStatus {
  if (completedStageIds.includes(stageId)) return "done";

  const firstUnfinished = journeyStages.find((stage) => !completedStageIds.includes(stage.id));
  return firstUnfinished?.id === stageId ? "active" : "locked";
}
