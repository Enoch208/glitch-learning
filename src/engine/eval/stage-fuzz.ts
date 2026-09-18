import type { RunEvidence } from "@/engine/game/evidence";
import { STAGE_ORDER, completeStage } from "@/engine/game/machine";
import { createRandom, randomInt, type Random } from "@/engine/learner/random";
import { solveByColumns } from "@/engine/math/truth";
import { runRule } from "@/engine/rules/interpreter";
import { correctRule, freeTenRule } from "@/engine/rules/known-rules";
import type { RuleProgram } from "@/engine/rules/ast";
import type { ReasoningTrace } from "@/events/trace";

const regroupingProblems = [
  { minuend: 52, subtrahend: 28 },
  { minuend: 31, subtrahend: 15 },
  { minuend: 73, subtrahend: 38 },
];

const traceBy = (
  rule: RuleProgram,
  problem: { minuend: number; subtrahend: number },
): ReasoningTrace => {
  const run = runRule(rule, problem);
  return {
    problemId: `p-${String(problem.minuend)}-${String(problem.subtrahend)}`,
    problem,
    events: [
      { type: "digit_edit", at: 1, place: "ones", value: run.onesTop },
      { type: "digit_edit", at: 2, place: "tens", value: run.tensTop },
    ],
    finalAnswer: run.answer,
    startedAt: 0,
    completedAt: 3,
  };
};

function randomEvidence(random: Random): RunEvidence {
  const rule = random() < 0.5 ? freeTenRule : correctRule;
  const traces = regroupingProblems.slice(0, randomInt(random, 0, 3)).map((p) => traceBy(rule, p));
  const forgeChoice = randomInt(random, 0, 2);
  const transferChoice = randomInt(random, 0, 2);

  return {
    traces,
    induced: null,
    prediction:
      random() < 0.5
        ? null
        : { problem: { minuend: 20, subtrahend: 17 }, predicted: 13, bossAnswer: 13 },
    forge:
      forgeChoice === 0
        ? null
        : {
            problem: { minuend: 20, subtrahend: 11 },
            truthAnswer: 9,
            glitchAnswer: forgeChoice === 1 ? 19 : 9,
            attempts: 1,
          },
    explanation:
      random() < 0.5
        ? null
        : {
            selected: [],
            missing: [],
            coverage: random() < 0.5 ? 0.5 : 1,
            contradiction: random() < 0.25,
            followUpUsed: false,
          },
    transfers:
      transferChoice === 0
        ? []
        : [{ problem: { minuend: 26, subtrahend: 17 }, answer: 9, passed: transferChoice === 2 }],
  };
}

const independentlyValid = (completed: string[], evidence: RunEvidence): boolean => {
  const isPrefix = completed.every((stage, index) => STAGE_ORDER[index] === stage);
  const wrongAnswers = evidence.traces.filter(
    (trace) => trace.finalAnswer !== solveByColumns(trace.problem).answer,
  ).length;
  const has = (stage: string) => completed.includes(stage);

  return (
    isPrefix &&
    (!has("encounter") || evidence.traces.length > 0) &&
    (!has("diagnostic") || wrongAnswers >= 2) &&
    (!has("boss") || evidence.prediction !== null) &&
    (!has("forge") ||
      (evidence.forge !== null && evidence.forge.glitchAnswer !== evidence.forge.truthAnswer)) &&
    (!has("explain") ||
      (evidence.explanation !== null &&
        evidence.explanation.coverage >= 0.75 &&
        !evidence.explanation.contradiction)) &&
    (!has("transfer") || evidence.transfers.some((transfer) => transfer.passed))
  );
};

export type StageFuzzReport = {
  stageAttempts: number;
  stageTransitionsAccepted: number;
  stageViolationsAccepted: number;
  stageRunsReachingTransfer: number;
};

export function fuzzStageMachine(
  seed: number,
  runs: number,
  attemptsPerRun: number,
): StageFuzzReport {
  const random = createRandom(seed);
  let stageAttempts = 0;
  let stageTransitionsAccepted = 0;
  let stageViolationsAccepted = 0;
  let stageRunsReachingTransfer = 0;

  for (let run = 0; run < runs; run += 1) {
    const evidence = randomEvidence(random);
    let completed: string[] = [];

    for (let attempt = 0; attempt < attemptsPerRun; attempt += 1) {
      const nextUnfinished = STAGE_ORDER.find((candidate) => !completed.includes(candidate));
      const anyStage = STAGE_ORDER[randomInt(random, 0, STAGE_ORDER.length - 1)];
      const stage = (random() < 0.7 ? nextUnfinished : anyStage) ?? "encounter";
      stageAttempts += 1;
      const transition = completeStage(completed, stage, evidence);
      if (!transition.ok || transition.completed === completed) continue;

      stageTransitionsAccepted += 1;
      completed = transition.completed;
      if (!independentlyValid(completed, evidence)) stageViolationsAccepted += 1;
    }

    if (completed.includes("transfer")) stageRunsReachingTransfer += 1;
  }

  return {
    stageAttempts,
    stageTransitionsAccepted,
    stageViolationsAccepted,
    stageRunsReachingTransfer,
  };
}
