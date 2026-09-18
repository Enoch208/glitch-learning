import { describe, expect, test } from "vitest";
import { buildInductionPrompt, proposalsFromOutput } from "@/ai/induce-rule";
import { conceptsFromOutput } from "@/ai/evaluate-explanation";
import { parseRule } from "@/engine/rules/ast";
import { correctRule } from "@/engine/rules/known-rules";

const program = JSON.stringify({
  onesTop: correctRule.onesTop,
  tensTop: correctRule.tensTop,
  onesResult: correctRule.onesResult,
  tensResult: correctRule.tensResult,
});

describe("reading rule proposals from the model", () => {
  test("each candidate becomes a program the validator accepts", () => {
    const proposals = proposalsFromOutput({
      stopReason: "end_turn",
      text: JSON.stringify({ candidates: [{ name: "Borrow properly", program }] }),
    });
    expect(proposals).toHaveLength(1);
    expect(parseRule(proposals[0]).ok).toBe(true);
  });

  test("a program that is not JSON is passed on to be rejected, not thrown away silently", () => {
    const proposals = proposalsFromOutput({
      stopReason: "end_turn",
      text: JSON.stringify({ candidates: [{ name: "Bad", program: "onesTop - bottomOnes" }] }),
    });
    expect(proposals).toHaveLength(1);
    expect(parseRule(proposals[0]).ok).toBe(false);
  });

  test("a refusal is an error so the caller falls back to the known rules", () => {
    expect(() => proposalsFromOutput({ stopReason: "refusal", text: null })).toThrow(/refus/);
  });

  test("output cut off at the token limit is an error, not a partial answer", () => {
    expect(() =>
      proposalsFromOutput({ stopReason: "max_tokens", text: '{"candidates": [' }),
    ).toThrow(/cut off/);
  });

  test("output in the wrong shape is an error", () => {
    expect(() => proposalsFromOutput({ stopReason: "end_turn", text: '{"rules": []}' })).toThrow();
  });

  test("the prompt carries what the learner did, not the right answers", () => {
    const prompt = buildInductionPrompt([
      { problem: { minuend: 52, subtrahend: 28 }, answer: 34, steps: { onesTop: 12, tensTop: 5 } },
    ]);
    expect(prompt).toContain("52 - 28");
    expect(prompt).toContain("answered 34");
    expect(prompt).not.toContain("24");
  });
});

describe("reading an explanation judgement from the model", () => {
  test("only known concept ids survive", () => {
    const result = conceptsFromOutput({
      stopReason: "end_turn",
      text: JSON.stringify({ conceptsPresent: ["tens-decrease", "made-up"], contradiction: false }),
    });
    expect(result).toEqual({ conceptsPresent: ["tens-decrease"], contradiction: false });
  });

  test("a refusal is an error so the caller falls back to choosing ideas", () => {
    expect(() => conceptsFromOutput({ stopReason: "refusal", text: null })).toThrow(/refus/);
  });
});
