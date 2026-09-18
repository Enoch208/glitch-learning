"use client";

import type { ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { cx } from "@/lib/cx";
import Image from "next/image";
import tenBurst from "@/assets/clay/ten-burst.webp";
import { BaseTenBlock } from "./base-ten-block";

const UNIT = 10;
const spring = { type: "spring", stiffness: 380, damping: 22, mass: 0.7 } as const;
const snap = { duration: 0 } as const;

function Zone({
  label,
  pressed,
  onToggle,
  action,
  children,
}: {
  label: string;
  pressed: boolean;
  onToggle?: (() => void) | undefined;
  action: string;
  children: ReactNode;
}) {
  const shared = "min-w-0 rounded-md text-left";

  if (onToggle === undefined) {
    return (
      <div className={shared}>
        <p className="mb-2 font-mono text-caption tracking-widest text-ink-muted uppercase">
          {label}
        </p>
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={pressed}
      aria-label={action}
      className={cx(shared, "clay-interactive -m-1 p-1 active:translate-y-px")}
    >
      <p className="mb-2 font-mono text-caption tracking-widest text-ink-muted uppercase">
        {label}
      </p>
      {children}
    </button>
  );
}

export function PlaceValueTray({
  tens,
  ones,
  startOnes,
  tenBroken,
  glitching = false,
  onTakeTen,
  onGiveOnes,
  hideWorth = false,
  className,
}: {
  tens: number;
  ones: number;
  startOnes: number;
  tenBroken: boolean;
  glitching?: boolean;
  onTakeTen?: (() => void) | undefined;
  onGiveOnes?: (() => void) | undefined;
  hideWorth?: boolean;
  className?: string | undefined;
}) {
  const reduceMotion = useReducedMotion() === true;
  const move = reduceMotion ? snap : spring;
  const extraOnes = Math.max(0, ones - startOnes);
  const keptOnes = Math.min(ones, startOnes);
  const worth = tens * 10 + ones;
  const startWorth = (tenBroken ? tens + 1 : tens) * 10 + startOnes;

  return (
    <LayoutGroup>
      <div
        role="group"
        aria-label={`${String(tens)} tens and ${String(ones)} ones. That is ${String(worth)}.`}
        className={cx("rounded-lg bg-surface-sunken p-3", className)}
      >
        <div className="grid grid-cols-2 gap-3">
          <Zone label="Tens" pressed={tenBroken} onToggle={onTakeTen} action="Tens give 1 away">
            <div className="relative flex h-28 items-end gap-1.5">
              {tenBroken && !reduceMotion ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.6, 1.05, 1.2] }}
                  transition={{ duration: 0.8, times: [0, 0.3, 1] }}
                  className="pointer-events-none absolute right-0 bottom-0"
                  aria-hidden="true"
                >
                  <Image src={tenBurst} alt="" height={112} className="h-28 w-auto" />
                </motion.div>
              ) : null}
              <AnimatePresence initial={false}>
                {Array.from({ length: tens }, (_, index) => (
                  <motion.div
                    key={`rod-${String(index)}`}
                    layout
                    transition={move}
                    initial={reduceMotion ? false : { opacity: 0, scaleY: 0.4 }}
                    animate={{ opacity: 1, scaleY: 1, x: 0 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, x: 56, scaleY: 0.35, transition: { duration: 0.35 } }
                    }
                    className={cx("origin-bottom", glitching ? "glitch-fringe-box" : "")}
                  >
                    <BaseTenBlock value={10} unit={UNIT} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Zone>
          <Zone
            label="Ones"
            pressed={extraOnes > 0}
            onToggle={onGiveOnes}
            action="Ones get 10 more"
          >
            <div className="flex h-28 flex-col justify-end gap-1.5">
              <div className="flex min-h-2.5 flex-wrap content-end gap-1">
                <AnimatePresence initial={false}>
                  {Array.from({ length: extraOnes }, (_, index) => (
                    <motion.div
                      key={`arrived-${String(index)}`}
                      layout
                      transition={{ ...move, delay: reduceMotion ? 0 : index * 0.028 }}
                      initial={
                        reduceMotion
                          ? false
                          : tenBroken
                            ? { opacity: 0, x: -72, y: -18, scale: 0.5 }
                            : { opacity: 0, y: -28, scale: 0.4 }
                      }
                      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.4, x: tenBroken ? -40 : 0, y: -12 }}
                      className={glitching && !tenBroken ? "glitch-fringe-box" : ""}
                    >
                      <BaseTenBlock value={1} unit={UNIT} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: keptOnes }, (_, index) => (
                  <BaseTenBlock key={`kept-${String(index)}`} value={1} unit={UNIT} />
                ))}
              </div>
            </div>
          </Zone>
        </div>
        {hideWorth ? null : (
          <p
            className={cx(
              "mt-3 text-center font-mono text-small tabular-nums",
              worth === startWorth ? "text-ink-muted" : "text-violet-600",
            )}
            aria-live="polite"
          >
            {String(tens)} {tens === 1 ? "ten" : "tens"} + {String(ones)}{" "}
            {ones === 1 ? "one" : "ones"} = {String(worth)}
          </p>
        )}
      </div>
    </LayoutGroup>
  );
}
