import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { expect, test } from "vitest";
import { judgeExplanation } from "@/ai/evaluate-explanation";
import { claudeRuleProposer } from "@/ai/induce-rule";
import { MODEL, hasModelKey } from "@/ai/model";
import type { Observation } from "@/engine/learner/observation";
import { induceRules } from "@/engine/rules/induction";
import { runRule } from "@/engine/rules/interpreter";
import { freeTenRule } from "@/engine/rules/known-rules";
import type { RuleProgram } from "@/engine/rules/ast";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const zeroWhenStuck: RuleProgram = {
  name: "Zero when stuck",
  onesTop: { op: "var", name: "topOnes" },
  tensTop: { op: "var", name: "topTens" },
  onesResult: {
    op: "if",
    condition: {
      op: "lessThan",
      left: { op: "var", name: "topOnes" },
      right: { op: "var", name: "bottomOnes" },
    },
    then: { op: "const", value: 0 },
    else: {
      op: "subtract",
      left: { op: "var", name: "onesTop" },
      right: { op: "var", name: "bottomOnes" },
    },
  },
  tensResult: {
    op: "subtract",
    left: { op: "var", name: "tensTop" },
    right: { op: "var", name: "bottomTens" },
  },
};

const observe = (rule: RuleProgram, minuend: number, subtrahend: number): Observation => {
  const run = runRule(rule, { minuend, subtrahend });
  return {
    problem: { minuend, subtrahend },
    answer: run.answer,
    steps: { onesTop: run.onesTop, tensTop: run.tensTop },
  };
};

const explanations = [
  {
    text: "the boss made 12 ones but forgot to take one ten away so the tens should be 4 not 5",
    expect: ["tens-decrease"],
    contradiction: false,
  },
  { text: "you can borrow ten ones and still keep all your tens", expect: [], contradiction: true },
  {
    text: "one ten is the same as ten ones, and 52 is still 52 after you regroup it",
    expect: ["ten-is-ten-ones", "total-same"],
    contradiction: false,
  },
];

test("live model check", async () => {
  expect(hasModelKey(), "Put ANTHROPIC_API_KEY=... in .env.local, then run pnpm eval:model").toBe(
    true,
  );
  const client = new Anthropic();
  const proposer = claudeRuleProposer(client);

  const scenarios = [
    {
      label: "rule not in the library",
      truth: "Zero when stuck",
      evidence: [
        observe(zeroWhenStuck, 52, 28),
        observe(zeroWhenStuck, 31, 15),
        observe(zeroWhenStuck, 73, 38),
      ],
    },
    {
      label: "Free Ten",
      truth: "Free Ten",
      evidence: [observe(freeTenRule, 52, 28), observe(freeTenRule, 31, 15)],
    },
  ];

  const induction = [];
  for (const scenario of scenarios) {
    const started = performance.now();
    const result = await induceRules(scenario.evidence, proposer);
    const [top] = result.ranked;
    induction.push({
      scenario: scenario.label,
      source: result.source,
      latencyMs: Math.round(performance.now() - started),
      proposalsConsidered: result.proposalsConsidered,
      rejected: result.rejected.length,
      inducedExplainingEverything: result.ranked.filter(
        (c) => c.origin === "induced" && c.consistency === 1,
      ).length,
      topRule: top?.rule.name ?? null,
      topOrigin: top?.origin ?? null,
      topConsistency: top?.consistency ?? null,
    });
  }

  const judged = [];
  for (const sample of explanations) {
    const started = performance.now();
    const judgement = await judgeExplanation(client, "Free Ten", sample.text);
    judged.push({
      text: sample.text,
      latencyMs: Math.round(performance.now() - started),
      conceptsPresent: judgement.conceptsPresent,
      contradiction: judgement.contradiction,
      agrees:
        sample.expect.every((id) => judgement.conceptsPresent.includes(id)) &&
        judgement.contradiction === sample.contradiction,
    });
  }

  mkdirSync("evals/results", { recursive: true });
  writeFileSync(
    "evals/results/model.json",
    `${JSON.stringify({ generatedAt: new Date().toISOString(), model: MODEL, induction, explanation: judged }, null, 2)}\n`,
  );

  expect(induction.every((entry) => entry.source === "proposer")).toBe(true);
});
