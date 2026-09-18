import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { conceptStatements, requiredConceptIds } from "@/engine/learning/explanation";
import { FALLBACK_BETA, MODEL, outputOf, readJson, type ModelOutput } from "./model";

export type ConceptJudgement = { conceptsPresent: string[]; contradiction: boolean };

const judgementSchema = z.object({
  conceptsPresent: z.array(z.string()),
  contradiction: z.boolean(),
});

const conceptList = conceptStatements
  .filter((statement) => statement.required)
  .map((statement) => `- ${statement.id}: ${statement.text}`)
  .join("\n");

export const EXPLANATION_SYSTEM = `You read a child's short explanation of why a subtraction rule gave a wrong answer.

Decide which of these ideas the explanation expresses, in any words a child might use:
${conceptList}

Set contradiction to true only if the explanation says that the wrong rule is right, for example that you can take ten ones and still keep the ten.

Judge only the ideas. Do not grade spelling, grammar or length. Return only the ids from the list.`;

export const explanationFormat = {
  type: "json_schema",
  schema: {
    type: "object",
    properties: {
      conceptsPresent: { type: "array", items: { type: "string", enum: requiredConceptIds } },
      contradiction: { type: "boolean" },
    },
    required: ["conceptsPresent", "contradiction"],
    additionalProperties: false,
  },
} as const;

export function conceptsFromOutput(output: ModelOutput): ConceptJudgement {
  const parsed = judgementSchema.parse(readJson(output));
  return {
    conceptsPresent: parsed.conceptsPresent.filter((id) => requiredConceptIds.includes(id)),
    contradiction: parsed.contradiction,
  };
}

export async function judgeExplanation(
  client: Anthropic,
  ruleName: string,
  explanation: string,
): Promise<ConceptJudgement> {
  const message = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    betas: [FALLBACK_BETA],
    fallbacks: "default",
    output_config: { effort: "low", format: explanationFormat },
    system: EXPLANATION_SYSTEM,
    messages: [
      {
        role: "user",
        content: `The wrong rule was called ${ruleName}. The child wrote:\n\n${explanation}`,
      },
    ],
  });
  return conceptsFromOutput(outputOf(message));
}
