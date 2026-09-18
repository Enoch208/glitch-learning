export type RegroupStage =
  "ready" | "introduce" | "gather" | "snap" | "transform" | "move" | "settle" | "done";

export const REGROUP_STAGE_HOLDS: Record<RegroupStage, number> = {
  ready: 0,
  introduce: 850,
  gather: 780,
  snap: 460,
  transform: 520,
  move: 780,
  settle: 520,
  done: 0,
};

const sequence: Record<RegroupStage, RegroupStage | null> = {
  ready: null,
  introduce: "gather",
  gather: "snap",
  snap: "transform",
  transform: "move",
  move: "settle",
  settle: "done",
  done: null,
};

export const nextRegroupStage = (stage: RegroupStage): RegroupStage | null => sequence[stage];
