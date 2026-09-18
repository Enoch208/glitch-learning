import type { BinaryOp, Expr, InputName, RuleProgram, StageName } from "./ast";

const read = (name: InputName | StageName): Expr => ({ op: "var", name });
const both = (op: BinaryOp, left: Expr, right: Expr): Expr => ({ op, left, right });
const onesTooSmall = both("lessThan", read("topOnes"), read("bottomOnes"));

const regroupedOnes: Expr = {
  op: "if",
  condition: onesTooSmall,
  then: { op: "addTen", value: read("topOnes") },
  else: read("topOnes"),
};

const columnwise = {
  onesResult: both("subtract", read("onesTop"), read("bottomOnes")),
  tensResult: both("subtract", read("tensTop"), read("bottomTens")),
};

export const correctRule: RuleProgram = {
  name: "Correct regrouping",
  onesTop: regroupedOnes,
  tensTop: {
    op: "if",
    condition: onesTooSmall,
    then: { op: "decrement", value: read("topTens") },
    else: read("topTens"),
  },
  ...columnwise,
};

export const freeTenRule: RuleProgram = {
  name: "Free Ten",
  onesTop: regroupedOnes,
  tensTop: read("topTens"),
  ...columnwise,
};

export const flipFlopRule: RuleProgram = {
  name: "Flip Flop",
  onesTop: read("topOnes"),
  tensTop: read("topTens"),
  onesResult: both("absoluteDifference", read("topOnes"), read("bottomOnes")),
  tensResult: both("absoluteDifference", read("topTens"), read("bottomTens")),
};

export const knownRules: RuleProgram[] = [correctRule, freeTenRule, flipFlopRule];
