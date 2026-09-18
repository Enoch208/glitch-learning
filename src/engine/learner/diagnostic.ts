import type { SubtractionProblem } from "@/engine/math/truth";
import { runRule } from "@/engine/rules/interpreter";
import { entropy } from "./entropy";
import { OTHER_ANSWERS, answerLikelihood, hypotheses, normalise } from "./posterior";

export function expectedInformationGain(posterior: number[], problem: SubtractionProblem): number {
  const predictions = hypotheses.map((hypothesis) => runRule(hypothesis.rule, problem).answer);
  const outcomes = [...new Set(predictions)];
  const unpredicted = OTHER_ANSWERS + 1 - outcomes.length;

  const outcomeWeights = [
    ...outcomes.map((answer) =>
      hypotheses.map(
        (hypothesis, index) =>
          (posterior[index] ?? 0) * answerLikelihood(hypothesis, predictions[index] ?? -1, answer),
      ),
    ),
    hypotheses.map(
      (hypothesis, index) =>
        ((posterior[index] ?? 0) * hypothesis.slip * unpredicted) / OTHER_ANSWERS,
    ),
  ];

  const expected = outcomeWeights.reduce((sum, weights) => {
    const mass = weights.reduce((total, weight) => total + weight, 0);
    return mass === 0 ? sum : sum + mass * entropy(normalise(weights));
  }, 0);

  return entropy(posterior) - expected;
}

export function selectNextProblem(
  posterior: number[],
  candidates: SubtractionProblem[],
): SubtractionProblem {
  const scored = candidates.map((problem) => ({
    problem,
    gain: expectedInformationGain(posterior, problem),
  }));
  const [best] = scored.sort((a, b) => b.gain - a.gain);
  if (best === undefined) throw new RangeError("no candidate problems to choose from");
  return best.problem;
}
