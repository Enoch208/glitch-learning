"use client";

import { AppShell } from "@/components/app/app-shell";
import { DiscoveryRow, InducedRow } from "@/components/app/discovery";
import { ClayProgress, ClayTag } from "@/components/clay";
import { journeyStages } from "@/lib/journey";
import { useDiscovery } from "@/lib/use-discovery";
import { useHydrated } from "@/lib/use-hydrated";
import { useRunStore } from "@/store/run-store";

export default function ProgressPage() {
  const hydrated = useHydrated();
  const discovery = useDiscovery();
  const completedStageIds = useRunStore((state) => state.completedStageIds);
  const traces = useRunStore((state) => state.traces);
  const lastTrace = hydrated ? (traces.at(-1) ?? null) : null;

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
        {lastTrace !== null ? (
          <div className="rounded-xl bg-surface p-5 shadow-clay-1">
            <div className="mb-3 flex items-center gap-2">
              <ClayTag tone="violet">You answered {lastTrace.finalAnswer}</ClayTag>
              <span className="font-mono text-caption text-ink-muted">
                {lastTrace.problem.minuend} &minus; {lastTrace.problem.subtrahend}
              </span>
            </div>
            <p className="text-small text-ink-soft">
              {traces.length === 1
                ? "One puzzle so far."
                : `${String(traces.length)} puzzles so far.`}
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
        <h2 className="mb-3 text-body font-bold text-ink">
          Glitch Book: {discovery.found} found, {discovery.defeated} defeated
        </h2>
        <ul className="space-y-2">
          {discovery.known.map(({ card, found, defeated }) => (
            <DiscoveryRow key={card.id} card={card} found={found} defeated={defeated} />
          ))}
          {discovery.induced.map((name) => (
            <InducedRow key={name} name={name} />
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
