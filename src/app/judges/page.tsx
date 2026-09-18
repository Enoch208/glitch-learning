"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { InstrumentSection } from "@/components/app/instrument";
import { useRunStore } from "@/store/run-store";

export default function JudgesPage() {
  const router = useRouter();
  const startGuidedCase = useRunStore((state) => state.startGuidedCase);

  const start = () => {
    startGuidedCase();
    router.push("/play");
  };

  return (
    <AppShell className="space-y-5 px-5 pt-8">
      <header>
        <p className="font-mono text-caption tracking-widest text-violet-500 uppercase">
          90 second guided case
        </p>
        <h1 className="mt-2 text-h1 text-ink">Your mistake becomes the boss</h1>
        <p className="mt-3 text-small text-ink-soft">
          A learner has a consistent subtraction misconception. Play through their reasoning and see
          whether GLITCH can uncover it, turn it into a boss, and let the learner beat it.
        </p>
      </header>

      <button
        type="button"
        onClick={start}
        className="clay-interactive h-16 w-full rounded-full bg-linear-to-b from-violet-500 to-violet-600 text-body font-bold text-surface shadow-clay-raised active:translate-y-px"
      >
        Start the case
      </button>

      <InstrumentSection title="Then play it your own way">
        <p className="text-small text-ink-soft">
          Regroup correctly throughout and no boss appears. Take the smaller digit from the bigger
          in each column and a different rule wakes up. The same engine decides every time.
        </p>
      </InstrumentSection>

      <InstrumentSection title="Look underneath">
        <div className="flex flex-col gap-2 text-small font-bold text-violet-500">
          <Link href="/lab">The lab: what GLITCH believes, and why it asks the next question</Link>
          <Link href="/eval">
            The evaluation: measured against three baselines and a live model
          </Link>
        </div>
      </InstrumentSection>
    </AppShell>
  );
}
