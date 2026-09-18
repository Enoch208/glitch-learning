import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import OpenAI from "openai";
import { expect, test } from "vitest";
import { judgeExplanation } from "@/ai/evaluate-explanation";
import { openAiRuleProposer } from "@/ai/induce-rule";
import { MODEL, hasModelKey } from "@/ai/model";
import type { Observation } from "@/engine/learner/observation";
import { induceRules, inducedRuleVerified, type RuleProposer } from "@/engine/rules/induction";
import { runRule } from "@/engine/rules/interpreter";
import { freeTenRule } from "@/engine/rules/known-rules";
import type { RuleProgram } from "@/engine/rules/ast";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const RUNS = 5;

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

const heldOut = Array.from({ length: 90 }, (_, index) => {
  const minuend = 20 + ((index * 37) % 80);
  return { minuend, subtrahend: 10 + ((index * 53) % (minuend - 10)) };
});

const agreementOnHeldOut = (candidate: RuleProgram, truth: RuleProgram) =>
  heldOut.filter((problem) => runRule(candidate, problem).answer === runRule(truth, problem).answer)
    .length / heldOut.length;

const percentile = (values: number[], fraction: number) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(fraction * sorted.length))] ?? 0;
};

const explanations = [
  {
    text: "the boss made 12 ones but forgot to take one ten away so the tens should be 4 not 5",
    must: ["tens-decrease"],
    may: ["ten-is-ten-ones", "moves-not-creates", "total-same"],
    contradiction: false,
  },
  {
    text: "you can borrow ten ones and still keep all your tens",
    must: [],
    may: [],
    contradiction: true,
  },
  {
    text: "one ten is the same as ten ones, and 52 is still 52 after you regroup it",
    must: ["ten-is-ten-ones", "total-same"],
    may: ["moves-not-creates"],
    contradiction: false,
  },
  {
    text: "I gave the ones ten more but I forgot the ten had to come from somewhere",
    must: ["tens-decrease"],
    may: ["moves-not-creates", "ten-is-ten-ones"],
    contradiction: false,
  },
  {
    text: "when you break a ten you get ten ones, the number doesnt get bigger",
    must: ["ten-is-ten-ones", "moves-not-creates"],
    may: ["total-same"],
    contradiction: false,
  },
  { text: "the answer is 24", must: [], may: [], contradiction: false },
  { text: "i dont know", must: [], may: [], contradiction: false },
  {
    text: "regrouping just moves the value around so the total stays the same",
    must: ["moves-not-creates", "total-same"],
    may: [],
    contradiction: false,
  },
  {
    text: "52 is 5 tens and 2 ones. if you take a ten you have 4 tens and 12 ones",
    must: ["tens-decrease"],
    may: ["ten-is-ten-ones", "total-same", "moves-not-creates"],
    contradiction: false,
  },
];

test("live model evaluation", async () => {
  expect(
    hasModelKey(),
    "Put OPENAI_API_KEY=... in .env or .env.local, then run pnpm eval:model",
  ).toBe(true);
  const client = new OpenAI();
  const proposer = openAiRuleProposer(client);

  const scenarios = [
    {
      label: "Rule not in the library (writes zero when the ones are too small)",
      truth: zeroWhenStuck,
      evidence: [
        observe(zeroWhenStuck, 52, 28),
        observe(zeroWhenStuck, 47, 23),
        observe(zeroWhenStuck, 31, 15),
        observe(zeroWhenStuck, 73, 38),
      ],
    },
    {
      label: "Free Ten",
      truth: freeTenRule,
      evidence: [
        observe(freeTenRule, 52, 28),
        observe(freeTenRule, 47, 23),
        observe(freeTenRule, 31, 15),
      ],
    },
  ];

  const induction = [];
  for (const scenario of scenarios) {
    const runs = [];
    for (let run = 0; run < RUNS; run += 1) {
      const started = performance.now();
      const result = await induceRules(scenario.evidence, proposer);
      const verified = result.ranked.filter(
        (candidate) =>
          candidate.origin === "induced" && inducedRuleVerified(candidate.rule, scenario.evidence),
      );
      const [best] = verified;
      runs.push({
        latencyMs: Math.round(performance.now() - started),
        parsed: result.source === "proposer",
        proposals: result.proposalsConsidered,
        rejected: result.rejected.length,
        verified: verified.length,
        bestName: best?.rule.name ?? null,
        bestHeldOutAgreement:
          best === undefined ? null : agreementOnHeldOut(best.rule, scenario.truth),
      });
    }
    induction.push({ scenario: scenario.label, runs });
  }

  const judged = [];
  for (const sample of explanations) {
    const started = performance.now();
    const judgement = await judgeExplanation(client, "Free Ten", sample.text);
    const allowed = new Set([...sample.must, ...sample.may]);
    judged.push({
      text: sample.text,
      latencyMs: Math.round(performance.now() - started),
      conceptsPresent: judgement.conceptsPresent,
      contradiction: judgement.contradiction,
      agrees:
        sample.must.every((id) => judgement.conceptsPresent.includes(id)) &&
        judgement.conceptsPresent.every((id) => allowed.has(id)) &&
        judgement.contradiction === sample.contradiction,
    });
  }

  const failing: RuleProposer = () => Promise.reject(new Error("provider unavailable"));
  const fallback = await induceRules(scenarios[1]?.evidence ?? [], failing);

  const allInduction = induction.flatMap((entry) => entry.runs);
  const summary = {
    inductionRuns: allInduction.length,
    inductionParsed: allInduction.filter((run) => run.parsed).length,
    proposalsTotal: allInduction.reduce((sum, run) => sum + run.proposals, 0),
    proposalsRejected: allInduction.reduce((sum, run) => sum + run.rejected, 0),
    runsWithVerifiedRule: allInduction.filter((run) => run.verified > 0).length,
    runsRecoveringTheRule: allInduction.filter((run) => run.bestHeldOutAgreement === 1).length,
    inductionLatencyMs: {
      p50: percentile(
        allInduction.map((run) => run.latencyMs),
        0.5,
      ),
      p95: percentile(
        allInduction.map((run) => run.latencyMs),
        0.95,
      ),
    },
    explanationSamples: judged.length,
    explanationAgreement: judged.filter((entry) => entry.agrees).length,
    explanationLatencyMs: {
      p50: percentile(
        judged.map((entry) => entry.latencyMs),
        0.5,
      ),
      p95: percentile(
        judged.map((entry) => entry.latencyMs),
        0.95,
      ),
    },
    fallbackWorks: fallback.source === "fallback" && fallback.ranked[0]?.rule.name === "Free Ten",
  };

  mkdirSync("evals/results", { recursive: true });
  writeFileSync(
    "evals/results/model.json",
    `${JSON.stringify({ generatedAt: new Date().toISOString(), model: MODEL, reasoningEffort: "low", runsPerScenario: RUNS, summary, induction, explanation: judged }, null, 2)}\n`,
  );

  expect(summary.fallbackWorks).toBe(true);
}, 900_000);
