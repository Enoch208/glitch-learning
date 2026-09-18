"use client";

import { AppShell } from "@/components/app/app-shell";
import { RuleChip } from "@/components/app/rule-glyph";
import { ClayProgress, ClayTag } from "@/components/clay";
import { toneSurfaces } from "@/components/clay/tones";
import { solveByColumns } from "@/engine/math/truth";
import { journeyStages, ruleLibrary } from "@/lib/journey";
import { useHydrated } from "@/lib/use-hydrated";
import { useRunStore } from "@/store/run-store";

export default function ProgressPage() {
  const hydrated = useHydrated();
  const completedStageIds = useRunStore((state) => state.completedStageIds);
  const lastTrace = useRunStore((state) => state.lastTrace);

  const done = hydrated ? completedStageIds.length : 0;
  const total = journeyStages.length;

  return (
    <AppShell className="px-5 pt-8">
      <header className="mb-6">
        <p className="font-mono text-caption tracking-widest text-violet-500 uppercase">Your run</p>
        <h1 className="mt-2 text-h1 text-ink">Progress</h1>
      </header>

      <section className="mb-6 rounded-xl bg-surface p-5 shadow-clay-2">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-small font-bold text-ink">Stages finished</span>
          <span className="font-mono text-caption text-ink-muted">
            {done} of {total}
          </span>
        </div>
        <ClayProgress value={(done / total) * 100} label="Stages finished" />
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-body font-bold text-ink">Last thing you did</h2>
        {hydrated && lastTrace !== null ? (
          <div className="rounded-xl bg-surface p-5 shadow-clay-1">
            <div className="mb-3 flex items-center gap-2">
              {lastTrace.finalAnswer === solveByColumns(lastTrace.problem).answer ? (
                <ClayTag tone="mint">Correct</ClayTag>
              ) : (
                <ClayTag tone="coral">You said {lastTrace.finalAnswer}</ClayTag>
              )}
              <span className="font-mono text-caption text-ink-muted">
                {lastTrace.problem.minuend} &minus; {lastTrace.problem.subtrahend}
              </span>
            </div>
            <p className="text-small text-ink-soft">
              GLITCH recorded {lastTrace.events.length} steps, not just the answer.
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-surface p-5 shadow-clay-1">
            <p className="text-small text-ink-muted">
              Nothing yet. Finish a stage and it shows up here.
            </p>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-body font-bold text-ink">Rules</h2>
        <ul className="space-y-2">
          {ruleLibrary.map((rule) => (
            <li
              key={rule.id}
              className="flex items-center gap-3 rounded-md bg-surface p-3 shadow-clay-1"
            >
              <RuleChip name={rule.glyph} tone={toneSurfaces[rule.tone]} />
              <span className="flex-1 text-small font-bold text-ink">{rule.name}</span>
              <span className="font-mono text-caption text-ink-muted">
                {rule.unlocked ? "in play" : "locked"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
