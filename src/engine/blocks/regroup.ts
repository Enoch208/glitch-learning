import { ONES_IN_A_TEN } from "./geometry";

export type PlaceCounts = {
  tens: number;
  ones: number;
};

export const composeValue = (counts: PlaceCounts): number =>
  counts.tens * ONES_IN_A_TEN + counts.ones;

export const needsRegroup = (counts: PlaceCounts): boolean => counts.ones >= ONES_IN_A_TEN;

export function regroupOnce(counts: PlaceCounts): PlaceCounts {
  if (!needsRegroup(counts)) return counts;

  return {
    tens: counts.tens + 1,
    ones: counts.ones - ONES_IN_A_TEN,
  };
}
