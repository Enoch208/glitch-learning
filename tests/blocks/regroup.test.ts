import { describe, expect, test } from "vitest";
import { composeValue, needsRegroup, regroupOnce } from "@/engine/blocks/regroup";
import { solveByColumns } from "@/engine/math/truth";

describe("regrouping a collection of pieces", () => {
  test("ten or more ones must be regrouped", () => {
    expect(needsRegroup({ tens: 2, ones: 15 })).toBe(true);
  });

  test("fewer than ten ones are left alone", () => {
    expect(needsRegroup({ tens: 2, ones: 9 })).toBe(false);
  });

  test("ten ones become one ten and the rest stay", () => {
    expect(regroupOnce({ tens: 2, ones: 15 })).toEqual({ tens: 3, ones: 5 });
  });

  test("regrouping never changes the quantity", () => {
    const drifted: string[] = [];

    for (let tens = 0; tens <= 9; tens += 1) {
      for (let ones = 0; ones <= 30; ones += 1) {
        const before = { tens, ones };
        if (!needsRegroup(before)) continue;
        if (composeValue(regroupOnce(before)) !== composeValue(before)) {
          drifted.push(`${String(tens)}t ${String(ones)}o`);
        }
      }
    }

    expect(drifted).toEqual([]);
  });

  test("the canvas and the column algorithm agree on what a ten is worth", () => {
    const solution = solveByColumns({ minuend: 52, subtrahend: 28 });

    expect(composeValue({ tens: solution.tensResult, ones: solution.onesResult })).toBe(
      solution.answer,
    );
  });
});
