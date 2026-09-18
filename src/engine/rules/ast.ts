import { z } from "zod";

export type InputName = "topOnes" | "topTens" | "bottomOnes" | "bottomTens";
export type StageName = "onesTop" | "tensTop";
export type VariableName = InputName | StageName;
export type BinaryOp = "add" | "subtract" | "absoluteDifference" | "lessThan" | "equal";
export type UnaryOp = "addTen" | "decrement";

export type Expr =
  | { op: "const"; value: number }
  | { op: "var"; name: VariableName }
  | { op: BinaryOp; left: Expr; right: Expr }
  | { op: UnaryOp; value: Expr }
  | { op: "if"; condition: Expr; then: Expr; else: Expr };

export type RuleProgram = {
  name: string;
  onesTop: Expr;
  tensTop: Expr;
  onesResult: Expr;
  tensResult: Expr;
};

export const MAX_EXPR_DEPTH = 8;
export const MAX_RULE_NODES = 60;

const inputNames = ["topOnes", "topTens", "bottomOnes", "bottomTens"] as const;
const stageNames = ["onesTop", "tensTop"] as const;

const exprSchema: z.ZodType<Expr> = z.lazy(() =>
  z.union([
    z.strictObject({ op: z.literal("const"), value: z.number().int().min(-20).max(20) }),
    z.strictObject({ op: z.literal("var"), name: z.enum([...inputNames, ...stageNames]) }),
    z.strictObject({
      op: z.enum(["add", "subtract", "absoluteDifference", "lessThan", "equal"]),
      left: exprSchema,
      right: exprSchema,
    }),
    z.strictObject({ op: z.enum(["addTen", "decrement"]), value: exprSchema }),
    z.strictObject({
      op: z.literal("if"),
      condition: exprSchema,
      then: exprSchema,
      else: exprSchema,
    }),
  ]),
);

const ruleSchema = z.strictObject({
  name: z.string().min(1).max(40),
  onesTop: exprSchema,
  tensTop: exprSchema,
  onesResult: exprSchema,
  tensResult: exprSchema,
});

const children = (expr: Expr): Expr[] => {
  switch (expr.op) {
    case "const":
    case "var":
      return [];
    case "addTen":
    case "decrement":
      return [expr.value];
    case "if":
      return [expr.condition, expr.then, expr.else];
    default:
      return [expr.left, expr.right];
  }
};

const depth = (expr: Expr): number => 1 + Math.max(0, ...children(expr).map(depth));
const nodes = (expr: Expr): number =>
  1 + children(expr).reduce((sum, child) => sum + nodes(child), 0);

const referencesStage = (expr: Expr): boolean =>
  (expr.op === "var" && (stageNames as readonly string[]).includes(expr.name)) ||
  children(expr).some(referencesStage);

const bodies = (rule: RuleProgram): Expr[] => [
  rule.onesTop,
  rule.tensTop,
  rule.onesResult,
  rule.tensResult,
];

export const ruleComplexity = (rule: RuleProgram): number =>
  bodies(rule).reduce((sum, expr) => sum + nodes(expr), 0);

export type RuleParse = { ok: true; rule: RuleProgram } | { ok: false; reason: string };

export function parseRule(input: unknown): RuleParse {
  const parsed = ruleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "not a program in the rule language" };

  const rule = parsed.data;
  if (referencesStage(rule.onesTop) || referencesStage(rule.tensTop)) {
    return { ok: false, reason: "a top digit cannot depend on a rewritten top digit" };
  }
  if (bodies(rule).some((expr) => depth(expr) > MAX_EXPR_DEPTH)) {
    return { ok: false, reason: "program nested too deeply" };
  }
  if (ruleComplexity(rule) > MAX_RULE_NODES) {
    return { ok: false, reason: "program too large" };
  }

  return { ok: true, rule };
}
