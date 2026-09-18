import { ruleLibrary, type RuleCard } from "@/lib/journey";
import { useHydrated } from "@/lib/use-hydrated";
import { useRunStore } from "@/store/run-store";

export type Discovery = {
  known: { card: RuleCard; found: boolean; defeated: boolean }[];
  induced: string[];
  found: number;
  defeated: number;
  findable: number;
};

export function useDiscovery(): Discovery {
  const hydrated = useHydrated();
  const discoveredRuleIds = useRunStore((state) => state.discoveredRuleIds);
  const discoveredInduced = useRunStore((state) => state.discoveredInduced);
  const defeatedRuleIds = useRunStore((state) => state.defeatedRuleIds);
  const ids = hydrated ? discoveredRuleIds : [];
  const induced = hydrated ? discoveredInduced : [];
  const defeatedIds = hydrated ? defeatedRuleIds : [];
  const known = ruleLibrary.map((card) => ({
    card,
    found: ids.includes(card.id),
    defeated: defeatedIds.includes(card.id),
  }));

  return {
    known,
    induced,
    found: known.filter((entry) => entry.found).length + induced.length,
    defeated: known.filter((entry) => entry.defeated).length,
    findable: known.length + induced.length,
  };
}
