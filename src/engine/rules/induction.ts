import type { Observation } from "@/engine/learner/observation";
import { MAX_RULE_NODES, parseRule, ruleComplexity, type RuleProgram } from "./ast";
import { runRule } from "./interpreter";
import { knownRules } from "./known-rules";

export const MAX_PROPOSALS = 3;

export const INDUCTION_PRIMITIVES = [
  "const(value)",
  "var(topOnes | topTens | bottomOnes | bottomTens | onesTop | tensTop)",
  "add, subtract, absoluteDifference, lessThan, equal (left, right)",
  "addTen, decrement (value)",
  "if (condition, then, else)",
];

export type InductionRequest = {
  observations: Observation[];
  primitives: string[];
  maxCandidates: number;
};

export type RuleProposer = (request: InductionRequest) => Promise<unknown[]>;

export type ScoredRule = {
  rule: RuleProgram;
  origin: "known" | "induced";
  answerFit: number;
  stepFit: number;
  consistency: number;
  complexity: number;
  score: number;
};

export type InductionResult = {
  source: "proposer" | "fallback";
  proposalsConsidered: number;
  rejected: { index: number; reason: string }[];
  ranked: ScoredRule[];
};

const WEIGHTS = { answer: 0.35, steps: 0.4, consistency: 0.2, complexity: 0.05 };

function scoreRule(
  rule: RuleProgram,
  origin: ScoredRule["origin"],
  observations: Observation[],
): ScoredRule {
  const outcomes = observations.map((observation) => {
    const run = runRule(rule, observation.problem);
    const answer = run.answer === observation.answer;
    const steps =
      run.onesTop === observation.steps.onesTop && run.tensTop === observation.steps.tensTop;
    return { answer, steps, both: answer && steps };
  });
  const share = (count: number) => (observations.length === 0 ? 0 : count / observations.length);

  const answerFit = share(outcomes.filter((outcome) => outcome.answer).length);
  const stepFit = share(outcomes.filter((outcome) => outcome.steps).length);
  const consistency = share(outcomes.filter((outcome) => outcome.both).length);
  const complexity = ruleComplexity(rule);

  return {
    rule,
    origin,
    answerFit,
    stepFit,
    consistency,
    complexity,
    score:
      WEIGHTS.answer * answerFit +
      WEIGHTS.steps * stepFit +
      WEIGHTS.consistency * consistency -
      WEIGHTS.complexity * (complexity / MAX_RULE_NODES),
  };
}

async function requestProposals(
  proposer: RuleProposer,
  request: InductionRequest,
): Promise<{ source: InductionResult["source"]; proposals: unknown[] }> {
  try {
    const proposals = await proposer(request);
    return { source: "proposer", proposals: Array.isArray(proposals) ? proposals : [] };
  } catch {
    return { source: "fallback", proposals: [] };
  }
}

export async function induceRules(
  observations: Observation[],
  proposer: RuleProposer,
): Promise<InductionResult> {
  const { source, proposals } = await requestProposals(proposer, {
    observations,
    primitives: INDUCTION_PRIMITIVES,
    maxCandidates: MAX_PROPOSALS,
  });

  const considered = proposals.slice(0, MAX_PROPOSALS).map(parseRule);
  const rejected = considered.flatMap((parsed, index) =>
    parsed.ok ? [] : [{ index, reason: parsed.reason }],
  );
  const induced = considered.flatMap((parsed) =>
    parsed.ok ? [scoreRule(parsed.rule, "induced", observations)] : [],
  );
  const known = knownRules.map((rule) => scoreRule(rule, "known", observations));

  return {
    source,
    proposalsConsidered: considered.length,
    rejected,
    ranked: [...induced, ...known].sort((a, b) => b.score - a.score || a.complexity - b.complexity),
  };
}
