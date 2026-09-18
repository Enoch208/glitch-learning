import type { SubtractionProblem } from "@/engine/math/truth";
import type { Observation } from "@/engine/learner/observation";
import { defaultDiagnosticConfig, hypotheses } from "@/engine/learner/posterior";
import { createRandom, randomInt, type Random } from "@/engine/learner/random";
import { simulateObservation } from "@/engine/learner/synthetic";
import { runRule } from "@/engine/rules/interpreter";
import { correctRule, knownRules } from "@/engine/rules/known-rules";
import { diagnoseWith, type EvaluationOptions } from "./diagnose";

export type NoisyLearnerKind = "mixed-rules" | "random-answers" | "careless";

export type AbstentionReport = {
  kind: NoisyLearnerKind;
  learners: number;
  abstained: number;
  bosses: Record<string, number>;
};

const pickRule = (random: Random) =>
  knownRules[randomInt(random, 0, knownRules.length - 1)] ?? correctRule;

const noisyLearners: Record<
  NoisyLearnerKind,
  (random: Random) => (problem: SubtractionProblem) => Observation
> = {
  "mixed-rules": (random) => (problem) =>
    simulateObservation({ rule: pickRule(random), slip: 0 }, problem, random),
  "random-answers": (random) => (problem) => {
    const run = runRule(pickRule(random), problem);
    return {
      problem,
      answer: randomInt(random, 0, 99),
      steps: { onesTop: run.onesTop, tensTop: run.tensTop },
    };
  },
  careless: (random) => (problem) =>
    simulateObservation({ rule: correctRule, slip: 0.5 }, problem, random),
};

export function evaluateAbstention(options: EvaluationOptions): AbstentionReport[] {
  const learners = options.learnersPerRule * hypotheses.length;

  return (Object.keys(noisyLearners) as NoisyLearnerKind[]).map((kind, kindIndex) => {
    const bosses: Record<string, number> = {};
    let abstained = 0;

    for (let index = 0; index < learners; index += 1) {
      const random = createRandom(options.seed * 104729 + kindIndex * 7907 + index);
      const verdict = diagnoseWith(
        noisyLearners[kind](random),
        random,
        options.maxQuestions,
        defaultDiagnosticConfig,
        true,
      );
      if (verdict.diagnosis === null) abstained += 1;
      else bosses[verdict.diagnosis] = (bosses[verdict.diagnosis] ?? 0) + 1;
    }

    return { kind, learners, abstained, bosses };
  });
}
