import { findCounterexamples } from "@/engine/counterexample/search";
import { solveByColumns } from "@/engine/math/truth";
import { parseRule } from "@/engine/rules/ast";
import { runRule } from "@/engine/rules/interpreter";
import { correctRule, flipFlopRule, freeTenRule } from "@/engine/rules/known-rules";
import { fuzzStageMachine } from "./stage-fuzz";

const top = { op: "var", name: "topOnes" };
const valid = {
  name: "probe",
  onesTop: top,
  tensTop: { op: "var", name: "topTens" },
  onesResult: {
    op: "subtract",
    left: { op: "var", name: "onesTop" },
    right: { op: "var", name: "bottomOnes" },
  },
  tensResult: {
    op: "subtract",
    left: { op: "var", name: "tensTop" },
    right: { op: "var", name: "bottomTens" },
  },
};

const nested = (levels: number): unknown =>
  levels === 0 ? top : { op: "addTen", value: nested(levels - 1) };

export const malformedPrograms: unknown[] = [
  { ...valid, onesTop: { op: "eval", code: "process.exit()" } },
  { ...valid, onesResult: "onesTop - bottomOnes" },
  { ...valid, onesTop: { op: "var", name: "onesTop" } },
  { ...valid, tensTop: { op: "var", name: "tensTop" } },
  { ...valid, onesTop: nested(12) },
  { ...valid, onesTop: { op: "const", value: 1e9 } },
  { ...valid, onesTop: { op: "const", value: 2.5 } },
  { ...valid, onesTop: { op: "var", name: "constructor" } },
  { ...valid, onesTop: { ...top, extra: "field" } },
  { ...valid, tensResult: undefined },
  { ...valid, name: "" },
  { ...valid, onesTop: { op: "add", left: top } },
  null,
  "function () { return 42 }",
  [],
];

export type ReliabilityReport = {
  problemsChecked: number;
  mathTruthFailures: number;
  correctRuleDisagreements: number;
  invalidProgramsTried: number;
  invalidProgramsAccepted: number;
  counterexamplesChecked: number;
  falseCounterexamples: number;
  stageAttempts: number;
  stageTransitionsAccepted: number;
  stageViolationsAccepted: number;
  stageRunsReachingTransfer: number;
};

export function measureReliability(): ReliabilityReport {
  let problemsChecked = 0;
  let mathTruthFailures = 0;
  let correctRuleDisagreements = 0;

  for (let minuend = 10; minuend <= 99; minuend += 1) {
    for (let subtrahend = 0; subtrahend <= minuend; subtrahend += 1) {
      problemsChecked += 1;
      const truth = solveByColumns({ minuend, subtrahend });
      const composed = truth.tensResult * 10 + truth.onesResult;
      if (composed !== minuend - subtrahend || truth.answer !== minuend - subtrahend) {
        mathTruthFailures += 1;
      }
      if (runRule(correctRule, { minuend, subtrahend }).answer !== truth.answer) {
        correctRuleDisagreements += 1;
      }
    }
  }

  const counterexamples = [freeTenRule, flipFlopRule].flatMap((rule) =>
    findCounterexamples(rule, Number.MAX_SAFE_INTEGER).map((problem) => ({ rule, problem })),
  );

  return {
    problemsChecked,
    mathTruthFailures,
    correctRuleDisagreements,
    invalidProgramsTried: malformedPrograms.length,
    invalidProgramsAccepted: malformedPrograms.filter((program) => parseRule(program).ok).length,
    counterexamplesChecked: counterexamples.length,
    ...fuzzStageMachine(2026, 3000, 20),
    falseCounterexamples: counterexamples.filter(
      ({ rule, problem }) => runRule(rule, problem).answer === solveByColumns(problem).answer,
    ).length,
  };
}
