"use client";

import { AppShell } from "@/components/app/app-shell";
import { DiscoveryRow, InducedRow } from "@/components/app/discovery";
import { useDiscovery } from "@/lib/use-discovery";

export default function RulesPage() {
  const discovery = useDiscovery();

  return (
    <AppShell className="px-5 pt-8">
      <header className="mb-6">
        <p className="font-mono text-caption tracking-widest text-violet-500 uppercase">Library</p>
        <h1 className="mt-2 text-h1 text-ink">Rules</h1>
        <p className="mt-2 text-small text-ink-muted">
          {discovery.found} of {discovery.findable} discovered. Each one is a way of thinking that
          works, until it doesn&rsquo;t.
        </p>
      </header>

      <ul className="space-y-3">
        {discovery.known.map(({ card, found }) => (
          <DiscoveryRow key={card.id} card={card} found={found} />
        ))}
        {discovery.induced.map((name) => (
          <InducedRow key={name} name={name} />
        ))}
      </ul>
    </AppShell>
  );
}
