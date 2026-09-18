"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { PrimaryCta } from "@/components/app/primary-cta";
import { ClayIcon } from "@/components/clay/clay-icon";
import type { Observation } from "@/engine/learner/observation";
import { solveByColumns } from "@/engine/math/truth";
import { parseRule } from "@/engine/rules/ast";
import { inducedRuleVerified } from "@/engine/rules/induction";
import { useCue } from "@/lib/sound/use-cue";
import { useRunStore } from "@/store/run-store";

type Status = "testing" | "found" | "none";

const MIN_WRONG_FOR_INDUCTION = 2;

function EndCard({
  tone,
  title,
  detail,
  onPlayAgain,
}: {
  tone: "mint" | "peach";
  title: string;
  detail: string;
  onPlayAgain: () => void;
}) {
  return (
    <>
      <section
        className={
          tone === "mint"
            ? "rounded-xl bg-mint-100 p-5 text-center"
            : "rounded-xl bg-peach-100 p-5 text-center"
        }
      >
        {tone === "mint" ? (
          <span className="mb-3 inline-flex size-14 items-center justify-center rounded-full bg-surface text-mint-700 shadow-clay-1">
            <ClayIcon glyph={CheckCircleIcon} size="lg" weight="fill" />
          </span>
        ) : null}
        <p
          className={
            tone === "mint"
              ? "text-body font-bold text-mint-700"
              : "text-body font-bold text-peach-700"
          }
        >
          {title}
        </p>
        <p className="mt-1 text-small text-ink-soft">{detail}</p>
      </section>
      <button
        type="button"
        onClick={onPlayAgain}
        className="clay-interactive h-14 w-full rounded-full bg-linear-to-b from-violet-500 to-violet-600 font-bold text-surface shadow-clay-raised active:translate-y-px"
      >
        Try more problems
      </button>
      <PrimaryCta href="/">Back home</PrimaryCta>
    </>
  );
}

export function NoRuleResolution({
  observations,
  onPlayAgain,
}: {
  observations: Observation[];
  onPlayAgain: () => void;
}) {
  const router = useRouter();
  const cue = useCue();
  const recordInduced = useRunStore((state) => state.recordInduced);
  const completeStages = useRunStore((state) => state.completeStages);
  const wrong = observations.filter(
    (observation) => observation.answer !== solveByColumns(observation.problem).answer,
  ).length;
  const worthAsking = wrong >= MIN_WRONG_FOR_INDUCTION;
  const [status, setStatus] = useState<Status>(worthAsking ? "testing" : "none");
  const asked = useRef(false);

  useEffect(() => {
    if (!worthAsking || asked.current) return;
    asked.current = true;

    void fetch("/api/model/induce", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ observations }),
    })
      .then(
        (response) => response.json() as Promise<{ ranked?: { origin: string; rule: unknown }[] }>,
      )
      .then((result) => {
        const top = result.ranked?.[0];
        const parsed = parseRule(top?.rule);
        if (
          top?.origin === "induced" &&
          parsed.ok &&
          inducedRuleVerified(parsed.rule, observations)
        ) {
          recordInduced(parsed.rule);
          completeStages(["encounter", "observation", "diagnostic"]);
          setStatus("found");
        } else {
          setStatus("none");
        }
      })
      .catch(() => {
        setStatus("none");
      });
  }, [worthAsking, observations, recordInduced, completeStages]);

  if (!worthAsking) {
    return (
      <EndCard
        tone="mint"
        title="No glitch this time."
        detail="You regrouped each one. Nothing hid in the steps."
        onPlayAgain={onPlayAgain}
      />
    );
  }

  if (status === "testing") {
    return (
      <section className="rounded-xl bg-surface p-5 text-center shadow-clay-1" aria-live="polite">
        <p className="animate-pulse text-body font-bold text-violet-600">
          Testing possible rules&hellip;
        </p>
        <p className="mt-1 text-small text-ink-muted">Looking for a pattern in your steps.</p>
      </section>
    );
  }

  if (status === "found") {
    return (
      <>
        <section className="rounded-xl bg-violet-50 p-5 text-center" aria-live="polite">
          <p className="text-body font-bold text-violet-600">
            GLITCH found a new rule in your steps.
          </p>
        </section>
        <button
          type="button"
          onClick={() => {
            cue("boss");
            router.push("/boss");
          }}
          className="clay-interactive h-14 w-full rounded-full bg-linear-to-b from-violet-500 to-violet-600 font-bold text-surface shadow-clay-raised active:translate-y-px"
        >
          See what woke up
        </button>
      </>
    );
  }

  return (
    <EndCard
      tone="peach"
      title="No single glitch showed up."
      detail="The steps did not match one rule. You can try more."
      onPlayAgain={onPlayAgain}
    />
  );
}
