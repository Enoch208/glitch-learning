import type { BetaMessage } from "@anthropic-ai/sdk/resources/beta/messages/messages";

export const MODEL = "claude-opus-5";
export const FALLBACK_BETA = "server-side-fallback-2026-07-01";

export type ModelOutput = { stopReason: string | null; text: string | null };

export function outputOf(message: BetaMessage): ModelOutput {
  const text = message.content.find((block) => block.type === "text");
  return {
    stopReason: message.stop_reason,
    text: text?.type === "text" ? text.text : null,
  };
}

export function readJson(output: ModelOutput): unknown {
  if (output.stopReason === "refusal") throw new Error("the model refused the request");
  if (output.stopReason === "max_tokens") throw new Error("the model output was cut off");
  if (output.text === null) throw new Error("the model returned no text");
  return JSON.parse(output.text);
}

export const hasModelKey = (): boolean => (process.env.ANTHROPIC_API_KEY ?? "").length > 0;
