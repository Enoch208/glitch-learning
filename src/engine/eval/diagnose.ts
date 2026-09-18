import type { SubtractionProblem } from "@/engine/math/truth";
import { selectNextProblem } from "@/engine/learner/diagnostic";
import type { Observation } from "@/engine/learner/observation";
import {
  bossReady,
  defaultDiagnosticConfig,
  hypotheses,
  leadingHypothesis,
  posteriorAfter,
  uniformPrior,
  type DiagnosticConfig,
  type Hypothesis,
} from "@/engine/learner/posterior";
import { createRandom, type Random } from "@/engine/learner/random";
import { randomProblem, simulateObservation } from "@/engine/learner/synthetic";
import { runRule } from "@/engine/rules/interpreter";

export type StrategyName = "glitch" | "random-question" | "answer-lookup" | "answer-only";

export type StrategyReport = {
  strategy: StrategyName;
  learners: number;
  correct: number;
  wrongBoss: number;
  falseAccusations: number;
  missed: number;
  medianQuestionsToBoss: number | null;
};

export type EvaluationOptions = { learnersPerRule: number; maxQuestions: number; seed: number };

type Verdict = { diagnosis: string | null; questions: number };

const POOL_SIZE = 30;
const LOOKUP_VOTES = 2;

const pool = (random: Random): SubtractionProblem[] =>
  Array.from({ length: POOL_SIZE }, () => randomProblem(random));

function modelled(
  learner: Hypothesis,
  random: Random,
  maxQuestions: number,
  config: DiagnosticConfig,
  chooseActively: boolean,
): Verdict {
  const observations: Observation[] = [];

  for (let question = 1; question <= maxQuestions; question += 1) {
    const candidates = pool(random);
    const posterior = posteriorAfter(observations, uniformPrior(), config);
    const [fallback] = candidates;
    if (fallback === undefined) break;
    const problem = chooseActively ? selectNextProblem(posterior, candidates) : fallback;
    observations.push(simulateObservation(learner, problem, random));

    if (bossReady(observations, config)) {
      return {
        diagnosis: leadingHypothesis(posteriorAfter(observations, uniformPrior(), config)).id,
        questions: question,
      };
    }
  }

  return { diagnosis: null, questions: maxQuestions };
}

function lookup(learner: Hypothesis, random: Random, maxQuestions: number): Verdict {
  const votes = new Map<string, number>();

  for (let question = 1; question <= maxQuestions; question += 1) {
    const [problem] = pool(random);
    if (problem === undefined) break;
    const observed = simulateObservation(learner, problem, random).answer;
    const matching = hypotheses.filter((h) => runRule(h.rule, problem).answer === observed);
    const [only] = matching;

    if (matching.length === 1 && only !== undefined && only.misconception) {
      const count = (votes.get(only.id) ?? 0) + 1;
      votes.set(only.id, count);
      if (count >= LOOKUP_VOTES) return { diagnosis: only.id, questions: question };
    }
  }

  return { diagnosis: null, questions: maxQuestions };
}

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle] ?? 0;
  return sorted.length % 2 === 1 ? upper : ((sorted[middle - 1] ?? 0) + upper) / 2;
};

const medianOrNull = (values: number[]): number | null =>
  values.length === 0 ? null : median(values);

const strategies: Record<
  StrategyName,
  (learner: Hypothesis, random: Random, maxQuestions: number) => Verdict
> = {
  glitch: (learner, random, max) => modelled(learner, random, max, defaultDiagnosticConfig, true),
  "random-question": (learner, random, max) =>
    modelled(learner, random, max, defaultDiagnosticConfig, false),
  "answer-lookup": lookup,
  "answer-only": (learner, random, max) =>
    modelled(learner, random, max, { ...defaultDiagnosticConfig, evidence: "answer" }, true),
};

export function evaluateStrategies(options: EvaluationOptions): StrategyReport[] {
  return (Object.keys(strategies) as StrategyName[]).map((strategy) => {
    const verdicts = hypotheses.flatMap((learner, ruleIndex) =>
      Array.from({ length: options.learnersPerRule }, (_, learnerIndex) => {
        const random = createRandom(options.seed * 7919 + ruleIndex * 1009 + learnerIndex);
        return { learner, ...strategies[strategy](learner, random, options.maxQuestions) };
      }),
    );

    const rightOutcome = (verdict: (typeof verdicts)[number]) =>
      verdict.learner.misconception
        ? verdict.diagnosis === verdict.learner.id
        : verdict.diagnosis === null;

    return {
      strategy,
      learners: verdicts.length,
      correct: verdicts.filter(rightOutcome).length,
      wrongBoss: verdicts.filter((v) => v.diagnosis !== null && !rightOutcome(v)).length,
      falseAccusations: verdicts.filter((v) => !v.learner.misconception && v.diagnosis !== null)
        .length,
      missed: verdicts.filter((v) => v.learner.misconception && v.diagnosis === null).length,
      medianQuestionsToBoss: medianOrNull(
        verdicts.filter((v) => v.diagnosis !== null).map((v) => v.questions),
      ),
    };
  });
}
