"use client";

import { useState } from "react";
import { CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { AppShell } from "@/components/app/app-shell";
import { NoBossYet } from "@/components/app/no-boss-yet";
import { PrimaryCta } from "@/components/app/primary-cta";
import { StageHeader } from "@/components/app/stage-header";
import { OwnWords } from "@/components/explain/own-words";
import { ClayIcon } from "@/components/clay/clay-icon";
import {
  conceptStatements,
  evaluateConcepts,
  explanationAccepted,
  type ExplanationEvaluation,
} from "@/engine/learning/explanation";
import { cx } from "@/lib/cx";
import { useBoss } from "@/lib/use-boss";
import { useRunStore } from "@/store/run-store";

const letters = ["A", "B", "C", "D", "E", "F"];

export default function ExplainPage() {
  const boss = useBoss();
  const forge = useRunStore((state) => state.forge);
  const recordExplanation = useRunStore((state) => state.recordExplanation);
  const completeStages = useRunStore((state) => state.completeStages);
  const [selected, setSelected] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(1);
  const [result, setResult] = useState<ExplanationEvaluation | null>(null);
  const [finished, setFinished] = useState(false);

  if (boss === null) {
    return (
      <AppShell className="px-5 pt-6">
        <StageHeader title="Why?" stage={6} />
        <NoBossYet />
      </AppShell>
    );
  }

  const toggle = (id: string) => {
    if (finished) return;
    setSelected((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  };

  const settle = (evaluation: ExplanationEvaluation, chosen: string[]) => {
    setResult(evaluation);
    if (explanationAccepted(evaluation) || evaluation.followUp === null) {
      recordExplanation({
        selected: chosen,
        missing: evaluation.conceptsMissing,
        coverage: evaluation.coverage,
        contradiction: evaluation.contradiction,
        followUpUsed: attempt > 1,
      });
      completeStages(["explain"]);
      setFinished(true);
    } else {
      setAttempt(2);
    }
  };

  const check = () => {
    settle(evaluateConcepts(selected, attempt), selected);
  };

  return (
    <AppShell className="space-y-5 px-5 pt-6">
      <StageHeader title="Why?" stage={6} />
      <p className="text-body font-bold text-ink">
        {forge === null
          ? "Why does the boss break?"
          : `Why was the boss wrong about ${String(forge.problem.minuend)} − ${String(forge.problem.subtrahend)}?`}
      </p>
      {finished ? null : (
        <OwnWords
          ruleName={boss.card.name}
          attempt={attempt === 1 ? 1 : 2}
          onEvaluated={(evaluation) => {
            settle(evaluation, evaluation.conceptsPresent);
          }}
        />
      )}
      <p className="text-small text-ink-muted">Or pick every idea that is true.</p>

      <ul className="space-y-2">
        {conceptStatements.map((statement, index) => {
          const on = selected.includes(statement.id);
          return (
            <li key={statement.id}>
              <button
                type="button"
                onClick={() => {
                  toggle(statement.id);
                }}
                aria-pressed={on}
                className={cx(
                  "clay-interactive flex min-h-16 w-full items-center gap-3 rounded-md px-3 py-2 text-left text-small font-bold shadow-clay-1 active:translate-y-px",
                  on
                    ? "bg-violet-50 text-violet-600 ring-2 ring-violet-300"
                    : "bg-surface text-ink",
                )}
              >
                <span
                  className={cx(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    on ? "bg-violet-500 text-surface" : "bg-violet-50 text-violet-600",
                  )}
                >
                  {on ? <ClayIcon glyph={CheckIcon} size="sm" weight="bold" /> : letters[index]}
                </span>
                <span className="flex-1">{statement.text}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {result?.followUp !== null && result !== null && !finished ? (
        <section className="rounded-md bg-peach-100 p-4" aria-live="polite">
          <p className="text-small font-bold text-peach-700">{result.followUp}</p>
          <p className="mt-1 text-caption text-peach-700">Change your picks, then check again.</p>
        </section>
      ) : null}

      {finished ? (
        <>
          <section
            className="rounded-md bg-mint-100 p-4 text-small font-bold text-mint-700"
            aria-live="polite"
          >
            {result !== null && explanationAccepted(result)
              ? "Those ideas are exactly why the rule broke."
              : "Let's see those ideas in action."}
          </section>
          <PrimaryCta href="/transfer">Prove it</PrimaryCta>
        </>
      ) : (
        <button
          type="button"
          onClick={check}
          disabled={selected.length === 0}
          className="clay-interactive h-14 w-full rounded-full bg-linear-to-b from-violet-500 to-violet-600 font-bold text-surface shadow-clay-raised active:translate-y-px disabled:pointer-events-none disabled:opacity-45"
        >
          Check my ideas
        </button>
      )}
    </AppShell>
  );
}
