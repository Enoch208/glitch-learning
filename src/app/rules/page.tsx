import { LockSimpleIcon, TargetIcon } from "@phosphor-icons/react/dist/ssr";
import { AppShell } from "@/components/app/app-shell";
import { ClayIcon } from "@/components/clay/clay-icon";
import { cx } from "@/lib/cx";
import { ruleLibrary } from "@/lib/journey";
import { toneSurfaces } from "@/components/clay/tones";

export default function RulesPage() {
  return (
    <AppShell className="px-5 pt-8">
      <header className="mb-6">
        <p className="font-mono text-caption tracking-widest text-violet-500 uppercase">Library</p>
        <h1 className="mt-2 text-h1 text-ink">Rules</h1>
        <p className="mt-2 text-small text-ink-muted">
          Each one is a way of thinking that works, until it doesn&rsquo;t.
        </p>
      </header>

      <ul className="space-y-3">
        {ruleLibrary.map((rule) => (
          <li
            key={rule.id}
            className={cx(
              "flex items-center gap-3 rounded-md bg-surface p-3 shadow-clay-1",
              rule.unlocked ? "" : "opacity-70",
            )}
          >
            <span
              className={cx(
                "flex size-12 shrink-0 items-center justify-center rounded-sm",
                toneSurfaces[rule.tone],
              )}
            >
              <ClayIcon
                glyph={rule.unlocked ? TargetIcon : LockSimpleIcon}
                size="md"
                className="text-ink-soft"
              />
            </span>
            <span className="flex-1">
              <span className="block text-small font-bold text-ink">{rule.name}</span>
              <span className="block text-caption text-ink-muted">{rule.hint}</span>
            </span>
            <span className="font-mono text-caption text-ink-muted">
              {rule.unlocked ? "open" : "locked"}
            </span>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
