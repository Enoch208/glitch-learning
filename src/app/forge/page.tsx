"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { NoBossYet } from "@/components/app/no-boss-yet";
import { PrimaryCta } from "@/components/app/primary-cta";
import { StageHeader } from "@/components/app/stage-header";
import { DigitStepper } from "@/components/forge/digit-stepper";
import { TRAP_BEATS, TrapReplay } from "@/components/forge/trap-replay";
import { evaluateForge, forgeHints, type ForgeEvaluation } from "@/engine/counterexample/search";
import { useBoss } from "@/lib/use-boss";
import { useCue } from "@/lib/sound/use-cue";
import { useTimeline } from "@/lib/use-timeline";
import { useRunStore } from "@/store/run-store";

type Digits = { topTens: number; topOnes: number; bottomTens: number; bottomOnes: number };

const HINT_AFTER = 2;
const TRAP_MARKS = [350, 1250, 2100, 2700];

export default function ForgePage() {
  const boss = useBoss();
  const cue = useCue();
  const recordForge = useRunStore((state) => state.recordForge);
  const completeStages = useRunStore((state) => state.completeStages);
  const [digits, setDigits] = useState<Digits>({
    topTens: 4,
    topOnes: 3,
    bottomTens: 2,
    bottomOnes: 1,
  });
  const [result, setResult] = useState<ForgeEvaluation | null>(null);
  const [misses, setMisses] = useState(0);
  const broken = result?.contradictsRule === true;
  const beat = useTimeline(broken, TRAP_MARKS);

  useEffect(() => {
    if (beat === TRAP_BEATS.clash) cue("break");
  }, [beat, cue]);

  if (boss === null) {
    return (
      <AppShell className="px-5 pt-6">
        <StageHeader title="Forge" stage={5} />
        <NoBossYet />
      </AppShell>
    );
  }

  const problem = {
    minuend: digits.topTens * 10 + digits.topOnes,
    subtrahend: digits.bottomTens * 10 + digits.bottomOnes,
  };
  const hints = forgeHints(boss.rule);

  const set = (key: keyof Digits) => (value: number) => {
    setResult(null);
    setDigits((current) => ({ ...current, [key]: value }));
  };

  const test = () => {
    const evaluation = evaluateForge(boss.rule, problem);
    setResult(evaluation);
    if (
      evaluation.contradictsRule &&
      evaluation.truthAnswer !== null &&
      evaluation.glitchAnswer !== null
    ) {
      recordForge({
        problem,
        truthAnswer: evaluation.truthAnswer,
        glitchAnswer: evaluation.glitchAnswer,
        attempts: misses + 1,
      });
      completeStages(["forge"]);
    } else {
      cue("tap");
      setMisses((count) => count + 1);
    }
  };

  const applyExample = (example: { minuend: number; subtrahend: number }) => {
    setResult(null);
    setDigits({
      topTens: Math.floor(example.minuend / 10),
      topOnes: example.minuend % 10,
      bottomTens: Math.floor(example.subtrahend / 10),
      bottomOnes: example.subtrahend % 10,
    });
  };

  const visibleHints = hints.slice(0, Math.max(0, misses - HINT_AFTER + 1));

  return (
    <AppShell className="space-y-5 px-5 pt-6">
      <StageHeader title="Forge" stage={5} />
      <p className="text-body font-bold text-ink">Build a problem that traps the boss.</p>

      <section className="rounded-xl bg-surface p-5 shadow-clay-2">
        <div className="flex items-center justify-center gap-2">
          <DigitStepper label="Top tens" min={1} value={digits.topTens} onChange={set("topTens")} />
          <DigitStepper label="Top ones" min={0} value={digits.topOnes} onChange={set("topOnes")} />
          <span className="px-2 text-h1 text-ink-muted">&minus;</span>
          <DigitStepper
            label="Bottom tens"
            min={1}
            value={digits.bottomTens}
            onChange={set("bottomTens")}
          />
          <DigitStepper
            label="Bottom ones"
            min={0}
            value={digits.bottomOnes}
            onChange={set("bottomOnes")}
          />
        </div>
        {broken ? null : (
          <button
            type="button"
            onClick={test}
            className="clay-interactive mt-6 h-14 w-full rounded-full bg-linear-to-b from-violet-500 to-violet-600 font-bold text-surface shadow-clay-raised active:translate-y-px active:shadow-clay-pressed"
          >
            Spring the trap
          </button>
        )}
      </section>

      {result === null ? null : broken ? (
        <>
          <TrapReplay
            problem={problem}
            rule={boss.rule}
            bossName={boss.card.name}
            bossId={boss.card.id}
            glyph={boss.card.glyph}
            beat={beat}
          />
          {beat >= TRAP_BEATS.broken ? (
            <PrimaryCta href="/explain">Why did it break?</PrimaryCta>
          ) : null}
        </>
      ) : (
        <p
          className="rounded-md bg-surface p-4 text-center text-small text-ink-soft shadow-clay-1"
          aria-live="polite"
        >
          {result.validProblem
            ? `The boss says ${String(result.glitchAnswer)}, and that one is right. Try another.`
            : "The top number needs to be bigger than the bottom one."}
        </p>
      )}

      {broken
        ? null
        : visibleHints.map((hint) => (
            <section key={hint.text} className="rounded-md bg-peach-100 p-4">
              <p className="text-small text-peach-700">{hint.text}</p>
              {hint.problem === null ? null : (
                <button
                  type="button"
                  onClick={() => {
                    if (hint.problem !== null) applyExample(hint.problem);
                  }}
                  className="mt-2 text-small font-bold text-peach-700 underline"
                >
                  Use this one
                </button>
              )}
            </section>
          ))}
    </AppShell>
  );
}
