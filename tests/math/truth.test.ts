import { describe, expect, test } from "vitest";
import { isTwoDigitSubtraction, solveByColumns } from "@/engine/math/truth";

describe("solveByColumns", () => {
  test("subtracts column by column when the ones digit needs no regrouping", () => {
    expect(solveByColumns({ minuend: 48, subtrahend: 23 })).toEqual({
      regrouped: false,
      onesTop: 8,
      tensTop: 4,
      onesResult: 5,
      tensResult: 2,
      answer: 25,
    });
  });

  test("regroups one ten into ten ones when the ones digit is too small", () => {
    expect(solveByColumns({ minuend: 52, subtrahend: 28 })).toEqual({
      regrouped: true,
      onesTop: 12,
      tensTop: 4,
      onesResult: 4,
      tensResult: 2,
      answer: 24,
    });
  });
});

describe("problem domain", () => {
  test("accepts a two-digit minuend with a smaller subtrahend", () => {
    expect(isTwoDigitSubtraction({ minuend: 52, subtrahend: 8 })).toBe(true);
  });

  test("rejects a subtrahend larger than the minuend", () => {
    expect(isTwoDigitSubtraction({ minuend: 23, subtrahend: 48 })).toBe(false);
  });

  test("rejects a minuend outside the two-digit range", () => {
    expect(isTwoDigitSubtraction({ minuend: 5, subtrahend: 3 })).toBe(false);
  });

  test("rejects non-integer input", () => {
    expect(isTwoDigitSubtraction({ minuend: 52.5, subtrahend: 28 })).toBe(false);
  });

  test("refuses to solve a problem outside the domain", () => {
    expect(() => solveByColumns({ minuend: 23, subtrahend: 48 })).toThrow(
      "outside the two-digit subtraction domain",
    );
  });
});

describe("deterministic truth across the whole MVP domain", () => {
  test("every problem reconstructs its answer from its columns", () => {
    const failures: string[] = [];

    for (let minuend = 10; minuend <= 99; minuend += 1) {
      for (let subtrahend = 0; subtrahend <= minuend; subtrahend += 1) {
        const solution = solveByColumns({ minuend, subtrahend });
        const composed = solution.tensResult * 10 + solution.onesResult;
        const digitsInRange =
          solution.onesResult >= 0 && solution.onesResult <= 9 && solution.tensResult >= 0;

        if (composed !== minuend - subtrahend || !digitsInRange) {
          failures.push(`${String(minuend)} - ${String(subtrahend)}`);
        }
      }
    }

    expect(failures).toEqual([]);
  });

  test("regrouping happens exactly when the ones digit is too small", () => {
    const disagreements: string[] = [];

    for (let minuend = 10; minuend <= 99; minuend += 1) {
      for (let subtrahend = 0; subtrahend <= minuend; subtrahend += 1) {
        const expected = minuend % 10 < subtrahend % 10;
        if (solveByColumns({ minuend, subtrahend }).regrouped !== expected) {
          disagreements.push(`${String(minuend)} - ${String(subtrahend)}`);
        }
      }
    }

    expect(disagreements).toEqual([]);
  });
});
