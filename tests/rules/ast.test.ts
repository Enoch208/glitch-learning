import { describe, expect, test } from "vitest";
import { parseRule, ruleComplexity } from "@/engine/rules/ast";
import { correctRule, freeTenRule, knownRules } from "@/engine/rules/known-rules";

const base = {
  name: "candidate",
  onesTop: { op: "var", name: "topOnes" },
  tensTop: { op: "var", name: "topTens" },
  onesResult: {
    op: "subtract",
    left: { op: "var", name: "onesTop" },
    right: { op: "var", name: "bottomOnes" },
  },
  tensResult: {
    op: "subtract",
    left: { op: "var", name: "tensTop" },
    right: { op: "var", name: "bottomTens" },
  },
};

describe("rule AST validation", () => {
  test("accepts a well formed rule", () => {
    expect(parseRule(base).ok).toBe(true);
  });

  test("rejects an operation outside the primitive set", () => {
    expect(parseRule({ ...base, onesTop: { op: "eval", code: "process.exit()" } }).ok).toBe(false);
  });

  test("rejects executable source in place of a program", () => {
    expect(parseRule({ ...base, onesResult: "onesTop - bottomOnes" }).ok).toBe(false);
  });

  test("rejects a top digit defined in terms of itself", () => {
    expect(parseRule({ ...base, onesTop: { op: "var", name: "onesTop" } }).ok).toBe(false);
  });

  test("rejects programs nested deeper than the limit", () => {
    let deep: unknown = { op: "var", name: "topOnes" };
    for (let level = 0; level < 20; level += 1) deep = { op: "addTen", value: deep };

    expect(parseRule({ ...base, onesTop: deep }).ok).toBe(false);
  });

  test("rejects constants outside small integers", () => {
    expect(parseRule({ ...base, onesTop: { op: "const", value: 1e9 } }).ok).toBe(false);
  });

  test("every known rule passes the same validator induced rules face", () => {
    expect(knownRules.filter((rule) => !parseRule(rule).ok)).toEqual([]);
  });

  test("Free Ten is simpler than the correct rule by exactly the missing decrement", () => {
    expect(ruleComplexity(correctRule) - ruleComplexity(freeTenRule)).toBeGreaterThan(0);
  });
});
