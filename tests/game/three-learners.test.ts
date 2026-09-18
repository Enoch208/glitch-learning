import { describe, expect, test } from "vitest";
import { learnerResults } from "@/engine/game/three-learners";

describe("three learners through one engine", () => {
  test("each rule gets its own outcome", () => {
    expect(learnerResults.map((result) => result.outcome)).toEqual([
      { kind: "boss", ruleId: "free-ten" },
      { kind: "boss", ruleId: "flip-flop" },
      { kind: "no-rule-found" },
    ]);
  });
});
