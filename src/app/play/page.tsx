"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { AppShell } from "@/components/app/app-shell";
import { SubtractionCanvas } from "@/components/canvas/subtraction-canvas";
import { ClayIcon } from "@/components/clay/clay-icon";
import { ClayTag } from "@/components/clay";
import { solveByColumns } from "@/engine/math/truth";
import type { ReasoningTrace } from "@/events/trace";
import { cx } from "@/lib/cx";
import { journeyStages } from "@/lib/journey";

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
    <AppShell className="px-5 pt-6">
      <header className="mb-6 flex items-center gap-3">
        <Link
          href="/lab"
          aria-label="Back to the lab"
          className="clay-interactive flex size-11 shrink-0 items-center justify-center rounded-md bg-surface text-ink shadow-clay-1 active:translate-y-px"
        >
          <ClayIcon glyph={ArrowLeftIcon} size="md" weight="bold" />
        </Link>
        <div className="flex-1">
          <div className="flex gap-1.5">
            {journeyStages.map((stage, index) => (
              <span
                key={stage.id}
                className={cx(
                  "h-1.5 flex-1 rounded-full",
                  index === 0 ? "bg-violet-500" : "bg-violet-100",
                )}
              />
            ))}
          </div>
          <p className="mt-2 text-caption text-ink-muted">Stage 1 of {journeyStages.length}</p>
        </div>
      </header>

      <section className="mb-5 rounded-xl bg-surface p-5 shadow-clay-2">
        <SubtractionCanvas problem={problem} onComplete={setTrace} />
      </section>

      <section className="rounded-xl bg-surface p-5 shadow-clay-1">
        <h2 className="mb-4 text-small font-bold text-ink-soft">What GLITCH saw</h2>
        {trace === null ? (
          <p className="text-small text-ink-muted">Every step is recorded, not just the answer.</p>
        ) : (
          <div>
            <div className="mb-4 flex items-center gap-2">
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
      </section>
    </AppShell>
  );
}
