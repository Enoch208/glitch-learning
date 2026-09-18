"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ONES_IN_A_TEN } from "@/engine/blocks/geometry";
import { composeValue, needsRegroup } from "@/engine/blocks/regroup";
import {
  REGROUP_STAGE_HOLDS,
  nextRegroupStage,
  type RegroupStage,
} from "@/engine/blocks/regroup-sequence";
import { cx } from "@/lib/cx";
import { BaseTenBlock } from "./base-ten-block";

const stageCaptions: Record<RegroupStage, string> = {
  ready: "Two tens and seven ones.",
  introduce: "Eight more ones arrive.",
  gather: "Find a group of ten.",
  snap: "Ten ones, lined up.",
  transform: "Ten ones become one ten.",
  move: "The new ten joins the tens.",
  settle: "Three tens and five ones.",
  done: "Three tens and five ones. That is 35.",
};

let pieceSequence = 0;
const makePieces = (prefix: string, count: number) =>
  Array.from({ length: count }, () => {
    pieceSequence += 1;
    return `${prefix}-${String(pieceSequence)}`;
  });

function Zone({
  label,
  count,
  children,
  className,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
  className?: string | undefined;
}) {
  return (
    <section
      className={cx(
        "relative flex min-h-80 flex-col rounded-xl bg-surface-sunken p-5 ring-1 ring-violet-50",
        className,
      )}
    >
      <header className="mb-4 flex items-baseline justify-between">
        <h3 className="font-mono text-caption tracking-widest text-ink-muted uppercase">{label}</h3>
        <span className="text-h2 text-ink tabular-nums">{count}</span>
      </header>
      {children}
    </section>
  );
}

export function PlaceValueCanvas() {
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState<RegroupStage>("ready");
  const [tens, setTens] = useState(() => makePieces("ten", 2));
  const [looseOnes, setLooseOnes] = useState(() => makePieces("one", 7));
  const [gathered, setGathered] = useState<string[]>([]);

  const speed = reduceMotion === true ? 0.01 : 1;
  const spring = useMemo(
    () => ({ type: "spring", stiffness: 260, damping: 26, mass: 0.9 }) as const,
    [],
  );

  const addEight = useCallback(() => {
    if (stage !== "ready") return;
    setLooseOnes((current) => [...current, ...makePieces("one", 8)]);
    setStage("introduce");
  }, [stage]);

  const reset = useCallback(() => {
    setStage("ready");
    setTens(makePieces("ten", 2));
    setLooseOnes(makePieces("one", 7));
    setGathered([]);
  }, []);

  useEffect(() => {
    const hold = REGROUP_STAGE_HOLDS[stage] * speed;
    const next = nextRegroupStage(stage);
    if (next === null) return;

    const timer = setTimeout(() => {
      if (stage === "introduce") {
        if (!needsRegroup({ tens: tens.length, ones: looseOnes.length })) {
          setStage("done");
          return;
        }
        setGathered(looseOnes.slice(0, ONES_IN_A_TEN));
        setLooseOnes((current) => current.slice(ONES_IN_A_TEN));
      }

      if (stage === "settle") {
        setTens((current) => [...current, ...makePieces("ten", 1)]);
        setGathered([]);
      }

      setStage(next);
    }, hold);

    return () => {
      clearTimeout(timer);
    };
  }, [stage, speed, looseOnes, tens.length]);

  const formingInOnes = stage === "gather" || stage === "snap" || stage === "transform";
  const formingInTens = stage === "move" || stage === "settle";
  const showRod = stage === "transform" || stage === "move" || stage === "settle";

  const tensCount = tens.length + (formingInTens ? 1 : 0);
  const onesCount = looseOnes.length + (formingInOnes ? gathered.length : 0);

  const formingRod = (
    <motion.div layoutId="forming-ten" layout transition={spring} className="origin-bottom">
      <BaseTenBlock value={10} />
    </motion.div>
  );

  const gatheredColumn = (
    <motion.div
      layout
      transition={spring}
      animate={stage === "snap" ? { scale: [1, 1.06, 1] } : { scale: 1 }}
      className="flex flex-col"
    >
      {gathered.map((id) => (
        <motion.div key={id} layoutId={id} layout transition={spring}>
          <BaseTenBlock value={1} />
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <div>
      <div className="grid grid-cols-2 gap-5">
        <Zone label="Tens" count={tensCount}>
          <div className="flex flex-wrap items-end gap-2">
            {tens.map((id) => (
              <motion.div key={id} layoutId={id} layout transition={spring}>
                <BaseTenBlock value={10} />
              </motion.div>
            ))}
            {formingInTens ? formingRod : null}
          </div>
        </Zone>

        <Zone label="Ones" count={onesCount}>
          <div className="flex max-w-40 flex-wrap content-start gap-2">
            <AnimatePresence initial={false}>
              {looseOnes.map((id) => (
                <motion.div
                  key={id}
                  layoutId={id}
                  layout
                  transition={spring}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <BaseTenBlock value={1} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {formingInOnes ? (
            <div className="absolute right-5 bottom-5">
              <AnimatePresence mode="popLayout" initial={false}>
                {showRod ? (
                  <motion.div key="rod" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {formingRod}
                  </motion.div>
                ) : (
                  <motion.div key="column" exit={{ opacity: 0 }}>
                    {gatheredColumn}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : null}
        </Zone>
      </div>

      <div className="mt-6 flex items-center justify-between gap-6">
        <p className="text-body text-ink" aria-live="polite">
          {stageCaptions[stage]}
        </p>
        <p className="font-mono text-small text-ink-muted tabular-nums">
          {tensCount} tens + {onesCount} ones = {composeValue({ tens: tensCount, ones: onesCount })}
        </p>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={addEight}
          disabled={stage !== "ready"}
          className="clay-interactive inline-flex h-12 items-center justify-center rounded-md bg-linear-to-b from-violet-500 to-violet-600 px-5 font-bold text-surface shadow-clay-raised active:translate-y-px active:shadow-clay-pressed disabled:pointer-events-none disabled:opacity-45"
        >
          Add 8 ones
        </button>
        <button
          type="button"
          onClick={reset}
          className="clay-interactive inline-flex h-12 items-center justify-center rounded-md bg-surface px-5 font-bold text-ink-soft shadow-clay-1 active:translate-y-px"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
