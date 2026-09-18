"use client";

import Link from "next/link";
import { AppShell } from "@/components/app/app-shell";
import { InstrumentSection, Reading } from "@/components/app/instrument";
import { nextProblem, sessionOutcome } from "@/engine/game/session";
import { expectedInformationGain } from "@/engine/learner/diagnostic";
import { entropy } from "@/engine/learner/entropy";
import { observationFromTrace } from "@/engine/learner/observation";
import { hypotheses, posteriorAfter } from "@/engine/learner/posterior";
import { runRule } from "@/engine/rules/interpreter";
import { correctRule } from "@/engine/rules/known-rules";
import { useHydrated } from "@/lib/use-hydrated";
import { useRunStore } from "@/store/run-store";

const hypothesisNames: Partial<Record<string, string>> = {
  correct: "Correct regrouping",
  "free-ten": "Free Ten",
  "flip-flop": "Flip Flop",
  slip: "Careless slip",
};

export default function LabInspectorPage() {
  const hydrated = useHydrated();
  const traces = useRunStore((state) => state.traces);
  const observations = (hydrated ? traces : []).map(observationFromTrace);
  const posterior = posteriorAfter(observations);
  const outcome = sessionOutcome(observations);
  const upcoming = nextProblem(observations);
  const gain = expectedInformationGain(posterior, upcoming);

  return (
    <AppShell className="space-y-5 px-5 pt-8">
      <header>
        <p className="font-mono text-caption tracking-widest text-violet-500 uppercase">Lab</p>
        <h1 className="mt-2 text-h1 text-ink">Inside the session</h1>
        <p className="mt-2 text-small text-ink-muted">
          What the learner never sees. Updates as they play on this device.
        </p>
      </header>

      <InstrumentSection title="Observed">
        {observations.length === 0 ? (
          <p className="text-small text-ink-muted">
            Nothing observed yet.{" "}
            <Link href="/play" className="font-bold text-violet-500">
              Answer a problem
            </Link>{" "}
            and come back.
          </p>
        ) : (
          observations.map((observation, index) => {
            const truth = runRule(correctRule, observation.problem);
            const regrouped = observation.steps.onesTop !== observation.problem.minuend % 10;
            const paidTen = observation.steps.tensTop === truth.tensTop;
            return (
              <div
                key={`${String(index)}-${String(observation.answer)}`}
                className="border-b border-violet-50 py-2 font-mono text-caption text-ink-soft last:border-0"
              >
                <p className="text-small font-bold text-ink">
                  {observation.problem.minuend} &minus; {observation.problem.subtrahend} &rarr;{" "}
                  {observation.answer}
                </p>
                <p>
                  borrowed {regrouped ? "yes" : "no"} &middot; ones {observation.steps.onesTop}{" "}
                  &middot; tens {observation.steps.tensTop}{" "}
                  {regrouped && !paidTen ? "(ten not paid for)" : ""}
                </p>
              </div>
            );
          })
        )}
      </InstrumentSection>

      <InstrumentSection title="Candidate rules">
        {hypotheses.map((hypothesis, index) => {
          const confidence = posterior[index] ?? 0;
          return (
            <div key={hypothesis.id} className="py-1.5">
              <div className="flex justify-between font-mono text-caption">
                <span className="text-ink-soft">
                  {hypothesisNames[hypothesis.id] ?? hypothesis.id}
                </span>
                <span className="font-bold text-ink tabular-nums">{confidence.toFixed(2)}</span>
              </div>
              <progress
                value={confidence}
                max={1}
                aria-label={`Model confidence for ${hypothesisNames[hypothesis.id] ?? hypothesis.id}`}
                className="mt-1 h-2 w-full overflow-hidden rounded-full"
              />
            </div>
          );
        })}
        <p className="mt-3 text-caption text-ink-muted">
          Model confidence over these rules, not a claim about what a child is thinking.
        </p>
      </InstrumentSection>

      <InstrumentSection title="Decision">
        <Reading label="Uncertainty" value={`${entropy(posterior).toFixed(2)} bits`} />
        <Reading
          label="Boss gate"
          value={
            outcome.kind === "boss"
              ? "open"
              : outcome.kind === "no-rule-found"
                ? "closed, run over"
                : "closed"
          }
          note="needs a misconception leading at 0.75, 0.20 clear, on two problems it gets wrong"
        />
        <Reading
          label="Next question"
          value={`${String(upcoming.minuend)} − ${String(upcoming.subtrahend)}`}
          note={`expected information gain ${gain.toFixed(2)} bits`}
        />
      </InstrumentSection>
    </AppShell>
  );
}
