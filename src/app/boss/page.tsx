"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import bossIdle from "@/assets/clay/boss-free-ten-idle.webp";
import labBackdrop from "@/assets/clay/lab-backdrop.webp";
import { AppShell } from "@/components/app/app-shell";
import { NoBossYet } from "@/components/app/no-boss-yet";
import { PrimaryCta } from "@/components/app/primary-cta";
import { RuleArt } from "@/components/app/rule-glyph";
import { PredictBoss } from "@/components/boss/predict-boss";
import { ClayIcon } from "@/components/clay/clay-icon";
import { ClayTag } from "@/components/clay";
import { runRule } from "@/engine/rules/interpreter";
import { useBoss } from "@/lib/use-boss";
import { useRunStore } from "@/store/run-store";

const columnWork = (top: number, bottom: number, result: number): string =>
  top - bottom === result
    ? `${String(top)} − ${String(bottom)} = ${String(result)}`
    : `${String(bottom)} − ${String(top)} = ${String(result)}`;

export default function BossPage() {
  const boss = useBoss();
  const prediction = useRunStore((state) => state.prediction);
  const recordPrediction = useRunStore((state) => state.recordPrediction);
  const completeStages = useRunStore((state) => state.completeStages);
  const evidence = boss?.traces.at(-1);
  const mirror =
    boss !== null && evidence !== undefined ? runRule(boss.rule, evidence.problem) : null;

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
        {boss === null ? null : boss.card.id === "free-ten" ? (
          <Image
            src={bossIdle}
            alt="The rule GLITCH found, standing up as a character"
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
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-small font-bold text-coral-700">A rule woke up</p>
                <h1 className="mt-1 text-h1 text-ink">{boss.card.name}</h1>
              </div>
              <ClayTag tone="coral">Stage 4</ClayTag>
            </div>
            <p className="text-small text-ink-soft">This rule seems to explain your steps.</p>

            {mirror === null || evidence === undefined ? null : (
              <section className="rounded-xl bg-coral-100 p-5">
                <p className="text-caption font-bold tracking-widest text-coral-700 uppercase">
                  The boss copies you
                </p>
                <p className="mt-2 font-mono text-h2 text-ink tabular-nums">
                  {evidence.problem.minuend} &minus; {evidence.problem.subtrahend} &rarr;{" "}
                  {mirror.answer}
                </p>
                <p className="mt-2 text-small text-ink-soft">
                  In the ones it did{" "}
                  {columnWork(mirror.onesTop, evidence.problem.subtrahend % 10, mirror.onesResult)}.
                  In the tens it did{" "}
                  {columnWork(
                    mirror.tensTop,
                    Math.floor(evidence.problem.subtrahend / 10),
                    mirror.tensResult,
                  )}
                  .
                </p>
              </section>
            )}

            <PredictBoss
              rule={boss.rule}
              seen={boss.traces.map((trace) => trace.problem)}
              onPredicted={(problem, predicted, bossAnswer) => {
                recordPrediction({ problem, predicted, bossAnswer });
                completeStages(["boss"]);
              }}
            />

            {prediction === null ? null : <PrimaryCta href="/forge">Break the rule</PrimaryCta>}
          </>
        )}
      </div>
    </AppShell>
  );
}
