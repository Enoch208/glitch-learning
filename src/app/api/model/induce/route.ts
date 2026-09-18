import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { claudeRuleProposer } from "@/ai/induce-rule";
import { hasModelKey } from "@/ai/model";
import { induceRules, type RuleProposer } from "@/engine/rules/induction";

const observationSchema = z.object({
  problem: z.object({
    minuend: z.number().int().min(10).max(99),
    subtrahend: z.number().int().min(0).max(99),
  }),
  answer: z.number().int().min(-99).max(999),
  steps: z.object({
    onesTop: z.number().int().min(0).max(19),
    tensTop: z.number().int().min(0).max(9),
  }),
});

const bodySchema = z.object({ observations: z.array(observationSchema).min(1).max(12) });

const noModel: RuleProposer = () => Promise.reject(new Error("no model key configured"));

export async function POST(request: Request): Promise<Response> {
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: "invalid observations" }, { status: 400 });

  const proposer = hasModelKey() ? claudeRuleProposer(new Anthropic()) : noModel;
  const started = performance.now();
  const result = await induceRules(body.data.observations, proposer);

  return Response.json({
    source: result.source,
    latencyMs: Math.round(performance.now() - started),
    proposalsConsidered: result.proposalsConsidered,
    rejected: result.rejected,
    ranked: result.ranked.map(({ rule, ...scores }) => ({ name: rule.name, rule, ...scores })),
  });
}
