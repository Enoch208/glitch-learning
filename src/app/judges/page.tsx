"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { InstrumentSection } from "@/components/app/instrument";
import { useRunStore } from "@/store/run-store";

const script = [
  "Tap Next, then choose only A: give the ones 10 more.",
  "Write the answer the columns give you, then Done.",
  "Do the same on the next problem. A rule wakes up.",
  "Predict it, break it in the Forge, explain why, then solve one alone.",
];

export default function JudgesPage() {
  const router = useRouter();
  const resetRun = useRunStore((state) => state.resetRun);

  const start = () => {
    resetRun();
    router.push("/play");
  };

  return (
    <AppShell className="space-y-5 px-5 pt-8">
      <header>
        <p className="font-mono text-caption tracking-widest text-violet-500 uppercase">
          For judges
        </p>
        <h1 className="mt-2 text-h1 text-ink">Your mistake becomes the boss</h1>
        <p className="mt-2 text-small text-ink-soft">
          GLITCH watches how a learner subtracts, works out which rule explains their steps, turns
          that rule into an opponent, and lets them win only by proving it wrong.
        </p>
      </header>

      <button
        type="button"
        onClick={start}
        className="clay-interactive h-16 w-full rounded-full bg-linear-to-b from-violet-500 to-violet-600 text-body font-bold text-surface shadow-clay-raised active:translate-y-px"
      >
        Start the 90 second run
      </button>

      <InstrumentSection title="Play it as a learner with Free Ten">
        <ol className="space-y-2">
          {script.map((step, index) => (
            <li key={step} className="flex gap-3 text-small text-ink-soft">
              <span className="font-mono font-bold text-violet-500">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </InstrumentSection>

      <InstrumentSection title="Try another pattern">
        <p className="text-small text-ink-soft">
          Skip both regroup choices and take the smaller digit from the bigger in each column. The
          same engine finds Flip Flop instead. Answer correctly throughout and no boss appears.
        </p>
      </InstrumentSection>

      <InstrumentSection title="Look underneath">
        <div className="flex flex-col gap-2 text-small font-bold text-violet-500">
          <Link href="/lab">The lab: candidate rules and the next question, live</Link>
          <Link href="/eval">The evaluation: measured against three baselines</Link>
        </div>
      </InstrumentSection>
    </AppShell>
  );
}
