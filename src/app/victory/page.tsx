"use client";

import Image from "next/image";
import badgeStar from "@/assets/clay/badge-star.webp";
import bossDefeated from "@/assets/clay/boss-free-ten-defeated.webp";
import { AppShell } from "@/components/app/app-shell";
import { NoBossYet } from "@/components/app/no-boss-yet";
import { PrimaryCta } from "@/components/app/primary-cta";
import { CheckIcon, MinusIcon } from "@phosphor-icons/react/dist/ssr";
import { ClayIcon } from "@/components/clay/clay-icon";
import { buildHandoff } from "@/engine/game/handoff";
import { explanationAccepted } from "@/engine/learning/explanation";
import { runRule } from "@/engine/rules/interpreter";
import { cx } from "@/lib/cx";
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

  const explained = boss.traces.filter(
    (trace) => runRule(boss.rule, trace.problem).answer === trace.finalAnswer,
  ).length;
  const checks: [string, boolean][] = [
    [`Rule fits ${String(explained)} of ${String(boss.traces.length)} answers`, true],
    ["Predicted the boss", prediction !== null && prediction.predicted === prediction.bossAnswer],
    ["Built a counterexample", forge !== null],
    ["Explained the break", explanation !== null && explanationAccepted(explanation)],
    ["Solved a new problem with the right steps", transfers.some((transfer) => transfer.passed)],
  ];

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
            ? "You found the bad rule, broke it, and solved a new one without it."
            : "Your notes below show exactly what comes next."}
        </p>
      </section>

      <section className="rounded-xl bg-surface p-5 shadow-clay-2">
        <p className="mb-4 font-mono text-caption tracking-widest text-ink-muted uppercase">
          For the next tutor
        </p>
        <p className="mb-4 text-small text-ink-soft">
          The game was for the learner. This is the evidence for the tutor.
        </p>
        <ul className="mb-5 space-y-2">
          {checks.map(([label, done]) => (
            <li key={label} className="flex items-center gap-2 text-small font-bold text-ink">
              <span
                className={cx(
                  "flex size-6 shrink-0 items-center justify-center rounded-full",
                  done ? "bg-mint-100 text-mint-700" : "bg-surface-sunken text-ink-muted",
                )}
              >
                <ClayIcon glyph={done ? CheckIcon : MinusIcon} size="sm" weight="bold" />
              </span>
              {label}
            </li>
          ))}
        </ul>
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
