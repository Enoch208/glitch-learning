import { useMemo } from "react";
import { sessionOutcome } from "@/engine/game/session";
import { observationFromTrace } from "@/engine/learner/observation";
import { hypotheses } from "@/engine/learner/posterior";
import type { RuleProgram } from "@/engine/rules/ast";
import { inducedRuleVerified } from "@/engine/rules/induction";
import type { ReasoningTrace } from "@/events/trace";
import { ruleLibrary, type RuleCard } from "@/lib/journey";
import { useHydrated } from "@/lib/use-hydrated";
import { useRunStore } from "@/store/run-store";

export type ActiveBoss = { rule: RuleProgram; card: RuleCard; traces: ReasoningTrace[] };

const inducedCard = (rule: RuleProgram): RuleCard => ({
  id: "induced",
  name: rule.name,
  hint: "A rule GLITCH worked out from your steps",
  tone: "violet",
  glyph: "found",
});

export function useBoss(): ActiveBoss | null {
  const hydrated = useHydrated();
  const traces = useRunStore((state) => state.traces);
  const induced = useRunStore((state) => state.induced);

  return useMemo(() => {
    const recorded = hydrated ? traces : [];
    const observations = recorded.map(observationFromTrace);
    const outcome = sessionOutcome(observations);

    if (outcome.kind === "boss") {
      const hypothesis = hypotheses.find((entry) => entry.id === outcome.ruleId);
      const card = ruleLibrary.find((entry) => entry.id === outcome.ruleId);
      if (hypothesis === undefined || card === undefined) return null;
      return { rule: hypothesis.rule, card, traces: recorded };
    }

    if (hydrated && induced !== null && inducedRuleVerified(induced, observations)) {
      return { rule: induced, card: inducedCard(induced), traces: recorded };
    }

    return null;
  }, [hydrated, traces, induced]);
}
