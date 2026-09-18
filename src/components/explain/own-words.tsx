"use client";

import { useState } from "react";
import { z } from "zod";
import type { ExplanationEvaluation } from "@/engine/learning/explanation";

const responseSchema = z.union([
  z.object({
    source: z.literal("model"),
    evaluation: z.object({
      conceptsPresent: z.array(z.string()),
      conceptsMissing: z.array(z.string()),
      contradiction: z.boolean(),
      coverage: z.number(),
      followUp: z.string().nullable(),
    }),
  }),
  z.object({ source: z.literal("fallback") }),
]);

type Status = "writing" | "checking" | "unavailable";

export function OwnWords({
  ruleName,
  attempt,
  onEvaluated,
}: {
  ruleName: string;
  attempt: 1 | 2;
  onEvaluated: (evaluation: ExplanationEvaluation) => void;
}) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("writing");

  const submit = () => {
    setStatus("checking");
    void fetch("/api/explanation/evaluate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, ruleName, attempt }),
    })
      .then((response) => response.json())
      .then((body: unknown) => {
        const parsed = responseSchema.safeParse(body);
        if (parsed.success && parsed.data.source === "model") {
          setStatus("writing");
          onEvaluated(parsed.data.evaluation);
        } else {
          setStatus("unavailable");
        }
      })
      .catch(() => {
        setStatus("unavailable");
      });
  };

  return (
    <section className="rounded-xl bg-surface p-4 shadow-clay-1">
      <label htmlFor="own-words" className="text-small font-bold text-ink">
        Say it in your own words
      </label>
      <textarea
        id="own-words"
        value={text}
        maxLength={500}
        rows={3}
        onChange={(event) => {
          setText(event.target.value);
        }}
        className="mt-2 w-full resize-none rounded-md bg-surface-sunken p-3 text-small text-ink ring-1 ring-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      />
      {status === "unavailable" ? (
        <p className="mt-2 text-caption text-peach-700" aria-live="polite">
          GLITCH cannot read writing right now. Pick the ideas below instead.
        </p>
      ) : (
        <button
          type="button"
          onClick={submit}
          disabled={text.trim().length === 0 || status === "checking"}
          className="clay-interactive mt-3 h-12 w-full rounded-full bg-violet-50 text-small font-bold text-violet-600 shadow-clay-1 active:translate-y-px disabled:pointer-events-none disabled:opacity-45"
        >
          {status === "checking" ? "Reading your idea…" : "Check what I wrote"}
        </button>
      )}
    </section>
  );
}
