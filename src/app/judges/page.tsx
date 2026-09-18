"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { InstrumentSection } from "@/components/app/instrument";
import { HOOK_MARKS, HookOpener } from "@/components/judges/hook-opener";
import { ThreeLearners } from "@/components/judges/three-learners";
import { useTimeline } from "@/lib/use-timeline";
import { useRunStore } from "@/store/run-store";

export default function JudgesPage() {
  const router = useRouter();
  const startGuidedCase = useRunStore((state) => state.startGuidedCase);
  const beat = useTimeline(true, HOOK_MARKS);

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
        <h1 className="mt-2 text-h1 text-ink">A wrong answer has a rule inside it</h1>
      </header>

      <HookOpener beat={beat} />

      <p className="text-small text-ink-soft">
        Play one learner&rsquo;s reasoning. GLITCH finds the rule, turns it into a boss, and the
        learner breaks it with their own counterexample.
      </p>

      <button
        type="button"
        onClick={start}
        className="clay-interactive h-16 w-full rounded-full bg-linear-to-b from-violet-500 to-violet-600 text-body font-bold text-surface shadow-clay-raised active:translate-y-px"
      >
        Start the case
      </button>

      <InstrumentSection title="Same engine, three learners">
        <p className="mb-3 text-small text-ink-soft">
          Three learners answer the same problems, each following a different rule. Nothing here is
          scripted: the page runs the real diagnosis on their steps as it loads.
        </p>
        <ThreeLearners />
        <p className="mt-3 text-small text-ink-soft">
          Play it yourself: regroup correctly and no boss appears; take the smaller digit from the
          bigger and Flip Flop wakes instead.
        </p>
      </InstrumentSection>

      <InstrumentSection title="AI where language is fuzzy. Code where math must be true.">
        <p className="text-small text-ink-soft">
          The model proposes rules as small programs and reads the learner&rsquo;s explanation.
          Deterministic code runs every rule, checks every counterexample and decides every win.
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
