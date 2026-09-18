"use client";

import { useState } from "react";
import { SubtractionCanvas } from "@/components/canvas/subtraction-canvas";
import { ClayCard, ClayTag } from "@/components/clay";
import { solveByColumns } from "@/engine/math/truth";
import type { ReasoningTrace } from "@/events/trace";

const problem = { minuend: 52, subtrahend: 28 };

const describeEvent = (event: ReasoningTrace["events"][number]): string => {
  switch (event.type) {
    case "borrow":
      return "brought ten ones across";
    case "digit_edit":
      return `changed the ${event.place} digit to ${String(event.value)}`;
    case "column_result":
      return `answered ${String(event.value)} in the ${event.place} column`;
    case "answer":
      return `submitted ${String(event.value)}`;
    case "hint":
      return `asked for hint ${String(event.level)}`;
  }
};

export default function PlayPage() {
  const [trace, setTrace] = useState<ReasoningTrace | null>(null);
  const truth = solveByColumns(problem);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <header className="mb-10">
        <p className="mb-3 font-mono text-caption tracking-widest text-violet-500 uppercase">
          Stage 1 &mdash; Encounter
        </p>
        <h1 className="text-display text-ink">Work it out</h1>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <ClayCard padding="roomy">
          <SubtractionCanvas problem={problem} onComplete={setTrace} />
        </ClayCard>

        <ClayCard padding="roomy">
          <h2 className="mb-5 text-small font-bold text-ink-soft">What GLITCH observed</h2>
          {trace === null ? (
            <p className="text-body text-ink-muted">
              Nothing yet. Every step you take is recorded, not just the answer.
            </p>
          ) : (
            <div>
              <div className="mb-5 flex items-center gap-2">
                {trace.finalAnswer === truth.answer ? (
                  <ClayTag tone="mint">Correct</ClayTag>
                ) : (
                  <ClayTag tone="coral">Answered {trace.finalAnswer}</ClayTag>
                )}
                <span className="font-mono text-caption text-ink-muted">truth {truth.answer}</span>
              </div>
              <ol className="space-y-2">
                {trace.events.map((event, index) => (
                  <li
                    key={`${event.type}-${String(index)}`}
                    className="flex gap-3 font-mono text-caption text-ink-soft"
                  >
                    <span className="text-ink-muted">{index + 1}</span>
                    <span>{describeEvent(event)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </ClayCard>
      </div>
    </main>
  );
}
