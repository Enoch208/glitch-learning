import { sessionOutcome } from "@/engine/game/session";
import type { Observation } from "@/engine/learner/observation";
import type { SubtractionProblem } from "@/engine/math/truth";
import type { RuleProgram } from "@/engine/rules/ast";
import { runRule } from "@/engine/rules/interpreter";
import { correctRule, flipFlopRule, freeTenRule } from "@/engine/rules/known-rules";

const problems: SubtractionProblem[] = [
  { minuend: 52, subtrahend: 28 },
  { minuend: 31, subtrahend: 15 },
  { minuend: 64, subtrahend: 37 },
  { minuend: 83, subtrahend: 46 },
  { minuend: 75, subtrahend: 18 },
  { minuend: 42, subtrahend: 19 },
];

const learners: { label: string; rule: RuleProgram }[] = [
  { label: "Learner A", rule: freeTenRule },
  { label: "Learner B", rule: flipFlopRule },
  { label: "Learner C", rule: correctRule },
];

function diagnose(rule: RuleProgram) {
  const observations: Observation[] = [];
  for (const problem of problems) {
    const run = runRule(rule, problem);
    observations.push({
      problem,
      answer: run.answer,
      steps: { onesTop: run.onesTop, tensTop: run.tensTop },
    });
    const outcome = sessionOutcome(observations);
    if (outcome.kind !== "continue") return { observations, outcome };
  }
  return { observations, outcome: sessionOutcome(observations) };
}

export const learnerResults = learners.map((learner) => ({
  ...learner,
  ...diagnose(learner.rule),
}));
