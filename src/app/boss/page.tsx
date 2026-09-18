"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import bossIdle from "@/assets/clay/boss-free-ten-idle.webp";
import labBackdrop from "@/assets/clay/lab-backdrop.webp";
import { AppShell } from "@/components/app/app-shell";
import { NoBossYet } from "@/components/app/no-boss-yet";
import { PrimaryCta } from "@/components/app/primary-cta";
import { RuleArt } from "@/components/app/rule-glyph";
import { PredictBoss } from "@/components/boss/predict-boss";
import { REVEAL_BEATS, RuleReplay } from "@/components/boss/rule-replay";
import { ClayIcon } from "@/components/clay/clay-icon";
import { ClayTag } from "@/components/clay";
import { solveByColumns } from "@/engine/math/truth";
import { runRule } from "@/engine/rules/interpreter";
import { useBoss } from "@/lib/use-boss";
import { useCue } from "@/lib/sound/use-cue";
import { useTimeline } from "@/lib/use-timeline";
import { useRunStore } from "@/store/run-store";

const REVEAL_MARKS = [350, 800, 1250, 1650];

export default function BossPage() {
  const boss = useBoss();
  const cue = useCue();
  const prediction = useRunStore((state) => state.prediction);
  const recordPrediction = useRunStore((state) => state.recordPrediction);
  const completeStages = useRunStore((state) => state.completeStages);
  const guidedCase = useRunStore((state) => state.guidedCase);
  const discoverRule = useRunStore((state) => state.discoverRule);
  const discoverInduced = useRunStore((state) => state.discoverInduced);
  const beat = useTimeline(boss !== null, REVEAL_MARKS);

  useEffect(() => {
    if (boss === null) return;
    if (boss.card.id === "induced") discoverInduced(boss.rule.name);
    else discoverRule(boss.card.id);
  }, [boss, discoverRule, discoverInduced]);

  useEffect(() => {
    if (beat === REVEAL_BEATS.glitch) cue("boss");
  }, [beat, cue]);

  const telling =
    boss === null
      ? undefined
      : ([...boss.traces]
          .reverse()
          .find(
            (trace) =>
              runRule(boss.rule, trace.problem).answer === trace.finalAnswer &&
              trace.finalAnswer !== solveByColumns(trace.problem).answer,
          ) ?? boss.traces.at(-1));
  const explained =
    boss === null
      ? 0
      : boss.traces.filter(
          (trace) => runRule(boss.rule, trace.problem).answer === trace.finalAnswer,
        ).length;
  const settled = beat >= REVEAL_BEATS.settled;

  return (
    <AppShell>
      <div className="relative h-64 overflow-hidden bg-sky-100">
        <Image
          src={labBackdrop}
          alt=""
          fill
          sizes="24rem"
          className="object-cover object-bottom"
          priority
        />
        {boss === null || beat < REVEAL_BEATS.embodied ? null : boss.card.id === "free-ten" ? (
          <Image
            src={bossIdle}
            alt="Free Ten, gripping its rod so it cannot come apart"
            width={66}
            height={200}
            className="animate-clay-pop absolute bottom-2 left-1/2 -translate-x-1/2"
            priority
          />
        ) : (
          <div className="animate-clay-pop absolute bottom-12 left-1/2 -translate-x-1/2">
            <RuleArt name={boss.card.glyph} size="lg" />
          </div>
        )}
        <Link
          href="/run"
          aria-label="Back to the run"
          className="clay-interactive absolute top-5 left-5 flex size-11 items-center justify-center rounded-md bg-surface text-ink shadow-clay-1 active:translate-y-px"
        >
          <ClayIcon glyph={ArrowLeftIcon} size="md" weight="bold" />
        </Link>
      </div>

      <div className="relative -mt-6 space-y-5 rounded-t-2xl bg-canvas px-5 pt-6">
        {boss === null ? (
          <NoBossYet />
        ) : (
          <>
            {settled ? (
              <div className="animate-clay-pop space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-small font-bold text-coral-700">A strange rule woke up</p>
                    <h1 className="mt-1 text-h1 text-ink">{boss.card.name}</h1>
                  </div>
                  <ClayTag tone="coral">Stage 4</ClayTag>
                </div>
                <p className="text-small text-ink-soft">
                  {boss.card.hint}. I found this rule hiding in your steps.{" "}
                  {explained === boss.traces.length
                    ? "It explains every one of your answers."
                    : `It explains ${String(explained)} of your ${String(boss.traces.length)} answers.`}
                </p>
              </div>
            ) : (
              <p className="text-body font-bold text-violet-600" aria-live="polite">
                Something in your steps looks strange&hellip;
              </p>
            )}

            {telling === undefined ? null : (
              <RuleReplay problem={telling.problem} rule={boss.rule} beat={beat} />
            )}

            {settled ? (
              <>
                <PredictBoss
                  rule={boss.rule}
                  seen={boss.traces.map((trace) => trace.problem)}
                  onPredicted={(problem, predicted, bossAnswer) => {
                    recordPrediction({ problem, predicted, bossAnswer });
                    completeStages(["boss"]);
                  }}
                />
                {prediction === null ? null : <PrimaryCta href="/forge">Trap the boss</PrimaryCta>}
                {guidedCase ? (
                  <Link
                    href="/lab"
                    className="block rounded-md bg-surface p-4 text-center text-small font-bold text-violet-600 shadow-clay-1"
                  >
                    Why did GLITCH choose this boss? See the lab
                  </Link>
                ) : null}
              </>
            ) : null}
          </>
        )}
      </div>
    </AppShell>
  );
}
