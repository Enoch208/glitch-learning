import { ruleLibrary, type RuleCard } from "@/lib/journey";
import { useHydrated } from "@/lib/use-hydrated";
import { useRunStore } from "@/store/run-store";

export type Discovery = {
  known: { card: RuleCard; found: boolean }[];
  induced: string[];
  found: number;
  findable: number;
};

export function useDiscovery(): Discovery {
  const hydrated = useHydrated();
  const discoveredRuleIds = useRunStore((state) => state.discoveredRuleIds);
  const discoveredInduced = useRunStore((state) => state.discoveredInduced);
  const ids = hydrated ? discoveredRuleIds : [];
  const induced = hydrated ? discoveredInduced : [];
  const known = ruleLibrary.map((card) => ({ card, found: ids.includes(card.id) }));

  return {
    known,
    induced,
    found: known.filter((entry) => entry.found).length + induced.length,
    findable: known.length + induced.length,
  };
}
