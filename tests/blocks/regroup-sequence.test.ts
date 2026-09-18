import { describe, expect, test } from "vitest";
import {
  REGROUP_STAGE_HOLDS,
  nextRegroupStage,
  type RegroupStage,
} from "@/engine/blocks/regroup-sequence";

const walkFrom = (start: RegroupStage, limit = 20) => {
  const visited: RegroupStage[] = [start];
  let current = start;

  for (let step = 0; step < limit; step += 1) {
    const next = nextRegroupStage(current);
    if (next === null) return visited;
    visited.push(next);
    current = next;
  }

  return visited;
};

describe("the regrouping stage sequence", () => {
  test("runs from introduce to a terminal stage without repeating itself", () => {
    const walk = walkFrom("introduce");

    expect(walk.at(-1)).toBe("done");
    expect(new Set(walk).size).toBe(walk.length);
  });

  test("settling commits once and then stops", () => {
    expect(nextRegroupStage("settle")).toBe("done");
    expect(nextRegroupStage("done")).toBeNull();
  });

  test("ready waits for the learner", () => {
    expect(nextRegroupStage("ready")).toBeNull();
  });

  test("the learner sees each stage long enough to read it", () => {
    const tooFast = (Object.keys(REGROUP_STAGE_HOLDS) as RegroupStage[]).filter(
      (stage) => stage !== "ready" && stage !== "done" && REGROUP_STAGE_HOLDS[stage] < 300,
    );

    expect(tooFast).toEqual([]);
  });
});
