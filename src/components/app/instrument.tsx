import type { ReactNode } from "react";

export function InstrumentSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-surface p-5 shadow-clay-1">
      <h2 className="mb-4 font-mono text-caption tracking-widest text-violet-500 uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Reading({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-violet-50 py-2 last:border-0">
      <span className="text-small text-ink-soft">
        {label}
        {note === undefined ? null : (
          <span className="block text-caption text-ink-muted">{note}</span>
        )}
      </span>
      <span className="font-mono text-small font-bold text-ink tabular-nums">{value}</span>
    </div>
  );
}
