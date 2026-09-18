import type { SubtractionProblem } from "@/engine/math/truth";
import type { RuleProgram } from "@/engine/rules/ast";
import { runRule } from "@/engine/rules/interpreter";
import type { Observation } from "./observation";
import { randomInt, type Random } from "./random";

const anyOtherAnswer = (predicted: number, random: Random): number => {
  const pick = randomInt(random, 0, 98);
  return pick >= predicted ? pick + 1 : pick;
};

export function simulateObservation(
  learner: { rule: RuleProgram; slip: number },
  problem: SubtractionProblem,
  random: Random,
): Observation {
  const run = runRule(learner.rule, problem);
  const answer = random() < learner.slip ? anyOtherAnswer(run.answer, random) : run.answer;
  return { problem, answer, steps: { onesTop: run.onesTop, tensTop: run.tensTop } };
}

export function randomProblem(random: Random): SubtractionProblem {
  const minuend = randomInt(random, 10, 99);
  return { minuend, subtrahend: randomInt(random, 0, minuend) };
}
