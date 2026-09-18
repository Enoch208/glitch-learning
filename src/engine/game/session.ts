import type { SubtractionProblem } from "@/engine/math/truth";
import { selectNextProblem } from "@/engine/learner/diagnostic";
import type { Observation } from "@/engine/learner/observation";
import {
  bossReady,
  defaultDiagnosticConfig,
  leadingHypothesis,
  posteriorAfter,
} from "@/engine/learner/posterior";
import { createRandom, randomInt } from "@/engine/learner/random";

export const FIRST_PROBLEM: SubtractionProblem = { minuend: 52, subtrahend: 28 };
export const MAX_DIAGNOSTIC_QUESTIONS = 6;

const POOL_SIZE = 40;
const POOL_SEED = 4049;

export type SessionOutcome =
  { kind: "continue" } | { kind: "boss"; ruleId: string } | { kind: "no-rule-found" };

const problemKey = (problem: SubtractionProblem) =>
  `${String(problem.minuend)}-${String(problem.subtrahend)}`;

function candidatePool(round: number, asked: Set<string>): SubtractionProblem[] {
  const random = createRandom(POOL_SEED + round);
  const pool: SubtractionProblem[] = [];

  while (pool.length < POOL_SIZE) {
    const minuend = randomInt(random, 20, 99);
    const problem = { minuend, subtrahend: randomInt(random, 10, minuend - 1) };
    if (!asked.has(problemKey(problem))) pool.push(problem);
  }

  return pool;
}

export function nextProblem(observations: Observation[]): SubtractionProblem {
  if (observations.length === 0) return FIRST_PROBLEM;

  const asked = new Set(observations.map((observation) => problemKey(observation.problem)));
  return selectNextProblem(posteriorAfter(observations), candidatePool(observations.length, asked));
}

export function sessionOutcome(observations: Observation[]): SessionOutcome {
  if (bossReady(observations, defaultDiagnosticConfig)) {
    return { kind: "boss", ruleId: leadingHypothesis(posteriorAfter(observations)).id };
  }
  if (observations.length >= MAX_DIAGNOSTIC_QUESTIONS) return { kind: "no-rule-found" };
  return { kind: "continue" };
}
