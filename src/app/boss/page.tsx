"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import bossIdle from "@/assets/clay/boss-free-ten-idle.webp";
import labBackdrop from "@/assets/clay/lab-backdrop.webp";
import { AppShell } from "@/components/app/app-shell";
import { PrimaryCta } from "@/components/app/primary-cta";
import { RuleArt } from "@/components/app/rule-glyph";
import { TraceReview } from "@/components/app/trace-review";
import { ClayIcon } from "@/components/clay/clay-icon";
import { ClayTag } from "@/components/clay";
import { sessionOutcome } from "@/engine/game/session";
import { observationFromTrace } from "@/engine/learner/observation";
import { ruleLibrary } from "@/lib/journey";
import { useHydrated } from "@/lib/use-hydrated";
import { useRunStore } from "@/store/run-store";

export default function BossPage() {
  const hydrated = useHydrated();
  const traces = useRunStore((state) => state.traces);
  const recorded = hydrated ? traces : [];
  const outcome = sessionOutcome(recorded.map(observationFromTrace));
  const rule =
    outcome.kind === "boss" ? ruleLibrary.find((entry) => entry.id === outcome.ruleId) : undefined;
  const evidence = recorded.at(-1);

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
        {rule === undefined ? null : rule.id === "free-ten" ? (
          <Image
            src={bossIdle}
            alt="The rule GLITCH found, standing up as a character"
            width={73}
            height={220}
            className="animate-clay-pop absolute bottom-2 left-1/2 -translate-x-1/2"
            priority
          />
        ) : (
          <div className="animate-clay-pop absolute bottom-12 left-1/2 -translate-x-1/2">
            <RuleArt name={rule.glyph} size="lg" />
          </div>
        )}
        <Link
          href="/lab"
          aria-label="Back to the lab"
          className="clay-interactive absolute top-5 left-5 flex size-11 items-center justify-center rounded-md bg-surface text-ink shadow-clay-1 active:translate-y-px"
        >
          <ClayIcon glyph={ArrowLeftIcon} size="md" weight="bold" />
        </Link>
      </div>

      <div className="relative -mt-6 space-y-5 rounded-t-2xl bg-canvas px-5 pt-6">
        {rule === undefined ? (
          <div>
            <h1 className="text-h1 text-ink">No rule yet</h1>
            <p className="mt-2 text-small text-ink-soft">
              GLITCH needs a few more of your answers before a rule can wake up.
            </p>
            <div className="mt-6">
              <PrimaryCta href="/play">Keep going</PrimaryCta>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-small font-bold text-coral-700">A rule woke up</p>
                <h1 className="mt-1 text-h1 text-ink">{rule.name}</h1>
              </div>
              <ClayTag tone="coral">Stage 4</ClayTag>
            </div>
            <p className="text-small text-ink-soft">
              This rule seems to explain your steps. {rule.hint}.
            </p>
            {evidence === undefined ? null : <TraceReview trace={evidence} />}
            <p className="rounded-full bg-surface py-4 text-center text-small font-bold text-ink-muted shadow-clay-1">
              Breaking it comes next.
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}
