import { useMemo } from "react";
import { sessionOutcome } from "@/engine/game/session";
import { observationFromTrace } from "@/engine/learner/observation";
import { hypotheses } from "@/engine/learner/posterior";
import type { RuleProgram } from "@/engine/rules/ast";
import type { ReasoningTrace } from "@/events/trace";
import { ruleLibrary, type RuleCard } from "@/lib/journey";
import { useHydrated } from "@/lib/use-hydrated";
import { useRunStore } from "@/store/run-store";

export type ActiveBoss = { rule: RuleProgram; card: RuleCard; traces: ReasoningTrace[] };

export function useBoss(): ActiveBoss | null {
  const hydrated = useHydrated();
  const traces = useRunStore((state) => state.traces);

  return useMemo(() => {
    const recorded = hydrated ? traces : [];
    const outcome = sessionOutcome(recorded.map(observationFromTrace));
    if (outcome.kind !== "boss") return null;

    const hypothesis = hypotheses.find((entry) => entry.id === outcome.ruleId);
    const card = ruleLibrary.find((entry) => entry.id === outcome.ruleId);
    if (hypothesis === undefined || card === undefined) return null;

    return { rule: hypothesis.rule, card, traces: recorded };
  }, [hydrated, traces]);
}
