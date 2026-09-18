import type OpenAI from "openai";
import { z } from "zod";
import type { Observation } from "@/engine/learner/observation";
import { MAX_PROPOSALS, type RuleProposer } from "@/engine/rules/induction";
import { correctRule } from "@/engine/rules/known-rules";
import { MODEL, outputOf, readJson, type ModelOutput } from "./model";

const exampleProgram = JSON.stringify({
  onesTop: correctRule.onesTop,
  tensTop: correctRule.tensTop,
  onesResult: correctRule.onesResult,
  tensResult: correctRule.tensResult,
});

export const INDUCTION_SYSTEM = `You propose procedural rules that could explain a child's two-digit subtraction steps.

You do not decide whether a rule is correct. A deterministic verifier runs every rule you propose against what the child did.

Return up to ${String(MAX_PROPOSALS)} candidate rules. Prefer the simplest rule that explains every observed answer and every rewritten digit. Do not assume a psychological diagnosis.

Each rule is four expressions in a small language:
- onesTop: the ones digit the child works with (may only read topOnes, topTens, bottomOnes, bottomTens)
- tensTop: the tens digit the child works with (same inputs as onesTop)
- onesResult: the ones digit written in the answer (may also read onesTop, tensTop)
- tensResult: the tens digit written in the answer (may also read onesTop, tensTop)

Expressions are JSON objects, one of:
{"op":"const","value":integer from -20 to 20}
{"op":"var","name":"topOnes"|"topTens"|"bottomOnes"|"bottomTens"|"onesTop"|"tensTop"}
{"op":"add"|"subtract"|"absoluteDifference"|"lessThan"|"equal","left":expr,"right":expr}
{"op":"addTen"|"decrement","value":expr}
{"op":"if","condition":expr,"then":expr,"else":expr}
lessThan and equal give 1 or 0; if takes then when the condition is not 0.

Give each rule a "name" of two to four plain words a child could read, in Title Case, with no underscores. Write each rule's "program" as JSON text of an object with exactly onesTop, tensTop, onesResult and tensResult. Never write JavaScript, Python, prose algorithms or operations outside this list.

Correct regrouping, for reference only:
${exampleProgram}`;

const wrapperSchema = z.object({
  candidates: z.array(z.object({ name: z.string(), program: z.string() })),
});

export const inductionSchema = {
  type: "object",
  properties: {
    candidates: {
      type: "array",
      items: {
        type: "object",
        properties: { name: { type: "string" }, program: { type: "string" } },
        required: ["name", "program"],
        additionalProperties: false,
      },
    },
  },
  required: ["candidates"],
  additionalProperties: false,
};

const describe = (observation: Observation): string =>
  `Problem ${String(observation.problem.minuend)} - ${String(observation.problem.subtrahend)}: ` +
  `the child worked with ones ${String(observation.steps.onesTop)} and tens ${String(observation.steps.tensTop)}, ` +
  `and answered ${String(observation.answer)}.`;

export const buildInductionPrompt = (observations: Observation[]): string =>
  ["What the child did:", ...observations.map(describe)].join("\n");

const jsonOrText = (program: string): unknown => {
  try {
    return JSON.parse(program);
  } catch {
    return program;
  }
};

export function proposalsFromOutput(output: ModelOutput): unknown[] {
  const { candidates } = wrapperSchema.parse(readJson(output));
  return candidates.map((candidate) => {
    const program = jsonOrText(candidate.program);
    const name = candidate.name.trim().slice(0, 40) || "Unnamed rule";
    return typeof program === "object" && program !== null && !Array.isArray(program)
      ? { name, ...program }
      : program;
  });
}

export type ProposerSettings = { model: string; effort: "low" | "medium" | "high" };

export const defaultProposerSettings: ProposerSettings = { model: MODEL, effort: "low" };

export function openAiRuleProposer(
  client: OpenAI,
  settings: ProposerSettings = defaultProposerSettings,
): RuleProposer {
  return async (request) => {
    const response = await client.responses.create({
      model: settings.model,
      instructions: INDUCTION_SYSTEM,
      input: buildInductionPrompt(request.observations),
      reasoning: { effort: settings.effort },
      max_output_tokens: 16000,
      text: {
        format: {
          type: "json_schema",
          name: "rule_candidates",
          schema: inductionSchema,
          strict: true,
        },
      },
    });
    return proposalsFromOutput(outputOf(response));
  };
}
