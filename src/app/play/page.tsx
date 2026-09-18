"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { AppShell } from "@/components/app/app-shell";
import { PrimaryCta } from "@/components/app/primary-cta";
import { TraceReview } from "@/components/app/trace-review";
import { SubtractionCanvas } from "@/components/canvas/subtraction-canvas";
import { ClayIcon } from "@/components/clay/clay-icon";
import { MAX_DIAGNOSTIC_QUESTIONS, nextProblem, sessionOutcome } from "@/engine/game/session";
import { observationFromTrace } from "@/engine/learner/observation";
import type { ReasoningTrace } from "@/events/trace";
import { cx } from "@/lib/cx";
import { useHydrated } from "@/lib/use-hydrated";
import { useRunStore } from "@/store/run-store";

export default function PlayPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const storedTraces = useRunStore((state) => state.traces);
  const recordTrace = useRunStore((state) => state.recordTrace);
  const completeStages = useRunStore((state) => state.completeStages);
  const [reviewing, setReviewing] = useState<ReasoningTrace | null>(null);

  const traces = useMemo(() => (hydrated ? storedTraces : []), [hydrated, storedTraces]);
  const observations = useMemo(() => traces.map(observationFromTrace), [traces]);
  const outcome = sessionOutcome(observations);
  const problem = nextProblem(observations);
  const asked = traces.length;

  const finish = (trace: ReasoningTrace) => {
    const result = sessionOutcome([...observations, observationFromTrace(trace)]);
    recordTrace(trace);
    completeStages(
      result.kind === "boss"
        ? ["encounter", "observation", "diagnostic"]
        : ["encounter", "observation"],
    );
    setReviewing(trace);
  };

  const current = reviewing === null ? asked + 1 : asked;
  const questionLabel = `Question ${String(current)} of up to ${String(MAX_DIAGNOSTIC_QUESTIONS)}`;

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
            {Array.from({ length: MAX_DIAGNOSTIC_QUESTIONS }, (_, index) => (
              <span
                key={index}
                className={cx(
                  "h-1.5 flex-1 rounded-full",
                  index < asked
                    ? "bg-mint-500"
                    : index === asked && reviewing === null
                      ? "bg-violet-500"
                      : "bg-violet-100",
                )}
              />
            ))}
          </div>
          <p className="mt-2 text-caption text-ink-muted">{questionLabel}</p>
        </div>
      </header>

      {reviewing !== null ? (
        <div className="space-y-5">
          <TraceReview trace={reviewing} />
          {outcome.kind === "boss" ? (
            <PrimaryCta href="/boss">Meet the rule</PrimaryCta>
          ) : outcome.kind === "no-rule-found" ? (
            <>
              <section className="rounded-xl bg-mint-100 p-5 text-center">
                <p className="text-body font-bold text-mint-700">No rule to break this time.</p>
                <p className="mt-1 text-small text-ink-soft">Your regrouping held up every time.</p>
              </section>
              <PrimaryCta href="/">Back home</PrimaryCta>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setReviewing(null);
              }}
              className="clay-interactive flex h-14 w-full items-center justify-center rounded-full bg-linear-to-b from-violet-400 to-violet-500 font-bold text-surface shadow-clay-raised active:translate-y-px active:shadow-clay-pressed"
            >
              Next question
            </button>
          )}
        </div>
      ) : outcome.kind === "boss" ? (
        <section className="rounded-xl bg-surface p-5 text-center shadow-clay-2">
          <p className="mb-4 text-body font-bold text-ink">GLITCH found a rule in your steps.</p>
          <button
            type="button"
            onClick={() => {
              router.push("/boss");
            }}
            className="clay-interactive h-14 w-full rounded-full bg-linear-to-b from-violet-400 to-violet-500 font-bold text-surface shadow-clay-raised"
          >
            Meet the rule
          </button>
        </section>
      ) : outcome.kind === "no-rule-found" ? (
        <section className="rounded-xl bg-surface p-5 text-center shadow-clay-2">
          <p className="text-body font-bold text-ink">No rule to break this time.</p>
          <p className="mt-2 text-small text-ink-muted">Your regrouping held up every time.</p>
        </section>
      ) : (
        <section className="rounded-xl bg-surface p-5 shadow-clay-2">
          <SubtractionCanvas
            key={`${String(problem.minuend)}-${String(problem.subtrahend)}-${String(asked)}`}
            problem={problem}
            onComplete={finish}
          />
        </section>
      )}
    </AppShell>
  );
}
