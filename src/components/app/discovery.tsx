import Link from "next/link";
import { cx } from "@/lib/cx";
import type { RuleCard } from "@/lib/journey";
import { toneSurfaces } from "@/components/clay/tones";
import { MysteryBadge } from "./mystery-badge";
import { RuleArt, RuleChip } from "./rule-glyph";

export function DiscoveryTile({ card, found }: { card: RuleCard; found: boolean }) {
  return (
    <Link
      href="/rules"
      className={cx(
        "clay-interactive flex h-32 flex-col items-center justify-center gap-2 rounded-xl p-3 shadow-clay-1 active:translate-y-px",
        found ? toneSurfaces[card.tone] : "bg-surface-sunken ring-1 ring-violet-100",
      )}
    >
      {found ? <RuleArt name={card.glyph} size="lg" /> : <MysteryBadge />}
      <span className={cx("text-small font-bold", found ? "text-ink" : "text-ink-muted")}>
        {found ? card.name : "???"}
      </span>
    </Link>
  );
}

export function DiscoveryRow({
  card,
  found,
  defeated,
}: {
  card: RuleCard;
  found: boolean;
  defeated: boolean;
}) {
  return (
    <li className="flex items-center gap-3 rounded-md bg-surface p-3 shadow-clay-1">
      {found ? <RuleChip name={card.glyph} tone={toneSurfaces[card.tone]} /> : <MysteryBadge />}
      <span className="flex-1">
        <span className={cx("block text-small font-bold", found ? "text-ink" : "text-ink-muted")}>
          {found ? card.name : "???"}
        </span>
        <span className="block text-caption text-ink-muted">
          {defeated
            ? "Broken with your own counterexample, then beaten on a new problem"
            : found
              ? card.hint
              : "Not found yet"}
        </span>
      </span>
      {found ? (
        <span
          className={cx(
            "rounded-full px-2.5 py-1 text-caption font-bold",
            defeated ? "bg-mint-100 text-mint-700" : "bg-coral-100 text-coral-700",
          )}
        >
          {defeated ? "Defeated" : "Still standing"}
        </span>
      ) : null}
    </li>
  );
}

export function InducedRow({ name }: { name: string }) {
  return (
    <li className="flex items-center gap-3 rounded-md bg-surface p-3 shadow-clay-1">
      <MysteryBadge />
      <span className="flex-1">
        <span className="block text-small font-bold text-ink">{name}</span>
        <span className="block text-caption text-ink-muted">
          A rule GLITCH worked out from your steps
        </span>
      </span>
    </li>
  );
}
