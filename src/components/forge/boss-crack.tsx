"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import bossDefeated from "@/assets/clay/boss-free-ten-defeated.webp";
import bossIdle from "@/assets/clay/boss-free-ten-idle.webp";
import { RuleArt } from "@/components/app/rule-glyph";
import type { RuleGlyphName } from "@/lib/journey";
import { cx } from "@/lib/cx";

const CRACK = "M22 2 L14 22 L26 34 L12 52 L24 66 L16 88 L22 98";

export function BossCrack({
  id,
  glyph,
  cracked,
}: {
  id: string;
  glyph: RuleGlyphName;
  cracked: boolean;
}) {
  const reduceMotion = useReducedMotion() === true;

  return (
    <div
      className={cx("flex h-32 w-20 items-end justify-center", cracked ? "rule-break-shake" : "")}
    >
      <div className="relative">
        {id === "free-ten" ? (
          <Image
            src={cracked ? bossDefeated : bossIdle}
            alt={cracked ? "The boss cracking apart" : "The boss, sure of its rule"}
            height={120}
            className="h-30 w-auto"
          />
        ) : (
          <RuleArt name={glyph} size="lg" className={cracked ? "opacity-60" : ""} />
        )}
        {cracked ? (
          <svg
            viewBox="0 0 40 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full"
          >
            <motion.path
              d={CRACK}
              fill="none"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="stroke-coral-700"
              initial={{ pathLength: reduceMotion ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
            />
          </svg>
        ) : null}
      </div>
    </div>
  );
}
