"use client";

import Image from "next/image";
import badgeStar from "@/assets/clay/badge-star.webp";
import bossDefeated from "@/assets/clay/boss-free-ten-defeated.webp";
import { AppShell } from "@/components/app/app-shell";
import { NoBossYet } from "@/components/app/no-boss-yet";
import { PrimaryCta } from "@/components/app/primary-cta";
import { buildHandoff } from "@/engine/game/handoff";
import { useBoss } from "@/lib/use-boss";
import { useRunStore } from "@/store/run-store";

export default function VictoryPage() {
  const boss = useBoss();
  const prediction = useRunStore((state) => state.prediction);
  const forge = useRunStore((state) => state.forge);
  const explanation = useRunStore((state) => state.explanation);
  const transfers = useRunStore((state) => state.transfers);

  if (boss === null) {
    return (
      <AppShell className="px-5 pt-8">
        <NoBossYet />
      </AppShell>
    );
  }

  const handoff = buildHandoff({
    ruleName: boss.card.name,
    traces: boss.traces,
    prediction,
    forge,
    explanation,
    transfers,
  });

  const notes: [string, string][] = [
    ["Rule seen", handoff.ruleObserved],
    ["Where it showed", handoff.evidence.join(", ")],
    ["Predicting the rule", handoff.prediction],
    ["Counterexample", handoff.counterexample],
    ["Explanation", handoff.explanation],
    ["On their own", handoff.transfer],
    ["Next step", handoff.nextStep],
  ];

  return (
    <AppShell className="space-y-6 px-5 pt-8">
      <section className="flex flex-col items-center text-center">
        <div className="relative">
          {boss.card.id === "free-ten" && handoff.defeated ? (
            <Image
              src={bossDefeated}
              alt="The Free Ten boss breaking apart"
              width={104}
              height={202}
            />
          ) : null}
          {handoff.defeated ? (
            <Image
              src={badgeStar}
              alt=""
              width={72}
              height={71}
              className="animate-clay-pop absolute -right-12 -bottom-2"
            />
          ) : null}
        </div>
        <p className="mt-4 font-mono text-caption tracking-widest text-violet-500 uppercase">
          {handoff.defeated ? "Rule defeated" : "Rule still standing"}
        </p>
        <h1 className="mt-2 text-h1 text-ink">
          {handoff.defeated ? `You broke ${boss.card.name}.` : "Almost there."}
        </h1>
        <p className="mt-2 text-small text-ink-muted">
          {handoff.defeated
            ? "You found where it fails, said why, and solved a new one alone."
            : "Your notes below show exactly what comes next."}
        </p>
      </section>

      <section className="rounded-xl bg-surface p-5 shadow-clay-2">
        <p className="mb-4 font-mono text-caption tracking-widest text-ink-muted uppercase">
          For the next tutor
        </p>
        <dl className="space-y-3">
          {notes.map(([term, detail]) => (
            <div key={term}>
              <dt className="text-caption font-bold text-ink-soft">{term}</dt>
              <dd className="text-small text-ink">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <PrimaryCta href="/">Back home</PrimaryCta>
    </AppShell>
  );
}
