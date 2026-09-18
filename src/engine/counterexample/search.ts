import {
  isTwoDigitSubtraction,
  solveByColumns,
  type SubtractionProblem,
} from "@/engine/math/truth";
import type { RuleProgram } from "@/engine/rules/ast";
import { runRule } from "@/engine/rules/interpreter";

export type ForgeEvaluation = {
  validProblem: boolean;
  activatesTargetRule: boolean;
  truthAnswer: number | null;
  glitchAnswer: number | null;
  contradictsRule: boolean;
  score: number;
};

export type ForgeHint = { text: string; problem: SubtractionProblem | null };

const friendliness = (problem: SubtractionProblem): number =>
  0.5 + 0.5 * (1 - (problem.minuend - 10) / 89);

export function evaluateForge(rule: RuleProgram, problem: SubtractionProblem): ForgeEvaluation {
  if (!isTwoDigitSubtraction(problem)) {
    return {
      validProblem: false,
      activatesTargetRule: false,
      truthAnswer: null,
      glitchAnswer: null,
      contradictsRule: false,
      score: 0,
    };
  }

  const truth = solveByColumns(problem);
  const glitch = runRule(rule, problem);
  const contradictsRule = glitch.answer !== truth.answer;

  return {
    validProblem: true,
    activatesTargetRule:
      contradictsRule || glitch.onesTop !== truth.onesTop || glitch.tensTop !== truth.tensTop,
    truthAnswer: truth.answer,
    glitchAnswer: glitch.answer,
    contradictsRule,
    score: contradictsRule ? friendliness(problem) : 0,
  };
}

export function findCounterexamples(rule: RuleProgram, limit: number): SubtractionProblem[] {
  const found: { problem: SubtractionProblem; score: number }[] = [];

  for (let minuend = 20; minuend <= 99; minuend += 1) {
    for (let subtrahend = 10; subtrahend < minuend; subtrahend += 1) {
      const problem = { minuend, subtrahend };
      const evaluation = evaluateForge(rule, problem);
      if (evaluation.contradictsRule) found.push({ problem, score: evaluation.score });
    }
  }

  return found
    .sort((a, b) => b.score - a.score || a.problem.subtrahend - b.problem.subtrahend)
    .slice(0, limit)
    .map((entry) => entry.problem);
}

export function forgeHints(rule: RuleProgram): ForgeHint[] {
  const [best] = findCounterexamples(rule, 1);
  if (best === undefined) return [];

  const onesTooSmall = best.minuend % 10 < best.subtrahend % 10;
  return [
    {
      text: onesTooSmall
        ? "Try a problem where the top ones digit is smaller than the bottom one."
        : "Try a problem where the tens columns do different things.",
      problem: null,
    },
    {
      text: `Try one like ${String(best.minuend)} minus ${String(best.subtrahend)}.`,
      problem: best,
    },
  ];
}
