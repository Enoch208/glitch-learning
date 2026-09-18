import type { Response } from "openai/resources/responses/responses";

export const MODEL = "gpt-5.5";

export type ModelOutput = { stopReason: string | null; text: string | null };

export function outputOf(response: Response): ModelOutput {
  const refused = response.output.some(
    (item) => item.type === "message" && item.content.some((part) => part.type === "refusal"),
  );
  if (refused) return { stopReason: "refusal", text: null };
  if (response.status === "incomplete") {
    return {
      stopReason:
        response.incomplete_details?.reason === "max_output_tokens" ? "max_tokens" : "incomplete",
      text: null,
    };
  }
  return {
    stopReason: "end_turn",
    text: response.output_text === "" ? null : response.output_text,
  };
}

export function readJson(output: ModelOutput): unknown {
  if (output.stopReason === "refusal") throw new Error("the model refused the request");
  if (output.stopReason === "max_tokens") throw new Error("the model output was cut off");
  if (output.text === null) throw new Error("the model returned no text");
  return JSON.parse(output.text);
}

export const hasModelKey = (): boolean => (process.env.OPENAI_API_KEY ?? "").length > 0;
