"use client";

import { AnimatePresence, motion } from "motion/react";
import { cx } from "@/lib/cx";
import { BaseTenBlock } from "./base-ten-block";

const UNIT = 10;
const spring = { type: "spring", stiffness: 320, damping: 24 } as const;

export function PlaceValueTray({
  tens,
  ones,
  startOnes,
  tenBroken,
  glitching = false,
  className,
}: {
  tens: number;
  ones: number;
  startOnes: number;
  tenBroken: boolean;
  glitching?: boolean;
  className?: string | undefined;
}) {
  return (
    <div
      role="img"
      aria-label={`${String(tens)} tens and ${String(ones)} ones`}
      className={cx("grid grid-cols-2 gap-3 rounded-lg bg-surface-sunken p-3", className)}
    >
      <div>
        <p className="mb-2 font-mono text-caption tracking-widest text-ink-muted uppercase">Tens</p>
        <div className="flex h-28 items-end gap-1.5">
          <AnimatePresence initial={false}>
            {Array.from({ length: tens }, (_, index) => (
              <motion.div
                key={`rod-${String(index)}`}
                layout
                transition={spring}
                exit={{ opacity: 0, scaleY: 0.2, x: 40, transition: { duration: 0.35 } }}
                className={cx("origin-bottom", glitching ? "glitch-fringe-box" : "")}
              >
                <BaseTenBlock value={10} unit={UNIT} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div>
        <p className="mb-2 font-mono text-caption tracking-widest text-ink-muted uppercase">Ones</p>
        <div className="flex h-28 flex-col justify-end gap-1.5">
          <div className="flex min-h-2.5 gap-1">
            <AnimatePresence initial={false}>
              {Array.from({ length: Math.max(0, ones - startOnes) }, (_, index) => (
                <motion.div
                  key={`arrived-${String(index)}`}
                  layout
                  transition={{ ...spring, delay: index * 0.03 }}
                  initial={
                    tenBroken ? { opacity: 0, x: -90, y: -30 } : { opacity: 0, y: -24, scale: 0.4 }
                  }
                  animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.2 } }}
                  className={glitching && !tenBroken ? "glitch-fringe-box" : ""}
                >
                  <BaseTenBlock value={1} unit={UNIT} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(ones, startOnes) }, (_, index) => (
              <BaseTenBlock key={`kept-${String(index)}`} value={1} unit={UNIT} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
