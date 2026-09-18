import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { judgeExplanation } from "@/ai/evaluate-explanation";
import { hasModelKey } from "@/ai/model";
import { evaluateJudgement } from "@/engine/learning/explanation";

const bodySchema = z.object({
  text: z.string().trim().min(1).max(500),
  ruleName: z.string().min(1).max(40),
  attempt: z.union([z.literal(1), z.literal(2)]),
});

export async function POST(request: Request): Promise<Response> {
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: "invalid explanation" }, { status: 400 });
  if (!hasModelKey()) return Response.json({ source: "fallback" });

  const started = performance.now();
  try {
    const judgement = await judgeExplanation(new Anthropic(), body.data.ruleName, body.data.text);
    return Response.json({
      source: "model",
      latencyMs: Math.round(performance.now() - started),
      evaluation: evaluateJudgement(
        judgement.conceptsPresent,
        judgement.contradiction,
        body.data.attempt,
      ),
    });
  } catch {
    return Response.json({ source: "fallback" });
  }
}
