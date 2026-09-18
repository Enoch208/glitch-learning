"use client";

import { PlaceValueTray } from "@/components/canvas/place-value-tray";
import { observationFromTrace } from "@/engine/learner/observation";
import type { ReasoningTrace } from "@/events/trace";

function setupLine(startTens: number, startOnes: number, tensTop: number, onesTop: number): string {
  const extraOnes = onesTop > startOnes;
  const tenLeft = tensTop < startTens;

  if (extraOnes && tenLeft) return "A ten became ten ones.";
  if (extraOnes) return "Ten ones appeared. The tens stayed.";
  if (tenLeft) return "A ten left. The ones stayed.";
  return "The top row stayed the same.";
}

export function TraceReview({ trace }: { trace: ReasoningTrace }) {
  const startOnes = trace.problem.minuend % 10;
  const startTens = Math.floor(trace.problem.minuend / 10);
  const { steps } = observationFromTrace(trace);

  return (
    <section className="rounded-xl bg-surface p-5 shadow-clay-2">
      <p className="text-small font-bold text-violet-500">You finished this one</p>
      <p className="mt-2 font-mono text-h2 text-ink tabular-nums">
        {trace.problem.minuend} &minus; {trace.problem.subtrahend}
      </p>
      <PlaceValueTray
        tens={steps.tensTop}
        ones={steps.onesTop}
        startOnes={startOnes}
        tenBroken={steps.tensTop < startTens}
        className="mt-4"
      />
      <p className="mt-4 text-body font-bold text-ink">
        {setupLine(startTens, startOnes, steps.tensTop, steps.onesTop)}
      </p>
      <p className="mt-2 text-body text-ink-soft">You wrote {String(trace.finalAnswer)}.</p>
    </section>
  );
}
