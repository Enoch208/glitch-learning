"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PrimaryCta } from "@/components/app/primary-cta";
import type { Observation } from "@/engine/learner/observation";
import { solveByColumns } from "@/engine/math/truth";
import { parseRule } from "@/engine/rules/ast";
import { inducedRuleVerified } from "@/engine/rules/induction";
import { useCue } from "@/lib/sound/use-cue";
import { useRunStore } from "@/store/run-store";

type Status = "testing" | "found" | "none";

const MIN_WRONG_FOR_INDUCTION = 2;

export function NoRuleResolution({ observations }: { observations: Observation[] }) {
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
      <>
        <section className="rounded-xl bg-mint-100 p-5 text-center">
          <p className="text-body font-bold text-mint-700">No rule to break this time.</p>
          <p className="mt-1 text-small text-ink-soft">Your regrouping held up every time.</p>
        </section>
        <PrimaryCta href="/">Back home</PrimaryCta>
      </>
    );
  }

  if (status === "testing") {
    return (
      <section className="rounded-xl bg-surface p-5 text-center shadow-clay-1" aria-live="polite">
        <p className="animate-pulse text-body font-bold text-violet-600">
          Testing possible rules&hellip;
        </p>
        <p className="mt-1 text-small text-ink-muted">
          None of GLITCH&rsquo;s rules fit your steps yet.
        </p>
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
          Meet the rule
        </button>
      </>
    );
  }

  return (
    <>
      <section className="rounded-xl bg-peach-100 p-5 text-center" aria-live="polite">
        <p className="text-body font-bold text-peach-700">No single rule explains these steps.</p>
        <p className="mt-1 text-small text-ink-soft">Your tutor can go through them with you.</p>
      </section>
      <PrimaryCta href="/">Back home</PrimaryCta>
    </>
  );
}
