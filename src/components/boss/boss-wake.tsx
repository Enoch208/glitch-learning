"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import bossIdle from "@/assets/clay/boss-free-ten-idle.webp";
import rodArt from "@/assets/clay/rod-ten.webp";
import { cx } from "@/lib/cx";
import { REVEAL_BEATS } from "./rule-replay";

export function BossWake({ beat }: { beat: number }) {
  const reduceMotion = useReducedMotion() === true;
  const awake = beat >= REVEAL_BEATS.embodied;

  return (
    <div className="absolute bottom-2 left-1/2 flex h-52 w-24 -translate-x-1/2 items-end justify-center">
      <AnimatePresence mode="wait">
        {awake ? (
          <motion.div
            key="awake"
            initial={reduceMotion ? false : { y: 24, scale: 0.8, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
            className="origin-bottom"
          >
            <Image
              src={bossIdle}
              alt="Free Ten wakes up, gripping the ten it never gave up"
              width={66}
              height={200}
              priority
            />
          </motion.div>
        ) : beat >= REVEAL_BEATS.acted ? (
          <motion.div
            key="rod"
            initial={reduceMotion ? false : { y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { scaleY: 1.15, scaleX: 0.8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={cx(
              "origin-bottom",
              beat === REVEAL_BEATS.glitch ? "glitch-fringe-box rule-break-shake" : "",
            )}
          >
            <Image
              src={rodArt}
              alt="A ten that was used but never left the tens"
              width={23}
              height={184}
              priority
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
