"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { AppShell } from "@/components/app/app-shell";
import { TraceReview } from "@/components/app/trace-review";
import { NoRuleResolution } from "@/components/play/no-rule-resolution";
import { SubtractionCanvas } from "@/components/canvas/subtraction-canvas";
import { ClayIcon } from "@/components/clay/clay-icon";
import { MAX_DIAGNOSTIC_QUESTIONS, nextProblem, sessionOutcome } from "@/engine/game/session";
import { observationFromTrace } from "@/engine/learner/observation";
import type { ReasoningTrace } from "@/events/trace";
import { cx } from "@/lib/cx";
import { useHydrated } from "@/lib/use-hydrated";
import { useRunStore } from "@/store/run-store";
import { useCue } from "@/lib/sound/use-cue";

export default function PlayPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const cue = useCue();
  const storedTraces = useRunStore((state) => state.traces);
  const recordTrace = useRunStore((state) => state.recordTrace);
  const completeStages = useRunStore((state) => state.completeStages);
  const resetRun = useRunStore((state) => state.resetRun);
  const guidedCase = useRunStore((state) => state.guidedCase);
  const [reviewing, setReviewing] = useState<ReasoningTrace | null>(null);

  const traces = useMemo(() => (hydrated ? storedTraces : []), [hydrated, storedTraces]);
  const observations = useMemo(() => traces.map(observationFromTrace), [traces]);
  const outcome = sessionOutcome(observations);
  const problem = nextProblem(observations);
  const asked = traces.length;
  const runOver = outcome.kind !== "continue";
  const filled = Math.min(asked, MAX_DIAGNOSTIC_QUESTIONS);
  const turnLabel = runOver
    ? "All done"
    : reviewing === null
      ? "Your turn"
      : "You finished this one";

  const playAgain = () => {
    setReviewing(null);
    resetRun();
  };

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

  return (
    <AppShell className="px-5 pt-6">
      <header className="mb-6 flex items-center gap-3">
        <Link
          href="/run"
          aria-label="Back to the run"
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
                  index < filled
                    ? "bg-mint-500"
                    : !runOver && reviewing === null && index === filled
                      ? "bg-violet-500"
                      : "bg-violet-100",
                )}
              />
            ))}
          </div>
          <p className="mt-2 text-caption text-ink-muted">{turnLabel}</p>
        </div>
      </header>

      {reviewing !== null ? (
        <div className="space-y-5">
          <TraceReview trace={reviewing} />
          {outcome.kind === "boss" ? (
            <button
              type="button"
              onClick={() => {
                cue("boss");
                router.push("/boss");
              }}
              className="clay-interactive h-14 w-full rounded-full bg-linear-to-b from-violet-500 to-violet-600 font-bold text-surface shadow-clay-raised active:translate-y-px"
            >
              See what woke up
            </button>
          ) : outcome.kind === "no-rule-found" ? (
            <NoRuleResolution observations={observations} onPlayAgain={playAgain} />
          ) : (
            <button
              type="button"
              onClick={() => {
                setReviewing(null);
              }}
              className="clay-interactive flex h-14 w-full items-center justify-center rounded-full bg-linear-to-b from-violet-500 to-violet-600 font-bold text-surface shadow-clay-raised active:translate-y-px active:shadow-clay-pressed"
            >
              Another one
            </button>
          )}
        </div>
      ) : outcome.kind === "boss" ? (
        <section className="rounded-xl bg-surface p-5 text-center shadow-clay-2">
          <p className="mb-4 text-body font-bold text-ink">
            GLITCH spotted a pattern in your steps.
          </p>
          <button
            type="button"
            onClick={() => {
              cue("boss");
              router.push("/boss");
            }}
            className="clay-interactive h-14 w-full rounded-full bg-linear-to-b from-violet-500 to-violet-600 font-bold text-surface shadow-clay-raised"
          >
            See what woke up
          </button>
        </section>
      ) : outcome.kind === "no-rule-found" ? (
        <NoRuleResolution observations={observations} onPlayAgain={playAgain} />
      ) : (
        <section className="rounded-xl bg-surface p-5 shadow-clay-2">
          <SubtractionCanvas
            key={`${String(problem.minuend)}-${String(problem.subtrahend)}-${String(asked)}`}
            problem={problem}
            onComplete={finish}
            guided={hydrated && guidedCase}
          />
        </section>
      )}
    </AppShell>
  );
}
