"use client";

import { FlippedOnes } from "@/components/boss/flipped-ones";
import { PlaceValueTray } from "@/components/canvas/place-value-tray";
import type { SubtractionProblem } from "@/engine/math/truth";
import type { RuleProgram } from "@/engine/rules/ast";
import { runRule } from "@/engine/rules/interpreter";
import { correctRule } from "@/engine/rules/known-rules";
import type { RuleGlyphName } from "@/lib/journey";
import { cx } from "@/lib/cx";
import { BossCrack } from "./boss-crack";

export const TRAP_BEATS = { boss: 1, math: 2, clash: 3, broken: 4 } as const;

function TrapRow({
  label,
  problem,
  rule,
  shown,
  glitching,
  tone,
}: {
  label: string;
  problem: SubtractionProblem;
  rule: RuleProgram;
  shown: boolean;
  glitching: boolean;
  tone: "boss" | "math";
}) {
  const run = runRule(rule, problem);
  const startTens = Math.floor(problem.minuend / 10);
  const startOnes = problem.minuend % 10;
  const flipped =
    tone === "boss" &&
    run.tensTop * 10 + run.onesTop === problem.minuend &&
    startOnes < problem.subtrahend % 10;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-small font-bold text-ink-soft">{label}</span>
        <span
          className={cx(
            "font-mono text-h2 tabular-nums",
            tone === "boss" ? "text-coral-700" : "text-mint-700",
            glitching ? "glitch-fringe" : "",
          )}
        >
          {shown ? run.answer : "…"}
        </span>
      </div>
      <PlaceValueTray
        tens={shown ? run.tensTop : startTens}
        ones={shown ? run.onesTop : startOnes}
        startOnes={startOnes}
        tenBroken={shown && run.tensTop < startTens}
        glitching={glitching}
        hideWorth
        className="mt-2 bg-surface"
      />
      {shown && flipped ? (
        <FlippedOnes problem={problem} glitching={glitching} className="mt-2" />
      ) : null}
    </div>
  );
}

export function TrapReplay({
  problem,
  rule,
  bossName,
  bossId,
  glyph,
  beat,
}: {
  problem: SubtractionProblem;
  rule: RuleProgram;
  bossName: string;
  bossId: string;
  glyph: RuleGlyphName;
  beat: number;
}) {
  const bossAnswer = runRule(rule, problem).answer;
  const truthAnswer = runRule(correctRule, problem).answer;
  const broken = beat >= TRAP_BEATS.broken;

  return (
    <section className="space-y-4 rounded-xl bg-coral-100 p-4 shadow-clay-2">
      <div className="flex items-center gap-4">
        <BossCrack id={bossId} glyph={glyph} cracked={broken} />
        <div className="flex-1" aria-live="polite">
          {broken ? (
            <>
              <p className="text-caption font-bold tracking-widest text-coral-700 uppercase">
                Rule broken
              </p>
              <p className="mt-1 text-body font-bold text-ink">You found where {bossName} fails.</p>
            </>
          ) : (
            <p className="text-body font-bold text-ink">
              {problem.minuend} &minus; {problem.subtrahend}. The boss tries its rule&hellip;
            </p>
          )}
        </div>
      </div>
      <TrapRow
        label={`${bossName}'s rule`}
        problem={problem}
        rule={rule}
        shown={beat >= TRAP_BEATS.boss}
        glitching={beat === TRAP_BEATS.boss}
        tone="boss"
      />
      {beat >= TRAP_BEATS.boss ? (
        <TrapRow
          label="Real math"
          problem={problem}
          rule={correctRule}
          shown={beat >= TRAP_BEATS.math}
          glitching={false}
          tone="math"
        />
      ) : null}
      {beat >= TRAP_BEATS.clash ? (
        <p className="rule-break-shake text-center font-mono text-h1 tabular-nums">
          <span className="text-coral-700">{bossAnswer}</span>
          <span className="px-3 text-ink">&ne;</span>
          <span className="text-mint-700">{truthAnswer}</span>
        </p>
      ) : null}
    </section>
  );
}
