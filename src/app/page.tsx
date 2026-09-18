"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { LockSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import avatarLearner from "@/assets/clay/avatar-learner.webp";
import bossIdle from "@/assets/clay/boss-free-ten-idle.webp";
import { AppShell } from "@/components/app/app-shell";
import { SectionHeading } from "@/components/app/section-heading";
import { ClayIcon } from "@/components/clay/clay-icon";

import { cx } from "@/lib/cx";
import { journeyStages, ruleLibrary } from "@/lib/journey";
import { useHydrated } from "@/lib/use-hydrated";
import { useRunStore } from "@/store/run-store";
import { toneSurfaces } from "@/components/clay/tones";
import { RuleArt, RuleChip } from "@/components/app/rule-glyph";

const totalStages = journeyStages.length;

export default function HomePage() {
  const hydrated = useHydrated();
  const completedStageIds = useRunStore((state) => state.completedStageIds);
  const done = hydrated ? completedStageIds.length : 0;
  const activeStage = Math.min(done + 1, totalStages);

  return (
    <AppShell className="px-5 pt-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-end justify-center overflow-hidden rounded-full bg-violet-100 shadow-clay-1 ring-2 ring-surface">
          <Image src={avatarLearner} alt="" width={43} height={56} className="translate-y-1" />
        </span>
        <div>
          <p className="text-small text-ink-muted">Hi, Learner 01</p>
          <h1 className="text-h2 text-ink">Ready to break a rule?</h1>
        </div>
      </header>

      <section className="relative mb-8 overflow-hidden rounded-xl bg-linear-to-br from-violet-400 to-violet-600 py-5 pr-28 pl-5 shadow-clay-2">
        <p className="text-small font-bold text-surface">Today&rsquo;s run</p>
        <p className="mt-1 mb-4 text-caption text-violet-100">
          {done >= totalStages
            ? "Run complete"
            : `Stage ${String(activeStage)} of ${String(totalStages)}`}{" "}
          &middot; Free Ten
        </p>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-violet-600">
          <div
            className="clay-progress-fill h-full rounded-full bg-peach-100"
            style={
              {
                "--clay-progress": `${String((activeStage / totalStages) * 100)}%`,
              } as CSSProperties
            }
          />
        </div>
        <Image
          src={bossIdle}
          alt=""
          width={60}
          height={181}
          className="absolute -right-1 -bottom-8"
        />
      </section>

      <section className="mb-8">
        <SectionHeading title="Rules to break" moreHref="/rules" />
        <ul className="grid grid-cols-2 gap-3">
          {ruleLibrary.map((rule) => (
            <li key={rule.id}>
              <Link
                href={rule.unlocked ? "/lab" : "/rules"}
                className={cx(
                  "clay-interactive relative flex h-32 flex-col items-center justify-center gap-2 rounded-xl p-3 shadow-clay-1 active:translate-y-px",
                  toneSurfaces[rule.tone],
                  rule.unlocked ? "" : "opacity-70",
                )}
              >
                {rule.unlocked ? null : (
                  <ClayIcon
                    glyph={LockSimpleIcon}
                    size="sm"
                    weight="fill"
                    className="absolute top-3 right-3 text-ink-muted"
                  />
                )}
                <RuleArt name={rule.glyph} size="lg" />
                <span className="text-small font-bold text-ink">{rule.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeading title="Continue" />
        <Link
          href="/lab"
          className="clay-interactive flex items-center gap-3 rounded-md bg-surface p-3 shadow-clay-1 active:translate-y-px"
        >
          <RuleChip name="stack" tone={toneSurfaces.mint} />
          <span className="flex-1">
            <span className="block text-small font-bold text-ink">Free Ten</span>
            <span className="block text-caption text-ink-muted">
              Subtraction &middot; 52 &minus; 28
            </span>
          </span>
          <span className="font-mono text-caption text-ink-muted">
            {activeStage}/{totalStages}
          </span>
        </Link>
      </section>
    </AppShell>
  );
}
