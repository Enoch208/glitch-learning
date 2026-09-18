import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReasoningTrace } from "@/events/trace";
import { journeyStages, type StageStatus } from "@/lib/journey";

type RunData = {
  completedStageIds: string[];
  traces: ReasoningTrace[];
  soundOn: boolean;
};

export type RunState = RunData & {
  recordTrace: (trace: ReasoningTrace) => void;
  completeStages: (ids: string[]) => void;
  resetRun: () => void;
  toggleSound: () => void;
};

const freshRun: RunData = { completedStageIds: [], traces: [], soundOn: true };

export const useRunStore = create<RunState>()(
  persist(
    (set) => ({
      ...freshRun,
      recordTrace: (trace) => {
        set((state) => ({ traces: [...state.traces, trace] }));
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
    { name: "glitch-run", version: 2, migrate: () => freshRun },
  ),
);

export function stageStatusFor(stageId: string, completedStageIds: string[]): StageStatus {
  if (completedStageIds.includes(stageId)) return "done";

  const firstUnfinished = journeyStages.find((stage) => !completedStageIds.includes(stage.id));
  return firstUnfinished?.id === stageId ? "active" : "locked";
}
