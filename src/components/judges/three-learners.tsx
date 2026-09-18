import { RuleArt } from "@/components/app/rule-glyph";
import { MysteryBadge } from "@/components/app/mystery-badge";
import { learnerResults as results } from "@/engine/game/three-learners";
import { ruleLibrary } from "@/lib/journey";

export function ThreeLearners() {
  return (
    <ul className="space-y-3">
      {results.map(({ label, observations, outcome }) => {
        const card =
          outcome.kind === "boss"
            ? ruleLibrary.find((entry) => entry.id === outcome.ruleId)
            : undefined;
        return (
          <li
            key={label}
            className="flex items-center gap-3 rounded-md bg-surface p-3 shadow-clay-1"
          >
            <div className="flex size-16 shrink-0 items-center justify-center">
              {card === undefined ? <MysteryBadge /> : <RuleArt name={card.glyph} size="lg" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-caption font-bold text-ink-muted">{label}</p>
              <p className="font-mono text-caption text-ink-soft">
                {observations
                  .map(
                    (observation) =>
                      `${String(observation.problem.minuend)}−${String(observation.problem.subtrahend)}→${String(observation.answer)}`,
                  )
                  .join("  ")}
              </p>
              <p className="mt-1 text-small font-bold text-ink">
                {card === undefined
                  ? `No boss after ${String(observations.length)} problems. No rule to fight.`
                  : `${card.name} wakes up after ${String(observations.length)} problems.`}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
