"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { NoBossYet } from "@/components/app/no-boss-yet";
import { PrimaryCta } from "@/components/app/primary-cta";
import { StageHeader } from "@/components/app/stage-header";
import { SubtractionCanvas } from "@/components/canvas/subtraction-canvas";
import { BossCrack } from "@/components/forge/boss-crack";
import { transferPassed, transferProblem } from "@/engine/game/transfer";
import { solveByColumns } from "@/engine/math/truth";
import type { ReasoningTrace } from "@/events/trace";
import { useBoss } from "@/lib/use-boss";
import { useCue } from "@/lib/sound/use-cue";
import { useRunStore } from "@/store/run-store";

type Status = "working" | "passed" | "remediate" | "not-yet";

export default function TransferPage() {
  const boss = useBoss();
  const cue = useCue();
  const prediction = useRunStore((state) => state.prediction);
  const forge = useRunStore((state) => state.forge);
  const recordTransfer = useRunStore((state) => state.recordTransfer);
  const completeStages = useRunStore((state) => state.completeStages);
  const [attempt, setAttempt] = useState(1);
  const [status, setStatus] = useState<Status>("working");

  const problem = useMemo(() => {
    if (boss === null) return null;
    const seen = [
      ...boss.traces.map((trace) => trace.problem),
      ...(prediction === null ? [] : [prediction.problem]),
      ...(forge === null ? [] : [forge.problem]),
    ];
    return transferProblem(boss.rule, seen, attempt);
  }, [boss, prediction, forge, attempt]);

  if (boss === null || problem === null) {
    return (
      <AppShell className="px-5 pt-6">
        <StageHeader title="Prove it" stage={7} />
        <NoBossYet />
      </AppShell>
    );
  }

  const finish = (trace: ReasoningTrace) => {
    const passed = transferPassed(problem, trace.finalAnswer);
    recordTransfer({ problem, answer: trace.finalAnswer, passed });
    if (passed) {
      completeStages(["transfer"]);
      cue("victory");
      setStatus("passed");
    } else {
      setStatus(attempt === 1 ? "remediate" : "not-yet");
    }
  };

  const steps = solveByColumns(problem);

  return (
    <AppShell className="space-y-5 px-5 pt-6">
      <StageHeader title="Prove it" stage={7} />

      {status === "working" ? (
        <>
          <section className="rounded-xl bg-violet-50 p-4 text-center">
            <p className="text-caption font-bold tracking-widest text-violet-600 uppercase">
              {attempt === 1 ? "Final round" : "One more try"}
            </p>
            <p className="mt-1 text-body font-bold text-ink">
              One last problem. No boss. No hints.
            </p>
          </section>
          <section className="rounded-xl bg-surface p-5 shadow-clay-2">
            <SubtractionCanvas
              key={`${String(problem.minuend)}-${String(problem.subtrahend)}`}
              problem={problem}
              onComplete={finish}
            />
          </section>
        </>
      ) : status === "passed" ? (
        <>
          <section
            className="flex items-center gap-4 rounded-xl bg-mint-100 p-5"
            aria-live="polite"
          >
            <div className="opacity-50">
              <BossCrack id={boss.card.id} glyph={boss.card.glyph} cracked />
            </div>
            <div className="flex-1">
              <p className="text-caption font-bold tracking-widest text-mint-700 uppercase">
                {problem.minuend} &minus; {problem.subtrahend} = {steps.answer}
              </p>
              <p className="mt-1 text-h2 text-mint-700">You fixed the glitch.</p>
              <p className="mt-1 text-small text-ink-soft">
                You found the bad rule, broke it, and solved a new one without it.
              </p>
            </div>
          </section>
          <PrimaryCta href="/victory">Finish the fight</PrimaryCta>
        </>
      ) : status === "remediate" ? (
        <>
          <section className="rounded-xl bg-surface p-5 shadow-clay-1">
            <p className="text-small font-bold text-ink">Here is how the ten moves.</p>
            <ol className="mt-3 space-y-2 text-small text-ink-soft">
              <li>
                One ten turns into ten ones, so {problem.minuend % 10} becomes {steps.onesTop}.
              </li>
              <li>
                That ten is gone from the tens, so {Math.floor(problem.minuend / 10)} becomes{" "}
                {steps.tensTop}.
              </li>
              <li>
                {steps.onesTop} &minus; {problem.subtrahend % 10} = {steps.onesResult}, and{" "}
                {steps.tensTop} &minus; {Math.floor(problem.subtrahend / 10)} = {steps.tensResult}.
              </li>
            </ol>
          </section>
          <button
            type="button"
            onClick={() => {
              setAttempt(2);
              setStatus("working");
            }}
            className="clay-interactive h-14 w-full rounded-full bg-linear-to-b from-violet-500 to-violet-600 font-bold text-surface shadow-clay-raised active:translate-y-px"
          >
            Try another one
          </button>
        </>
      ) : (
        <>
          <section className="rounded-xl bg-peach-100 p-5 text-center">
            <p className="text-body font-bold text-peach-700">Not yet. That is fine.</p>
            <p className="mt-1 text-small text-ink-soft">
              Your tutor will see exactly where to pick up.
            </p>
          </section>
          <PrimaryCta href="/victory">See your notes</PrimaryCta>
        </>
      )}
    </AppShell>
  );
}
