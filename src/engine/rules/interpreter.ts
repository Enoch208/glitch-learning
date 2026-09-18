import type { SubtractionProblem } from "@/engine/math/truth";
import type { Expr, RuleProgram, VariableName } from "./ast";

export type RuleRun = {
  onesTop: number;
  tensTop: number;
  onesResult: number;
  tensResult: number;
  answer: number;
  regrouped: boolean;
};

type Environment = Partial<Record<VariableName, number>>;

function evaluate(expr: Expr, env: Environment): number {
  switch (expr.op) {
    case "const":
      return expr.value;
    case "var": {
      const value = env[expr.name];
      if (value === undefined) throw new RangeError(`${expr.name} is not defined yet`);
      return value;
    }
    case "add":
      return evaluate(expr.left, env) + evaluate(expr.right, env);
    case "subtract":
      return evaluate(expr.left, env) - evaluate(expr.right, env);
    case "absoluteDifference":
      return Math.abs(evaluate(expr.left, env) - evaluate(expr.right, env));
    case "lessThan":
      return evaluate(expr.left, env) < evaluate(expr.right, env) ? 1 : 0;
    case "equal":
      return evaluate(expr.left, env) === evaluate(expr.right, env) ? 1 : 0;
    case "addTen":
      return evaluate(expr.value, env) + 10;
    case "decrement":
      return evaluate(expr.value, env) - 1;
    case "if":
      return evaluate(expr.condition, env) === 0
        ? evaluate(expr.else, env)
        : evaluate(expr.then, env);
  }
}

export function runRule(rule: RuleProgram, problem: SubtractionProblem): RuleRun {
  const inputs: Environment = {
    topOnes: problem.minuend % 10,
    topTens: Math.floor(problem.minuend / 10),
    bottomOnes: problem.subtrahend % 10,
    bottomTens: Math.floor(problem.subtrahend / 10),
  };
  const onesTop = evaluate(rule.onesTop, inputs);
  const tensTop = evaluate(rule.tensTop, inputs);
  const staged: Environment = { ...inputs, onesTop, tensTop };
  const onesResult = evaluate(rule.onesResult, staged);
  const tensResult = evaluate(rule.tensResult, staged);

  return {
    onesTop,
    tensTop,
    onesResult,
    tensResult,
    answer: tensResult * 10 + onesResult,
    regrouped: onesTop !== inputs.topOnes,
  };
}
