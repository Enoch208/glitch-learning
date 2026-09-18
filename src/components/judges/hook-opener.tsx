"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { XIcon } from "@phosphor-icons/react/dist/ssr";
import bossIdle from "@/assets/clay/boss-free-ten-idle.webp";
import { PlaceValueTray } from "@/components/canvas/place-value-tray";
import { ClayIcon } from "@/components/clay/clay-icon";
import { freeTenRule } from "@/engine/rules/known-rules";
import { runRule } from "@/engine/rules/interpreter";
import { cx } from "@/lib/cx";

export const HOOK_MARKS = [900, 2600, 4000, 5400, 6600, 8200, 10000, 12000];

const HOOK = { wrong: 1, question: 2, rule: 3, blocks: 4, glitch: 5, fits: 6, boss: 7, line: 8 };

const problem = { minuend: 52, subtrahend: 28 };
const run = runRule(freeTenRule, problem);
const startTens = Math.floor(problem.minuend / 10);
const startOnes = problem.minuend % 10;

function Line({
  show,
  className,
  children,
}: {
  show: boolean;
  className?: string;
  children: string;
}) {
  const reduceMotion = useReducedMotion() === true;
  if (!show) return null;
  return (
    <motion.p
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {children}
    </motion.p>
  );
}

export function HookOpener({ beat }: { beat: number }) {
  const reduceMotion = useReducedMotion() === true;
  const acted = beat >= HOOK.glitch;
  const tens = acted ? run.tensTop : startTens;
  const ones = acted ? run.onesTop : startOnes;

  return (
    <section className="space-y-3 rounded-xl bg-surface p-4 shadow-clay-1" aria-live="polite">
      <div className="flex items-center justify-center gap-3">
        <p className="font-mono text-h1 text-ink tabular-nums">
          {problem.minuend} &minus; {problem.subtrahend} = {run.answer}
        </p>
        {beat >= HOOK.wrong && beat < HOOK.question ? (
          <motion.span
            initial={reduceMotion ? false : { scale: 1.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex size-10 items-center justify-center rounded-full bg-coral-100 text-coral-700"
            aria-label="Marked wrong"
          >
            <ClayIcon glyph={XIcon} size="md" weight="bold" />
          </motion.span>
        ) : null}
      </div>

      <Line show={beat >= HOOK.wrong} className="text-center text-small text-ink-soft">
        Most math apps see this and say &ldquo;wrong.&rdquo;
      </Line>
      <Line show={beat >= HOOK.question} className="text-center text-small font-bold text-ink">
        GLITCH asks a different question.
      </Line>
      <Line show={beat >= HOOK.rule} className="text-center text-h2 text-violet-600">
        {`What rule would make ${String(run.answer)} look right?`}
      </Line>

      {beat >= HOOK.blocks ? (
        <PlaceValueTray
          tens={tens}
          ones={ones}
          startOnes={startOnes}
          tenBroken={false}
          glitching={beat === HOOK.glitch}
          className="bg-canvas"
        />
      ) : null}

      <Line
        show={beat >= HOOK.glitch}
        className={cx(
          "text-center text-small font-bold text-coral-700",
          beat === HOOK.glitch ? "glitch-fringe" : "",
        )}
      >
        Ten ones appeared. No ten left the tens.
      </Line>
      <Line show={beat >= HOOK.fits} className="text-center font-mono text-small text-ink-soft">
        {`${String(run.onesTop)} − ${String(problem.subtrahend % 10)} = ${String(run.onesResult)}, ${String(run.tensTop)} − ${String(Math.floor(problem.subtrahend / 10))} = ${String(run.tensResult)}. That makes ${String(run.answer)}.`}
      </Line>

      {beat >= HOOK.boss ? (
        <motion.div
          initial={reduceMotion ? false : { y: 48, scale: 0.6, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 16 }}
          className="flex items-center justify-center gap-4 rounded-lg bg-coral-100 p-3"
        >
          <Image
            src={bossIdle}
            alt="Free Ten, gripping the ten it never gave up"
            height={96}
            className="h-24 w-auto"
          />
          <div>
            <p className="text-h1 tracking-wide text-coral-700 uppercase">Free Ten</p>
            <p className="text-small font-bold text-ink">Takes ten. Keeps the ten.</p>
          </div>
        </motion.div>
      ) : null}

      <Line show={beat >= HOOK.line} className="text-center text-body font-bold text-violet-600">
        Every wrong rule has a behavior. Find it, then break it.
      </Line>
    </section>
  );
}
