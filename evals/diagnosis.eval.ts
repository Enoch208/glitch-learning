import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test } from "vitest";
import { evaluateStrategies } from "@/engine/eval/diagnose";
import { selectNextProblem } from "@/engine/learner/diagnostic";
import { uniformPrior } from "@/engine/learner/posterior";
import { createRandom } from "@/engine/learner/random";
import { randomProblem } from "@/engine/learner/synthetic";

const options = { learnersPerRule: 125, maxQuestions: 6, seed: 2026 };

const percentile = (values: number[], fraction: number): number => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(fraction * sorted.length))] ?? 0;
};

test("diagnosis against baselines on seeded synthetic learners", () => {
  const reports = evaluateStrategies(options);

  const random = createRandom(options.seed);
  const timings = Array.from({ length: 400 }, () => {
    const candidates = Array.from({ length: 30 }, () => randomProblem(random));
    const started = performance.now();
    selectNextProblem(uniformPrior(), candidates);
    return performance.now() - started;
  });

  const result = {
    generatedAt: new Date().toISOString(),
    options,
    reports,
    diagnosticSelectionMs: {
      p50: Number(percentile(timings, 0.5).toFixed(3)),
      p95: Number(percentile(timings, 0.95).toFixed(3)),
      samples: timings.length,
    },
  };

  mkdirSync("evals/results", { recursive: true });
  writeFileSync("evals/results/diagnosis.json", `${JSON.stringify(result, null, 2)}\n`);

  expect(reports.every((report) => report.learners === 4 * options.learnersPerRule)).toBe(true);
});
