"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ClockIcon, SkullIcon, StackIcon } from "@phosphor-icons/react/dist/ssr";
import labBackdrop from "@/assets/clay/lab-backdrop.webp";
import bossDefeated from "@/assets/clay/boss-free-ten-defeated.webp";
import bossIdle from "@/assets/clay/boss-free-ten-idle.webp";
import { AppShell } from "@/components/app/app-shell";
import { MysteryBadge } from "@/components/app/mystery-badge";
import { PrimaryCta } from "@/components/app/primary-cta";
import { RuleArt } from "@/components/app/rule-glyph";
import { StageRow } from "@/components/app/stage-row";
import { ClayIcon, type ClayGlyph } from "@/components/clay/clay-icon";
import { ClayTag } from "@/components/clay";
import { journeyStages } from "@/lib/journey";
import { useBoss } from "@/lib/use-boss";
import { useHydrated } from "@/lib/use-hydrated";
import { stageStatusFor, useRunStore } from "@/store/run-store";

const meta: { glyph: ClayGlyph; label: string }[] = [
  { glyph: StackIcon, label: "7 stages" },
  { glyph: ClockIcon, label: "~6 min" },
  { glyph: SkullIcon, label: "1 boss" },
];

export default function RunPage() {
  const boss = useBoss();
  const hydrated = useHydrated();
  const completedStageIds = useRunStore((state) => state.completedStageIds);
  const completed = hydrated ? completedStageIds : [];
  const stages = journeyStages.map((stage) => ({
    ...stage,
    status: stageStatusFor(stage.id, completed),
  }));
  const nextStage = stages.find((stage) => stage.status === "active");
  const defeated = completed.includes("transfer");

  return (
    <AppShell>
      <div className="relative h-72 overflow-hidden bg-sky-100">
        <Image
          src={labBackdrop}
          alt=""
          fill
          sizes="24rem"
          className="object-cover object-bottom"
          priority
        />
        {boss === null ? (
          <MysteryBadge size="lg" className="absolute bottom-16 left-1/2 -translate-x-1/2" />
        ) : boss.card.id === "free-ten" ? (
          <Image
            src={defeated ? bossDefeated : bossIdle}
            alt={
              defeated ? "The Free Ten boss, broken" : "The Free Ten boss, holding its rod together"
            }
            width={defeated ? 113 : 73}
            height={220}
            className="absolute bottom-2 left-1/2 -translate-x-1/2"
            priority
          />
        ) : (
          <RuleArt
            name={boss.card.glyph}
            size="lg"
            className="absolute bottom-14 left-1/2 -translate-x-1/2"
          />
        )}
        <Link
          href="/"
          aria-label="Back to home"
          className="clay-interactive absolute top-5 left-5 flex size-11 items-center justify-center rounded-md bg-surface text-ink shadow-clay-1 active:translate-y-px"
        >
          <ClayIcon glyph={ArrowLeftIcon} size="md" weight="bold" />
        </Link>
      </div>

      <div className="relative -mt-6 rounded-t-2xl bg-canvas px-5 pt-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-small font-bold text-mint-700">Subtraction</p>
            <h1 className="mt-1 text-h1 text-ink">
              {boss === null ? "Mystery rule" : boss.card.name}
            </h1>
          </div>
          <ClayTag tone={defeated ? "mint" : "peach"}>
            {defeated
              ? "Defeated"
              : `Stage ${String(Math.min(completed.length + 1, stages.length))}`}
          </ClayTag>
        </div>

        <p className="mb-5 text-small text-ink-soft">
          {boss === null
            ? "There may be a rule hiding in how you subtract. GLITCH will find it, then you prove it wrong."
            : `${boss.card.hint}. Now prove it wrong.`}
        </p>

        <ul className="mb-8 flex gap-2">
          {meta.map((item) => (
            <li
              key={item.label}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-surface py-2 shadow-clay-1"
            >
              <ClayIcon glyph={item.glyph} size="sm" className="text-violet-500" />
              <span className="text-caption font-bold text-ink-soft">{item.label}</span>
            </li>
          ))}
        </ul>

        <h2 className="mb-3 text-body font-bold text-ink">Stages</h2>
        <ul className="mb-8 space-y-2">
          {stages.map((stage) => (
            <li key={stage.id}>
              <StageRow stage={stage} />
            </li>
          ))}
        </ul>

        {nextStage?.href === undefined ? (
          <p className="rounded-full bg-surface py-4 text-center text-small font-bold text-ink-muted shadow-clay-1">
            {nextStage === undefined
              ? "Every stage finished."
              : `${nextStage.title} is not built yet.`}
          </p>
        ) : (
          <PrimaryCta href={nextStage.href}>
            {completed.length > 0 ? "Continue" : "Start solving"}
          </PrimaryCta>
        )}
      </div>
    </AppShell>
  );
}
