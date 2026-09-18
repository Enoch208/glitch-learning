import { runRule } from "@/engine/rules/interpreter";
import type { RuleProgram } from "@/engine/rules/ast";
import { correctRule, flipFlopRule, freeTenRule } from "@/engine/rules/known-rules";
import type { Observation } from "./observation";

export type Hypothesis = { id: string; rule: RuleProgram; slip: number };

export type DiagnosticConfig = {
  bossLeading: number;
  bossLead: number;
  minDiscriminating: number;
  stepSlip: number;
};

export const defaultDiagnosticConfig: DiagnosticConfig = {
  bossLeading: 0.75,
  bossLead: 0.2,
  minDiscriminating: 2,
  stepSlip: 0.1,
};

export const OTHER_ANSWERS = 99;

export const hypotheses: Hypothesis[] = [
  { id: "correct", rule: correctRule, slip: 0.05 },
  { id: "free-ten", rule: freeTenRule, slip: 0.05 },
  { id: "flip-flop", rule: flipFlopRule, slip: 0.05 },
  { id: "slip", rule: correctRule, slip: 0.4 },
];

export const uniformPrior = (): number[] => hypotheses.map(() => 1 / hypotheses.length);

export const answerLikelihood = (hypothesis: Hypothesis, predicted: number, observed: number) =>
  predicted === observed ? 1 - hypothesis.slip : hypothesis.slip / OTHER_ANSWERS;

function likelihood(hypothesis: Hypothesis, observation: Observation, config: DiagnosticConfig) {
  const run = runRule(hypothesis.rule, observation.problem);
  const stepNoise = Math.max(hypothesis.slip, config.stepSlip);
  const step = (predicted: number, observed: number) =>
    predicted === observed ? 1 - stepNoise : stepNoise;

  return (
    answerLikelihood(hypothesis, run.answer, observation.answer) *
    step(run.onesTop, observation.steps.onesTop) *
    step(run.tensTop, observation.steps.tensTop)
  );
}

export const normalise = (weights: number[]): number[] => {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return total === 0 ? weights.map(() => 1 / weights.length) : weights.map((w) => w / total);
};

export function posteriorAfter(
  observations: Observation[],
  prior: number[] = uniformPrior(),
  config: DiagnosticConfig = defaultDiagnosticConfig,
): number[] {
  return observations.reduce(
    (current, observation) =>
      normalise(
        hypotheses.map(
          (hypothesis, index) =>
            (current[index] ?? 0) * likelihood(hypothesis, observation, config),
        ),
      ),
    prior,
  );
}

const ranked = (posterior: number[]) =>
  hypotheses
    .map((hypothesis, index) => ({ hypothesis, confidence: posterior[index] ?? 0 }))
    .sort((a, b) => b.confidence - a.confidence);

export function leadingHypothesis(posterior: number[]): Hypothesis {
  const [first] = ranked(posterior);
  if (first === undefined) throw new RangeError("no hypotheses to rank");
  return first.hypothesis;
}

export function bossReady(observations: Observation[], config: DiagnosticConfig): boolean {
  const [leader, runnerUp] = ranked(posteriorAfter(observations, uniformPrior(), config));
  if (leader === undefined || runnerUp === undefined) return false;

  const discriminating = observations.filter(
    (observation) =>
      runRule(leader.hypothesis.rule, observation.problem).answer !==
      runRule(runnerUp.hypothesis.rule, observation.problem).answer,
  ).length;

  return (
    leader.confidence >= config.bossLeading &&
    leader.confidence - runnerUp.confidence >= config.bossLead &&
    discriminating >= config.minDiscriminating
  );
}
