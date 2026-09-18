import type OpenAI from "openai";
import { z } from "zod";
import { conceptStatements, requiredConceptIds } from "@/engine/learning/explanation";
import { MODEL, outputOf, readJson, type ModelOutput } from "./model";

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

export const explanationSchema = {
  type: "object",
  properties: {
    conceptsPresent: { type: "array", items: { type: "string", enum: requiredConceptIds } },
    contradiction: { type: "boolean" },
  },
  required: ["conceptsPresent", "contradiction"],
  additionalProperties: false,
};

export function conceptsFromOutput(output: ModelOutput): ConceptJudgement {
  const parsed = judgementSchema.parse(readJson(output));
  return {
    conceptsPresent: parsed.conceptsPresent.filter((id) => requiredConceptIds.includes(id)),
    contradiction: parsed.contradiction,
  };
}

export async function judgeExplanation(
  client: OpenAI,
  ruleName: string,
  explanation: string,
): Promise<ConceptJudgement> {
  const response = await client.responses.create({
    model: MODEL,
    instructions: EXPLANATION_SYSTEM,
    input: `The wrong rule was called ${ruleName}. The child wrote:\n\n${explanation}`,
    reasoning: { effort: "low" },
    max_output_tokens: 4000,
    text: {
      format: {
        type: "json_schema",
        name: "explanation_judgement",
        schema: explanationSchema,
        strict: true,
      },
    },
  });
  return conceptsFromOutput(outputOf(response));
}
