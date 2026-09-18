"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import avatarLearner from "@/assets/clay/avatar-learner.webp";
import bossIdle from "@/assets/clay/boss-free-ten-idle.webp";
import { AppShell } from "@/components/app/app-shell";
import { SectionHeading } from "@/components/app/section-heading";

import { journeyStages } from "@/lib/journey";
import { useHydrated } from "@/lib/use-hydrated";
import { useRunStore } from "@/store/run-store";
import { useBoss } from "@/lib/use-boss";
import { useDiscovery } from "@/lib/use-discovery";
import { DiscoveryTile } from "@/components/app/discovery";
import { MysteryBadge } from "@/components/app/mystery-badge";
import { toneSurfaces } from "@/components/clay/tones";
import { RuleChip } from "@/components/app/rule-glyph";

const totalStages = journeyStages.length;

export default function HomePage() {
  const boss = useBoss();
  const discovery = useDiscovery();
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
          <h1 className="text-h2 text-ink">Ready to catch a glitch?</h1>
        </div>
      </header>

      <section className="relative mb-8 overflow-hidden rounded-xl bg-linear-to-br from-violet-500 to-violet-600 py-5 pr-28 pl-5 shadow-clay-2">
        <p className="text-small font-bold text-surface">Today&rsquo;s run</p>
        <p className="mt-1 mb-4 text-caption text-violet-50">
          {done >= totalStages
            ? "Run complete"
            : `Stage ${String(activeStage)} of ${String(totalStages)}`}{" "}
          &middot; {boss === null ? "Mystery rule" : boss.card.name}
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
        {boss?.card.id === "free-ten" ? (
          <Image
            src={bossIdle}
            alt=""
            width={60}
            height={181}
            className="absolute -right-1 -bottom-8"
          />
        ) : (
          <MysteryBadge className="absolute top-1/2 right-6 -translate-y-1/2" />
        )}
      </section>

      <section className="mb-8">
        <SectionHeading
          title={`Rules discovered ${String(discovery.found)} / ${String(discovery.findable)}`}
          moreHref="/rules"
        />
        <ul className="grid grid-cols-2 gap-3">
          {discovery.known.map(({ card, found }) => (
            <li key={card.id}>
              <DiscoveryTile card={card} found={found} />
            </li>
          ))}
          {discovery.induced.map((name) => (
            <li key={name}>
              <DiscoveryTile
                card={{ id: name, name, hint: "", tone: "violet", glyph: "found" }}
                found
              />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeading title="Continue" />
        <Link
          href="/run"
          className="clay-interactive flex items-center gap-3 rounded-md bg-surface p-3 shadow-clay-1 active:translate-y-px"
        >
          {boss === null ? (
            <MysteryBadge />
          ) : (
            <RuleChip name={boss.card.glyph} tone={toneSurfaces[boss.card.tone]} />
          )}
          <span className="flex-1">
            <span className="block text-small font-bold text-ink">
              {boss === null ? "Mystery rule" : boss.card.name}
            </span>
            <span className="block text-caption text-ink-muted">Two-digit subtraction</span>
          </span>
          <span className="font-mono text-caption text-ink-muted">
            {activeStage}/{totalStages}
          </span>
        </Link>
      </section>
    </AppShell>
  );
}
